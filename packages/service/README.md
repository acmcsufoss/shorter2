# Shortlink Service

REST API for creating and managing shortlinks. Built with Hono, Cloudflare Workers, and Workers KV.

## Features

- Create, read, update, and delete shortlinks
- Permanent and temporary link support
- Bearer token authentication for write operations
- OpenAPI documentation at root endpoint
- Public list and redirect endpoints

## API Endpoints

### Public Endpoints

- `GET /:slug` - Redirect to destination URL
- `GET /list` - List all shortlinks (cached)
- `GET /` - OpenAPI docs

### Authenticated Endpoints

Require `Authorization: Bearer <SHORTER_API_KEY>` header:

- `POST /links` - Create shortlink
- `PUT /links/:slug` - Update shortlink
- `DELETE /links/:slug` - Delete shortlink

## Development

```bash
bun run dev          # Start dev server on localhost:8787
bun run deploy       # Deploy to Cloudflare Workers
bun run cf-typegen   # Generate Cloudflare types
```

## Configuration

Set in Cloudflare dashboard or via `wrangler secret put`:

- `SHORTER_API_KEY` - Bearer token for API authentication

## Code Quality

```bash
bun run format   # Format with Biome
bun run lint     # Lint with Biome
bun run check    # Check formatting and linting
```
