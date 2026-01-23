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
