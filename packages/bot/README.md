# Shortlink Discord Bot

Discord bot for managing shortlinks via slash commands. Built with Hono, Cloudflare Workers, and discord-interactions.

## Features

- Slash commands for creating, updating, and deleting shortlinks
- Request signature verification for Discord security
- Communicates with shortlink service via bearer token auth

## Commands

- `/add <destination> [alias] [is_permanent]` - Create a new shortlink
  - `destination` - URL to redirect to
  - `alias` - Optional custom slug (auto-generated if omitted)
  - `is_permanent` - Optional boolean for 301 vs 302 redirect

- `/delete <alias>` - Delete an existing shortlink
  - `alias` - Shortlink slug to delete

- `/update <alias> [destination] [is_permanent]` - Update an existing shortlink
  - `alias` - Existing shortlink slug
  - `destination` - Optional new URL
  - `is_permanent` - Optional redirect type change

## Development

```bash
pnpm install
pnpm run dev        # Start dev server on localhost:8787
pnpm run register   # Register slash commands with Discord
pnpm run ngrok      # Start ngrok tunnel for local testing
pnpm run deploy     # Deploy to Cloudflare Workers
```

## Configuration

Set in Cloudflare dashboard or via `wrangler secret put`:

- `DISCORD_APPLICATION_ID` - Your Discord application ID
- `DISCORD_PUBLIC_KEY` - Your Discord application public key
- `SHORTER_API_KEY` - Bearer token for service API

## Code Quality

```bash
pnpm run format   # Format with Biome
pnpm run lint     # Lint with Biome
pnpm run check    # Check formatting and linting
```
