# Getting Started
This app requires more setup to run locally than a traditional web app due to Discord applications needing a public endpoint. For local testing, we must create a new application with Discord and use a tool like ngrok to create an HTTP tunnel between our local dev server and a public endpoint.

1. Create a discord application for development on the [Discord Developer Dashboard](https://discord.com/developers/applications) (you can call it `shorter-dev` or something similar)

    1. Copy your **Public Key** and **Application ID** and save them somewhere safe.
    1. Go to the *Bot* tab and copy your **token**, again storing it somewhere safe.
    1. Go to the *OAuth2* tab, choose the **URL Generator**, and click the **bot** and **application.commands** scopes.
    1. Select **Send Messages** and **Use Slash Commands** in *Bot Permissions*, then copy the *Generated URL*.
    1. Paste the URL into your browser, follow the OAuth flow, and invite the bot to a server where you'd like to test it.

1. Setup and start ngrok

    1.  `cd` into the bot package directory and run `bun run tunnel`
    1. Unless you've used ngrok before and already have it configured, it will prompt you to follow a link to create an account and authenticate the `ngrok` CLI. Note that you can use `bunx ngrok ...` instead of installing it globally.
    1. Run `bun run dev` to start a local dev server.
    1. Run `bun run tunnel` in a different terminal, this time it should display a public URL that forwards the dev server you started in the previous step.
    1. Visit the URL in your browser. If you did everything correctly, you should see the message `Hi!`.

1. Paste the ngrok URL into the *Interactions Endpoint URL* field back on the Discord Developer Dashboard.


# Submitting a PR


## References
- [Discord developer docs](https://discord.dev)
- [Official Discord + Cloudflare Workers tutorial](https://discord.com/developers/docs/tutorials/hosting-on-cloudflare-workers)
- [ngrok dashboard](https://dashboard.ngrok.com/get-started/setup/linux)
