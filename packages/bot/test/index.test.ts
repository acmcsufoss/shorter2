import { InteractionResponseType, InteractionType } from "discord-interactions";
import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyKeyMock = vi.fn();
const postMock = vi.fn();
const putMock = vi.fn();
const deleteMock = vi.fn();

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
	ShortlinkClient: class {
		post = (...args: unknown[]) => postMock(...args);
		put = (...args: unknown[]) => putMock(...args);
		delete = (...args: unknown[]) => deleteMock(...args);
	},
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
			JSON.stringify({
				type: InteractionType.PING,
			}),
		);

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({
			type: InteractionResponseType.PONG,
		});
	});

	it("blocks commands from the wrong guild before mutating resources", async () => {
		const response = await postInteraction(
			commandBody("add"),
			createEnv({ DISCORD_GUILD_ID: "different-guild" })
		);

		expect(postMock).not.toHaveBeenCalled();
		await expect(response.json()).resolves.toEqual({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: "Error: resource cannot be modified from this Discord server",
				flags: 64,
			},
		});
	});

	// it("rejects invalid add destinations without calling the service", async () => {
	// 	const response = await postInteraction(
	// 		commandBody("add", [{ name: "destination", value: "ftp://example.com" }]),
	// 	);
	//
	// 	expect(postMock).not.toHaveBeenCalled();
	// 	await expect(response.json()).resolves.toEqual({
	// 		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
	// 		data: {
	// 			content: ""
	// 		}
	// 	});
	// });
});
