# App Agent & Assistant (FlicKAI)

This Slack app is built with Bolt for JavaScript.

## Setup

Before getting started, make sure you have a development workspace where you have permissions to install apps. If you don’t have one setup, go ahead and [create one](https://slack.com/create).

## Installation

You need the [slack cli](https://tools.slack.dev/slack-cli/guides/installing-the-slack-cli-for-mac-and-linux/)

```bash
# tl:dr;
curl -fsSL https://downloads.slack-edge.com/slack-cli/install.sh | bash
```

Then you need to login to slack:

```bash
slack auth login
```

Make sure you've run `npm install`.

```bash
npm install
```

Now you should be able to run the app locally for testing

```bash
slack run
```

### Environment Variables

Before you can successfully run the app, you'll need to store some environment variables.

**Mandatory** Variables to set

```ini
OPENROUTER_API_KEY = ""
# if this stops working, locate a new instance from https://searx.space/ that resolves with json format. i.e. https://searx.perennialte.ch/?format=json&q=trump%20news returns json
SEARXNG_API_BASE = "https://searx.perennialte.ch/"
```

**Optional** Variables
See all the variables in `config.ts` this is just a sample.

```ini
LOG_LEVEL = "DEBUG"
# OTEL http endpoint for telemetry
TRACELOOP_BASE_URL = "http://localhost:4318"
PORT = "3000"
```

### Linting

This project is setup with Biome - becasue it came default with the template form slack.

```zsh
# Run lint for code formatting and linting
npm run lint
```

## Project Structure

### `manifest.json`

`manifest.json` is a configuration for Slack apps. With a manifest, you can create an app with a pre-defined configuration, or adjust the configuration of an existing app.

This app is configured to be the source of truth for the manifest (i.e. a local manifest)

### `src/app.ts`

`src/app.ts` is the entry point for the application and is the file you'll run to start the server. This project aims to keep this file as thin as possible, primarily using it as a way to route inbound requests.

during local dev, when running `slack run` the slack-hooks will start a node process with `tsx` loaded to compile ts on the file. this means there is no precompile step required for local development. Unfortunatly at time of writing ive not found a way to watch for changes.
