import { Hono } from "hono";
import {
	InteractionResponseType,
	InteractionType,
	verifyKey,
} from "discord-interactions";
import { ADD_COMMAND, DELETE_COMMAND } from "./commands";
import { addLink, deleteLink } from "./client";

interface Env {
	DISCORD_APPLICATION_ID: string;
	DISCORD_PUBLIC_KEY: string;
}

const app = new Hono<{ Bindings: Env }>();

// Used to check if worker is running
app.get("/", (c) => {
	return c.text("Hi!");
});

/**
 * Main route for all requests sent from Discord.  All incoming messages will
 * include a JSON payload described here:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
app.post("/", async (c) => {
	// Required by Discord
	const signature = c.req.header("x-signature-ed25519");
	const timestamp = c.req.header("x-signature-timestamp");
	const body = await c.req.text();

	const isValidRequest =
		signature &&
		timestamp &&
		(await verifyKey(body, signature, timestamp, c.env.DISCORD_PUBLIC_KEY));

	if (!isValidRequest) {
		return c.text("Bad request signature.", 401);
	}

	const interaction = JSON.parse(body);

	// Required by Discord
	if (interaction.type === InteractionType.PING) {
		return c.json({
			type: InteractionResponseType.PONG,
		});
	}

	// ==== Our Application Commands ====
	if (interaction.type === InteractionType.APPLICATION_COMMAND) {
		switch (interaction.data.name.toLowerCase()) {
			case ADD_COMMAND.name.toLowerCase(): {
				const url = interaction.data.options?.find(
					(opt: any) => opt.name === "url",
				)?.value as string;

				const slug = interaction.data.options?.find(
					(opt: any) => opt.name === "shortlink",
				)?.value as string | undefined;

				const isPermanent = interaction.data.options?.find(
					(opt: any) => opt.name === "is_permanent",
				)?.value as boolean | undefined;

				try {
					// NOTE: If you capture the resp and try to read it this shi won't work
					await addLink({ slug: slug, url: url, isPermanent: isPermanent });
					return c.json({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							content: "Shortlink created successfully",
						},
					});
				} catch (error: any) {
					return c.json({
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							content: `Failed to create shortlink: ${error instanceof Error ? error.message : "Unknown error"}`,
						},
					});
				}
			}

			case DELETE_COMMAND.name.toLowerCase(): {
				const slug = interaction.data.options?.find(
					(opt: any) => opt.name === "slug",
				)?.value as string;

				await deleteLink(slug);
				return c.json({
					type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
					data: {
						content: "Shortlink deleted successfully",
					},
				});
			}
			default:
				return c.json({ error: "Unknown command type" }, 400);
		}
	}

	console.error("Unknown command type");
	return c.json({ error: "Unknown command type" }, 400);
});

app.all("*", (c) => c.text("Not Found.", 404));

export default app;
