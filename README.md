# Shorter V2

This is a rewrite of our link shortening app, shorter.

## Architecture

### Link Shortening Service
Located in `./packages/service`, this contains a simple REST API written with Hono + Workers,
and uses Workers KV for storing shortlinks.  
Endpoint: `https://s.acmcsuf.com`

### Discord Bot
Located in `./packages/bot`, this contains the Discord bot that will interact with the
service. Also written with Hono + Workers.  
Endpoint: `https://shorter-bot.acmcsuf.com` (not important for end users)

### Authentication
These two apps will share a secret key, allowing them to communicate and
preventing the link shortening service from being accessed by anything other
than the bot. The bot will handle permissions, which determines who is allowed
to invoke it, and in what channel.  

API Key generated with `openssl rand -hex 32`
