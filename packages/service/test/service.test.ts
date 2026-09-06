import { describe, expect, it } from "vitest";
import app from "../src/index";
import { getShortlinkBySlug } from "../src/repository/repository";

type ShortlinkRow = {
	url: string;
};

function createDb(
	rows: Record<string, ShortlinkRow>,
	onPrepare?: (sql: string) => void,
) {
	return {
		prepare(sql: string) {
			onPrepare?.(sql);
			return {
				bind(slug: string) {
					return {
						first: async () => rows[slug] ?? null,
					};
				},
			};
		},
	};
}

function createEnv(
	rows: Record<string, ShortlinkRow> = {},
	overrides: Partial<Env> = {},
): Env {
	return {
		DB: createDb(rows) as unknown as D1Database,
		ENVIRONMENT: "development",
		SHORTER_API_KEY: "test-api-key",
		...overrides,
	} as Env;
}

describe("shorter service", () => {
	it("requires bearer auth on protected routes in production", async () => {
		const response = await app.request(
			"/_links/example",
			undefined,
			createEnv({}, { ENVIRONMENT: "production" }),
		);

		expect(response.status).toBe(401);
	});

	it("redirects links with HTTP 302", async () => {
		const response = await app.request(
			"/temp-link",
			undefined,
			createEnv({
				"temp-link": {
					url: "https://example.com/temporary",
				},
			}),
		);

		expect(response.status).toBe(302);
		expect(response.headers.get("Location")).toBe(
			"https://example.com/temporary",
		);
	});

	it("uses HTTP 302 for every redirect", async () => {
		const response = await app.request(
			"/perm-link",
			undefined,
			createEnv({
				"perm-link": {
					url: "https://example.com/another-link",
				},
			}),
		);

		expect(response.status).toBe(302);
		expect(response.headers.get("Location")).toBe(
			"https://example.com/another-link",
		);
	});

	it("returns an SVG QR code for an existing shortlink", async () => {
		const response = await app.request(
			"/qr-link.svg",
			undefined,
			createEnv({
				"qr-link": {
					url: "https://example.com/qr-target",
				},
			}),
		);

		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toContain("image/svg+xml");
		expect(await response.text()).toContain("<svg");
	});

	it("returns a 404 payload for unknown slugs", async () => {
		const response = await app.request("/missing-link", undefined, createEnv());

		expect(response.status).toBe(404);
		await expect(response.json()).resolves.toEqual({
			success: false,
			errors: [
				{
					code: 7002,
					message: "Slug not found",
				},
			],
		});
	});

	it("queries only the destination URL", async () => {
		let preparedSql = "";
		const context = {
			env: {
				DB: createDb(
					{
						repository: {
							url: "https://example.com/from-repository",
						},
					},
					(sql) => {
						preparedSql = sql;
					},
				) as unknown as D1Database,
			},
		};

		const shortlink = await getShortlinkBySlug(context as never, "repository");

		expect(preparedSql).toBe("SELECT s.url FROM shortlinks s WHERE s.slug = ?");
		expect(shortlink).toEqual({
			url: "https://example.com/from-repository",
		});
	});
});
