Routes:
```
POST /links              # Create new shortlink (auto-generate slug or custom)
PUT /links/{slug}        # Update existing shortlink mapping
DELETE /links/{slug}     # Delete a shortlink
GET /links               # List all shortlinks (for easy display on acmcsuf.com)
GET /{slug}              # Redirect to destination URL
```

Auth:
One secret token generated with `openssl rand -hex 32` that's shared between
server and discord bot client. This way shortlinks can only be created by the
bot in the channel. Bot handles discord perms.

Caching:
Workers KV only gives 1,000 free list requests a day, so we need to cache the
list of shortlinks for display on the site.
The simplest solution might be:
1. Maintain the list in KV itself, as you get a much larger 100,000 requests a
   day.
