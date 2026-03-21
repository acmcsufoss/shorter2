import { InteractionResponseType, InteractionType } from "discord-interactions";
import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyKeyMock = vi.fn();
const addLinkMock = vi.fn();
const deleteLinkMock = vi.fn();
const updateLinkMock = vi.fn();

vi.mock("discord-interactions", async () => {
	const actual = await vi.importActual<typeof import("discord-interactions")>(
		"discord-interactions",
	);
	return {
		...actual,
		verifyKey: (...args: unknown[]) => verifyKeyMock(...args),
	};
});

vi.mock("../src/shorter-client", () => ({
	addLink: (...args: unknown[]) => addLinkMock(...args),
	deleteLink: (...args: unknown[]) => deleteLinkMock(...args),
	updateLink: (...args: unknown[]) => updateLinkMock(...args),
}));

const { default: app } = await import("../src/index");

function createEnv(overrides: Partial<Env> = {}): Env {
	return {
		DISCORD_PUBLIC_KEY: "public-key",
		DISCORD_GUILD_ID: "allowed-guild",
		SHORTER_API_KEY: "test-api-key",
		SHORTER_ENDPOINT: "https://s.acmcsuf.com",
		...overrides,
	} as Env;
}

function commandBody(
	subcommandName: string,
	options: Array<{ name: string; value: string | boolean }> = [],
	overrides: Record<string, unknown> = {},
) {
	return JSON.stringify({
		type: InteractionType.APPLICATION_COMMAND,
		guild_id: "allowed-guild",
		data: {
			name: "shorter2",
			options: [
				{
					name: subcommandName,
					type: 1,
					options,
				},
			],
		},
		...overrides,
	});
}

async function postInteraction(body: string, env: Env = createEnv()) {
	return app.request(
		"/",
		{
			method: "POST",
			headers: {
				"x-signature-ed25519": "signature",
				"x-signature-timestamp": "timestamp",
				"content-type": "application/json",
			},
			body,
		},
		env,
	);
}

beforeEach(() => {
	vi.clearAllMocks();
	verifyKeyMock.mockResolvedValue(true);
});

describe("bot interaction handler", () => {
	it("rejects requests with an invalid Discord signature", async () => {
		verifyKeyMock.mockResolvedValue(false);

		const response = await postInteraction(JSON.stringify({ type: InteractionType.PING }));

		expect(response.status).toBe(401);
		expect(await response.text()).toBe("Bad request signature.");
	});

	it("responds to Discord ping interactions", async () => {
		const response = await postInteraction(
			JSON.stringify({ type: InteractionType.PING }),
		);

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({
			type: InteractionResponseType.PONG,
		});
	});

	it("blocks commands from the wrong guild before mutating resources", async () => {
		const response = await postInteraction(
			commandBody("add"),
			createEnv({ DISCORD_GUILD_ID: "different-guild" }),
		);

		expect(addLinkMock).not.toHaveBeenCalled();
		await expect(response.json()).resolves.toEqual({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: "Error: resource cannot be modified from this Discord server",
			},
		});
	});

	it("rejects invalid add destinations without calling the service", async () => {
		const response = await postInteraction(
			commandBody("add", [{ name: "destination", value: "ftp://example.com" }]),
		);

		expect(addLinkMock).not.toHaveBeenCalled();
		await expect(response.json()).resolves.toEqual({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content:
					"Error: invalid URL. Does the destination URL start with `http://` or `https://`?",
			},
		});
	});

	it("surfaces service failures when creating links", async () => {
		addLinkMock.mockRejectedValue(new Error("HTTP 409: duplicate slug"));

		const response = await postInteraction(
			commandBody("add", [
				{ name: "destination", value: "https://example.com" },
				{ name: "alias", value: "example" },
			]),
		);

		expect(addLinkMock).toHaveBeenCalledWith(
			{
				slug: "example",
				url: "https://example.com",
				isPermanent: undefined,
			},
			"test-api-key",
		);
		await expect(response.json()).resolves.toEqual({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: "Failed to create shortlink: HTTP 409: duplicate slug",
			},
		});
	});

	it("rejects update commands that do not include any changes", async () => {
		const response = await postInteraction(
			commandBody("update", [{ name: "alias", value: "example" }]),
		);

		expect(updateLinkMock).not.toHaveBeenCalled();
		await expect(response.json()).resolves.toEqual({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: "Error: no modifications to shortlink provided",
			},
		});
	});

	it("reports delete failures as channel messages instead of throwing", async () => {
		deleteLinkMock.mockRejectedValue(new Error("HTTP 404: missing"));

		const response = await postInteraction(
			commandBody("delete", [{ name: "alias", value: "missing" }]),
		);

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: "Failed to delete shortlink: HTTP 404: missing",
			},
		});
	});

	it("describes update results with the updated redirect mode", async () => {
		updateLinkMock.mockResolvedValue({
			url: "https://example.com/new",
			isPermanent: true,
		});

		const response = await postInteraction(
			commandBody("update", [
				{ name: "alias", value: "example" },
				{ name: "destination", value: "https://example.com/new" },
				{ name: "is_permanent", value: true },
			]),
		);

		await expect(response.json()).resolves.toEqual({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content:
					"Shortlink updated: https://s.acmcsuf.com/example -> https://example.com/new and now redirects with HTTP 301",
			},
		});
	});
});
