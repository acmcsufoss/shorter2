# Shortlink Service

Links stored in Cloudflare D1 (sqlite).

Routes:
```
POST /_links             # Create new shortlink (auto-generate slug or custom) [protected]
PUT /_links/{slug}       # Update existing shortlink mapping [protected]
DELETE /_links/{slug}    # Delete a shortlink [protected]
GET /                    # List all shortlinks (for easy display on acmcsuf.com)
GET /{slug}              # Redirect to destination URL
GET /{slug}.svg          # Create and display QR code for shortlink
GET /docs                # OpenAPI Docs
```

# Auth:
One secret token generated with `openssl rand -hex 32` that's shared between
server and discord bot client. This way shortlinks can only be created by the
bot in the channel. Bot handles discord perms.
