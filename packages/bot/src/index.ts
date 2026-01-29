import {
	InteractionResponseType,
	InteractionType,
	verifyKey,
} from "discord-interactions";
import { Hono } from "hono";
import { addLink, deleteLink, updateLink } from "./client";
import { SHORTER_COMMAND } from "./commands";

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

	// Helper function
	const sendChannelMessage = (message: string) => {
		return c.json({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: message,
			},
		});
	};

	// ==== Our Application Commands ====
	if (interaction.type === InteractionType.APPLICATION_COMMAND) {
		if (interaction.data.name.toLowerCase() !== "shorter") {
			return c.json({ error: "Unknown command type" }, 400);
		}

		const subcommand = interaction.data.options?.[0];
		if (!subcommand) {
			return c.json({ error: "No subcommand provided" }, 400);
		}

		switch (subcommand.name.toLowerCase()) {
			// ==== Add Subcommand =======================================================================
			case "add": {
				const url = subcommand.options?.find(
					(opt: any) => opt.name === "destination",
				)?.value as string;

				if (!isValidUrl(url)) {
					return sendChannelMessage(
						"Error: invalid URL. Does your URL start with http:// or https:// ?",
					);
				}

				const slug = subcommand.options?.find(
					(opt: any) => opt.name === "alias",
				)?.value as string | undefined;

				const isPermanent = subcommand.options?.find(
					(opt: any) => opt.name === "is_permanent",
				)?.value as boolean | undefined;

				try {
					// NOTE: If you capture the resp and try to read it this shi won't work
					await addLink(
						{ slug: slug, url: url, isPermanent: isPermanent },
						c.env.SHORTER_API_KEY,
					);
					return sendChannelMessage(
						`Shortlink created: https://s.acmcsuf.com/${slug} -> ${url}`,
					);
				} catch (error: any) {
					return sendChannelMessage(
						`Failed to create shortlink: ${error instanceof Error ? error.message : "Unknown error"}`,
					);
				}
			}

			// ==== Delete Subcommand ====================================================================
			case "delete": {
				const slug = subcommand.options?.find(
					(opt: any) => opt.name === "alias",
				)?.value as string;

				await deleteLink(slug, c.env.SHORTER_API_KEY);
				return sendChannelMessage(
					`Shortlink https://s.acmcsuf.com/${slug} deleted successfully`,
				);
			}

			// ==== Update Subcommand ====================================================================
			case "update": {
				const slug = subcommand.options?.find(
					(opt: any) => opt.name === "alias",
				)?.value as string;

				const url = subcommand.options?.find(
					(opt: any) => opt.name === "destination",
				)?.value as string | undefined;

				if (url && !isValidUrl(url)) {
					return sendChannelMessage(
						"Error: invalid URL. Does your URL start with http:// or https:// ?",
					);
				}

				const isPermanent = subcommand.options?.find(
					(opt: any) => opt.name === "is_permanent",
				)?.value as boolean | undefined;

				if (!url && isPermanent === undefined) {
					return sendChannelMessage(
						"Error: no modifications to shortlink provided",
					);
				}

				try {
					const resp = await updateLink(
						slug,
						{ url: url, isPermanent: isPermanent },
						c.env.SHORTER_API_KEY,
					);

					const parts = [];
					if (url) parts.push(`https://s.acmcsuf.com/${slug} -> ${resp.url}`);
					if (isPermanent !== undefined)
						parts.push(`now redirects with HTTP ${resp.isPermanent ? 301 : 302}`);
					return sendChannelMessage(
						`Shortlink created: ${parts.join(" and ")}`,
					);
				} catch (error: any) {
					return sendChannelMessage(
						`Failed to update shortlink: ${error instanceof Error ? error.message : "Unknown error"}`,
					);
				}
			}
			default:
				return c.json({ error: "Unknown command type" }, 400);
		}
	}

	console.error("Unknown command type");
	return c.json({ error: "Unknown command type" }, 400);
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
