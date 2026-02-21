import dotenv from "dotenv";
import open from "open";

dotenv.config({ path: ".dev.vars" });
const applicationId = process.env.DISCORD_APPLICATION_ID;
if (!applicationId) {
	console.error("Please set your DISCORD_APPLICATION_ID environment variable!")
	process.exit(1);
}
// Extracted from Disocrd's OAuth2 URL generator.
// Used 'Send Messages' and 'Use Slash Commands' bot permissions.
const permissions = 2147485696;

const generateInviteUrl = (clientId: string, permissions: number): string => {
	const url = new URL("https://discord.com/api/oauth2/authorize");
	url.searchParams.append('client_id', clientId);
	url.searchParams.append('permissions', permissions.toString());
	url.searchParams.append('integration_type', "0"); // Idk what this signifies
	url.searchParams.append('scope', 'bot applications.commands');
	return url.toString();
}

const inviteUrl = generateInviteUrl(applicationId, permissions);
console.log(`Opening invite URL: ${inviteUrl}`);
await open(inviteUrl);

