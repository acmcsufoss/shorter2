# Shortlink Service

Links stored in Cloudflare D1 (sqlite).

Routes:
```
POST /_links             # Create new shortlink (auto-generate slug or custom) [protected]
DELETE /_links/{slug}    # Delete a shortlink [protected]
GET /                    # List all shortlinks (for easy display on acmcsuf.com)
GET /{slug}              # Redirect to destination URL
GET /{slug}.svg          # Create and display QR code for shortlink
GET /docs                # OpenAPI Docs
```

You may need to run `pnpx wrangler d1 migrations apply dev-d1-shortlinks` or something similar on first usage (make sure you're in `packages/service`).

# Auth:
One secret token generated with `openssl rand -hex 32` that's shared between
server and discord bot client. This way shortlinks can only be created by the
bot in the channel. Bot handles discord perms.
