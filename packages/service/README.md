# Shortlink Service

REST API for creating and managing shortlinks. Built with Hono, Cloudflare Workers, and Workers KV.

## Features

- Create, read, and delete shortlinks
- HTTP 302 redirects for all shortlinks
- Bearer token authentication for write operations
- OpenAPI documentation at root endpoint
- Public list and redirect endpoints

## API Endpoints

### Public Endpoints

- `GET /:slug` - Redirect to destination URL
- `GET /` - List all shortlinks
- `GET /docs` - OpenAPI docs

### Authenticated Endpoints

Require `Authorization: Bearer <SHORTER_API_KEY>` header:

- `POST /_links` - Create shortlink
- `DELETE /_links/:slug` - Delete shortlink

## Development

```bash
pnpm run dev          # Start dev server on localhost:8787
pnpm run deploy       # Deploy to Cloudflare Workers
pnpm run cf-typegen   # Generate Cloudflare types
```

## Configuration

Set in Cloudflare dashboard or via `wrangler secret put`:

- `SHORTER_API_KEY` - Bearer token for API authentication

## Code Quality

```bash
pnpm run format   # Format with Biome
pnpm run lint     # Lint with Biome
pnpm run check    # Check formatting and linting
```
