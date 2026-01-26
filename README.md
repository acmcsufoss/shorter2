# Shorter V2

A link shortening service for ACM at CSUF, built with Cloudflare Workers.

## Overview

Shorter V2 consists of two services:

- **Service** (`./packages/service`) - REST API for managing shortlinks
- **Bot** (`./packages/bot`) - Discord bot interface for creating/managing links

Both services are deployed as Cloudflare Workers and communicate via a shared API key.

## Quick Start

```bash
# Install dependencies
bun install

# Development
cd packages/service && bun run dev
cd packages/bot && bun run dev

# Deploy
cd packages/service && bun run deploy
cd packages/bot && bun run deploy
```

## Configuration

Both services require environment variables (set in Cloudflare dashboard or via wrangler):

- `SHORTER_API_KEY` - Shared secret for service authentication (generate with `openssl rand -hex 32`)
- `DISCORD_APPLICATION_ID` - Discord app ID (bot only)
- `DISCORD_PUBLIC_KEY` - Discord public key (bot only)
- `DISCORD_TOKEN` - Discord bot secret token (bot only)

## Links

- Service: `https://s.acmcsuf.com`
- Bot endpoint: `https://shorter-bot.acmcsuf.com`
- API docs: `https://s.acmcsuf.com/` (OpenAPI)
