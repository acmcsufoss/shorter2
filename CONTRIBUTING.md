# Getting Started
This app requires more setup to run locally than a traditional web app due to Discord applications needing a public endpoint. For local testing, we must create a new application with Discord and create an HTTP tunnel between our local dev server and a public endpoint. The only prerequisite is having Bun installed.

## Setting up the bot
1. Create a discord application for development on the [Discord Developer Dashboard](https://discord.com/developers/applications) (you can call it `shorter-dev` or something similar):

    1. After creating your app, copy your **Public Key** and **Application ID** and save them somewhere safe.
    1. Go to the *Bot* tab and copy your **token**, again saving it somewhere safe.

1. `cd` into the bot package directory.
1. Run `openssl rand -hex 32` to generate your `SHORTER_API_KEY`.
1. Create a local `.dev.vars` file by running `cp .dev.vars.example .dev.vars` and paste your newly obtained credentials into it.
1. Run `bun invite` and add the bot to a server you'd like to test it in.
1. Run `bun register` to register the app's commands with Discord.
1. Start a local dev server and create an HTTP tunnel:

    1. Run `bun dev` to start a local dev server on `localhost:8787`.
    1. Run `bun tunnel` in a different terminal, it should display a public URL that forwards the dev server you started in the previous step.
    1. Visit the URL in your browser. If you did everything correctly, you should see the message `Hi!`.

1. Paste your public URL into the *Interactions Endpoint URL* field back on the Discord Developer Dashboard.

## Setting up the shortlink service
1. `cd` into the service package directory.
1. Create a local `.dev.vars` file by running `cp .dev.vars.example .dev.vars` and paste your `SHORTER_API_KEY` into it.
1. Run `bun dev` in a third terminal to start a local dev server on `localhost:8788`.


# Submitting a PR

Make sure you run `bun check` in both packages before submitting. You can run `bun check:write` to apply any fixes the tool finds.

## References
- [Official Discord + Cloudflare Workers tutorial](https://discord.com/developers/docs/tutorials/hosting-on-cloudflare-workers)
- [Discord developer docs](https://discord.dev)
- [Tunnel Provider](https://dashboard.pinggy.io/)
