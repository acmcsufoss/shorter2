import type { APIApplicationCommandInteractionDataSubcommandOption } from "discord-api-types/v10";
import {
	InteractionResponseType,
	InteractionType,
	verifyKey,
} from "discord-interactions";
import { Hono } from "hono";
import { SHORTER_COMMAND } from "../constants";
import { ShortlinkClient } from "./shorter-client";

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
	// Helper function
	const sendChannelMessage = (message: string, ephemeral = false) => {
		return c.json({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: message,
				...(ephemeral ? { flags: 64 } : {}),
			},
		});
	};

	try {
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

		// ==== Application Commands ===================================================================
		if (interaction.type === InteractionType.APPLICATION_COMMAND) {
			// This ensures that resources can only be modified from the appropriate discord server
			// Role or user specific auth should be configured from the Discord client
			if (interaction.guild_id !== c.env.DISCORD_GUILD_ID) {
				return sendChannelMessage(
					"Error: resource cannot be modified from this Discord server",
					true,
				);
			}

			if (
				interaction.data.name.toLowerCase() !== SHORTER_COMMAND.name.toLowerCase()
			) {
				return sendChannelMessage("Error: unknown command type", true);
			}

			const subcommand = interaction.data
				.options?.[0] as APIApplicationCommandInteractionDataSubcommandOption;
			if (!subcommand) {
				return sendChannelMessage("Error: no subcommand provided", true);
			}

			const client = new ShortlinkClient(c.env.SHORTER_API_KEY);

			switch (subcommand.name.toLowerCase()) {
				// ==== Add Subcommand =====================================================================
				case "add": {
					const url = subcommand.options?.find(
						(opt) => opt.name === "destination",
					)?.value as string;

					if (!isValidUrl(url)) {
						return sendChannelMessage(
							"Error: invalid URL. Does the destination URL start with `http://` or `https://`?",
							true,
						);
					}

					const slug = subcommand.options?.find((opt) => opt.name === "alias")
						?.value as string;

					const isPermanent = subcommand.options?.find(
						(opt) => opt.name === "is_permanent",
					)?.value as boolean | undefined;

					try {
						const result = await client.post({
							slug: slug,
							url: url,
							isPermanent: isPermanent,
						});
						return sendChannelMessage(
							`Shortlink created: https://s.acmcsuf.com/${result.slug} -> ${url}`,
						);
					} catch (error: unknown) {
						return sendChannelMessage(
							`Failed to create shortlink: ${error instanceof Error ? error.message : "Unknown error"}`,
							true,
						);
					}
				}

				// ==== Delete Subcommand ==================================================================
				case "delete": {
					const slug = subcommand.options?.find((opt) => opt.name === "alias")
						?.value as string;

					try {
						await client.delete(slug);
						return sendChannelMessage(
							`Shortlink https://s.acmcsuf.com/${slug} deleted successfully`,
						);
					} catch (error: unknown) {
						return sendChannelMessage(
							`Failed to delete shortlink: ${error instanceof Error ? error.message : "Unknown error"}`,
							true,
						);
					}
				}

				// ==== Update Subcommand ==================================================================
				case "update": {
					const slug = subcommand.options?.find((opt) => opt.name === "alias")
						?.value as string;

					const url = subcommand.options?.find(
						(opt) => opt.name === "destination",
					)?.value as string | undefined;

					if (url && !isValidUrl(url)) {
						return sendChannelMessage(
							"Error: invalid URL. Does the destination URL start with `http://` or `https://`?",
							true,
						);
					}

					const isPermanent = subcommand.options?.find(
						(opt) => opt.name === "is_permanent",
					)?.value as boolean | undefined;

					if (!url && isPermanent === undefined) {
						return sendChannelMessage(
							"Error: no modifications to shortlink provided",
							true,
						);
					}

					try {
						const resp = await client.put(slug, {
							url: url,
							isPermanent: isPermanent,
						});

						const parts = [];
						if (url)
							parts.push(`https://s.acmcsuf.com/${slug} -> ${resp.url}`);
						if (isPermanent !== undefined)
							parts.push(
								`now redirects with HTTP ${resp.isPermanent ? 301 : 302}`,
							);
						return sendChannelMessage(
							`Shortlink created: ${parts.join(" and ")}`,
						);
					} catch (error: unknown) {
						return sendChannelMessage(
							`Failed to update shortlink: ${error instanceof Error ? error.message : "Unknown error"}`,
							true,
						);
					}
				}
				default:
					return sendChannelMessage("Error: unknown subcommand", true);
			}
		}

		console.error("Unknown command type");
		return c.json({ error: "Unknown command type" }, 400);
	} catch (error) {
		console.error("Unhandled interaction error", error);
		return sendChannelMessage("Error: internal server error", true);
	}
});

function isValidUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return parsed.protocol === "http:" || parsed.protocol === "https:";
	} catch {
		return false;
	}
}

app.all("*", (c) => c.text("Not Found.", 404));

export default app;
