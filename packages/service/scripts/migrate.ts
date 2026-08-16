import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ShortlinkCreateRequest } from "@shorter2/types";

const DEFAULT_SOURCE_URL =
	"https://raw.githubusercontent.com/acmcsufoss/acmcsuf.com/refs/heads/main/src/lib/public/links/links.json";
const DEFAULT_SITE_BASE_URL = "https://acmcsuf.com";
const DEFAULT_SERVICE_ENDPOINT = "http://127.0.0.1:8788";

type LegacyLinks = Record<string, string>;

type ResolveResult =
	| {
			ok: true;
			url: string;
			steps: string[];
	  }
	| {
			ok: false;
			reason: string;
			steps: string[];
	  };

type MigrationCandidate =
	| {
			ok: true;
			slug: string;
			url: string;
			steps: string[];
	  }
	| {
			ok: false;
			slug: string;
			reason: string;
			steps: string[];
	  };

type ParsedArgs = {
	write: boolean;
	endpoint: string;
	source: string;
	siteBase: string;
};

function parseArgs(argv: string[]): ParsedArgs {
	let write = false;
	let endpoint =
		process.env.SHORTER_ENDPOINT ??
		process.env.SHORTER_SERVICE_URL ??
		DEFAULT_SERVICE_ENDPOINT;
	let source = process.env.LEGACY_LINKS_URL ?? DEFAULT_SOURCE_URL;
	let siteBase = process.env.LEGACY_SITE_BASE_URL ?? DEFAULT_SITE_BASE_URL;

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];
		if (arg === "--write") {
			write = true;
			continue;
		}

		if (arg === "--dry-run") {
			write = false;
			continue;
		}

		if (arg === "--endpoint") {
			const value = argv[index + 1];
			if (!value) {
				throw new Error("Missing value for --endpoint");
			}
			endpoint = value;
			index += 1;
			continue;
		}

		if (arg === "--source") {
			const value = argv[index + 1];
			if (!value) {
				throw new Error("Missing value for --source");
			}
			source = value;
			index += 1;
			continue;
		}

		if (arg === "--site-base") {
			const value = argv[index + 1];
			if (!value) {
				throw new Error("Missing value for --site-base");
			}
			siteBase = value;
			index += 1;
			continue;
		}

		if (arg === "--help" || arg === "-h") {
			printHelp();
			process.exit(0);
		}

		throw new Error(`Unknown argument: ${arg}`);
	}

	return { write, endpoint, source, siteBase };
}

function printHelp() {
	console.log(`Migrate legacy shortlinks into the shorter service.

Usage:
  bun run migrate [--dry-run] [--write] [--endpoint URL] [--source URL] [--site-base URL]

Options:
  --dry-run     Resolve and validate links without creating anything (default)
  --write       Create links in the shorter service
  --endpoint    Service base URL (default: ${DEFAULT_SERVICE_ENDPOINT})
  --source      Legacy links JSON URL
  --site-base   Base URL for non-shortlink relative paths (default: ${DEFAULT_SITE_BASE_URL})
`);
}

async function loadWranglerDevVars() {
	const scriptDir = dirname(fileURLToPath(import.meta.url));
	const devVarsPath = resolve(scriptDir, "../.dev.vars");

	try {
		await access(devVarsPath);
	} catch {
		return;
	}

	const text = await readFile(devVarsPath, "utf8");
	for (const rawLine of text.split(/\r?\n/u)) {
		const line = rawLine.trim();
		if (!line || line.startsWith("#")) {
			continue;
		}

		const separator = line.includes(":") ? ":" : "=";
		const separatorIndex = line.indexOf(separator);
		if (separatorIndex === -1) {
			continue;
		}

		const key = line.slice(0, separatorIndex).trim();
		if (!key || process.env[key] !== undefined) {
			continue;
		}

		let value = line.slice(separatorIndex + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}

		process.env[key] = value;
	}
}

function isAbsoluteHttpUrl(value: string): boolean {
	try {
		const parsed = new URL(value);
		return parsed.protocol === "http:" || parsed.protocol === "https:";
	} catch {
		return false;
	}
}

function joinPath(basePathname: string, suffixPathname: string): string {
	const baseParts = basePathname.split("/").filter(Boolean);
	const suffixParts = suffixPathname.split("/").filter(Boolean);
	return `/${[...baseParts, ...suffixParts].join("/")}`;
}

function extractAliasReference(value: string) {
	if (!value.startsWith("/")) {
		return null;
	}

	const parsed = new URL(value, DEFAULT_SITE_BASE_URL);
	const [, alias, ...rest] = parsed.pathname.split("/");
	if (!alias) {
		return null;
	}

	return {
		alias,
		suffixPathname: rest.length > 0 ? `/${rest.join("/")}` : "",
		search: parsed.search,
		hash: parsed.hash,
	};
}

function resolveLegacyTarget(
	slug: string,
	links: LegacyLinks,
	siteBase: string,
	seen = new Set<string>(),
): ResolveResult {
	const rawTarget = links[slug];
	if (typeof rawTarget !== "string" || rawTarget.trim().length === 0) {
		return {
			ok: false,
			reason: "legacy target is missing or empty",
			steps: [slug],
		};
	}

	if (seen.has(slug)) {
		return {
			ok: false,
			reason: "recursive shortlink cycle detected",
			steps: [...seen, slug],
		};
	}

	if (isAbsoluteHttpUrl(rawTarget)) {
		return {
			ok: true,
			url: rawTarget,
			steps: [...seen, slug],
		};
	}

	const nextSeen = new Set(seen);
	nextSeen.add(slug);

	const aliasReference = extractAliasReference(rawTarget);
	if (aliasReference && aliasReference.alias in links) {
		const nested = resolveLegacyTarget(
			aliasReference.alias,
			links,
			siteBase,
			nextSeen,
		);
		if (!nested.ok) {
			return nested;
		}

		const resolvedUrl = new URL(nested.url);
		if (aliasReference.suffixPathname) {
			resolvedUrl.pathname = joinPath(
				resolvedUrl.pathname,
				aliasReference.suffixPathname,
			);
		}
		if (aliasReference.search) {
			resolvedUrl.search = aliasReference.search;
		}
		if (aliasReference.hash) {
			resolvedUrl.hash = aliasReference.hash;
		}

		return {
			ok: true,
			url: resolvedUrl.toString(),
			steps: [...nested.steps, slug],
		};
	}

	if (rawTarget.startsWith("/")) {
		return {
			ok: true,
			url: new URL(rawTarget, siteBase).toString(),
			steps: [...nextSeen],
		};
	}

	return {
		ok: false,
		reason: `unsupported legacy target: ${rawTarget}`,
		steps: [...nextSeen],
	};
}

function buildCandidates(links: LegacyLinks, siteBase: string): MigrationCandidate[] {
	return Object.keys(links)
		.sort((left, right) => left.localeCompare(right))
		.map((slug) => {
			const resolved = resolveLegacyTarget(slug, links, siteBase);
			if (resolved.ok) {
				const parsed = ShortlinkCreateRequest.safeParse({
					slug,
					url: resolved.url,
				});

				if (!parsed.success) {
					return {
						ok: false,
						slug,
						reason: parsed.error.issues
							.map((issue) => issue.message)
							.join("; "),
						steps: resolved.steps,
					} satisfies MigrationCandidate;
				}

				return {
					ok: true,
					slug: parsed.data.slug,
					url: parsed.data.url,
					steps: resolved.steps,
				} satisfies MigrationCandidate;
			}

			if ("reason" in resolved) {
				return {
					ok: false,
					slug,
					reason: resolved.reason,
					steps: resolved.steps,
				} satisfies MigrationCandidate;
			}

			throw new Error(`Unexpected resolve result for slug "${slug}"`);
		});
}

async function fetchLegacyLinks(source: string): Promise<LegacyLinks> {
	const response = await fetch(source);
	if (!response.ok) {
		throw new Error(`Failed to fetch legacy links: ${response.status} ${response.statusText}`);
	}

	const payload = await response.json();
	if (
		payload === null ||
		typeof payload !== "object" ||
		Array.isArray(payload)
	) {
		throw new Error("Legacy links payload must be a JSON object");
	}

	const links: LegacyLinks = {};
	for (const [slug, value] of Object.entries(payload)) {
		if (typeof value !== "string") {
			throw new Error(`Legacy slug "${slug}" is not mapped to a string value`);
		}
		links[slug] = value;
	}

	return links;
}

async function getExistingShortlink(
	endpoint: string,
	apiKey: string,
	slug: string,
): Promise<boolean> {
	const response = await fetch(`${endpoint}/_links/${encodeURIComponent(slug)}`, {
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
	});

	if (response.status === 404) {
		return false;
	}

	if (!response.ok) {
		throw new Error(
			`Failed checking existing slug "${slug}": ${response.status} ${response.statusText}`,
		);
	}

	return true;
}

async function createShortlink(
	endpoint: string,
	apiKey: string,
	slug: string,
	url: string,
) {
	const response = await fetch(`${endpoint}/_links`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			slug,
			url,
		} satisfies ShortlinkCreateRequest),
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(
			`Failed creating "${slug}": ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`,
		);
	}
}

async function main() {
	await loadWranglerDevVars();

	const args = parseArgs(process.argv.slice(2));
	const apiKey = process.env.SHORTER_API_KEY;
	if (!apiKey) {
		throw new Error(
			"SHORTER_API_KEY is required. Set it in the environment or packages/service/.dev.vars.",
		);
	}

	const legacyLinks = await fetchLegacyLinks(args.source);
	const candidates = buildCandidates(legacyLinks, args.siteBase);

	const validCandidates = candidates.filter(
		(candidate): candidate is Extract<MigrationCandidate, { ok: true }> =>
			candidate.ok,
	);
	const skippedCandidates = candidates.filter(
		(candidate): candidate is Extract<MigrationCandidate, { ok: false }> =>
			!candidate.ok,
	);

	console.log(
		`Resolved ${validCandidates.length} migratable links and ${skippedCandidates.length} skipped links from ${Object.keys(legacyLinks).length} legacy entries.`,
	);

	for (const skipped of skippedCandidates) {
		console.warn(
			`skip ${skipped.slug}: ${skipped.reason}${skipped.steps.length > 0 ? ` (${skipped.steps.join(" -> ")})` : ""}`,
		);
	}

	if (!args.write) {
		for (const candidate of validCandidates) {
			console.log(`dry-run ${candidate.slug} -> ${candidate.url}`);
		}
		console.log("Dry run complete. Re-run with --write to create the links.");
		return;
	}

	let created = 0;
	let alreadyExists = 0;
	let failed = 0;

	for (const candidate of validCandidates) {
		try {
			const exists = await getExistingShortlink(
				args.endpoint,
				apiKey,
				candidate.slug,
			);
			if (exists) {
				alreadyExists += 1;
				console.log(`exists ${candidate.slug}`);
				continue;
			}

			await createShortlink(args.endpoint, apiKey, candidate.slug, candidate.url);
			created += 1;
			console.log(`created ${candidate.slug} -> ${candidate.url}`);
		} catch (error) {
			failed += 1;
			console.error(
				`failed ${candidate.slug}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	console.log(
		`Migration complete. created=${created} exists=${alreadyExists} skipped=${skippedCandidates.length} failed=${failed}`,
	);

	if (failed > 0) {
		process.exitCode = 1;
	}
}

await main();
