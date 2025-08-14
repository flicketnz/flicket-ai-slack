# Flicket Slack AI Bot

## Getting Started (Development)

Follow these steps to get your development environment up and running:

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd flicket-ai-slackbot
   ```

1. **Install the Slack CLI** (if not already installed)

   ```sh
   curl -fsSL https://downloads.slack-edge.com/slack-cli/install.sh | bash
   ```

   If this installer outputs an error `⚠️ Failed to create a symbolic link!`, you will need to manually manage your PATH. The process is different depending on your setup - but here is the most basic verison (adapt to your needs)

   ```sh
   # this adds a line to the end of your `.zshenv` file to source the slack binary form where it was installed
   echo "export PATH=\"$HOME/.slack/bin:\$PATH\"" >> ${ZDOTDIR:-$HOME}/.zshenv
   ```

1. **Authenticate with Slack** (if not already authenticated)

   ```bash
   slack auth login
   ```

1. **Install dependencies in the `nestjs` folder**

   ```bash
   cd nestjs
   npm install
   ```

1. **Create a local Slack app**

   ```bash
   ./scripts/slack-create-local-app.bash
   ```

   _If your asked to update a manifest, you should reply in affirmatve (i.e. hit `y`)_

1. **Set up your environment variables**

   Copy the template file to create your local `.env` file:

   ```bash
   cp .env.template .env

   ```

1. **Start local services (for development)**
   Currently starts dynamodb

   ```bash
   docker compose up -d
   ```

1. **Start the development server**

   ```bash
   npm run start:dev
   ```

   _If your asked to update a manifest, you should reply in affirmatve (i.e. hit `y`)_

You may also want to use [mise](https://mise.jdx.dev/) - this repo is setup with a mise.toml file to manage tools and other things

## Troubleshooting

### Slack CLI Issues

- If the Slack CLI is not working as expected, ensure you are logged in:
  ```bash
  slack auth list
  slack auth login
  ```
  `slack auth list` will show your current authentication status. If you need to rotate your token, running `slack auth list` or `slack auth login` will help. Some scripts use the token from storage to interact directly with the API, so you may need to use the Slack CLI to perform token rotation.

### Viewing Local DynamoDB Tables

- To see what is being created in your local DynamoDB, use the AWS CLI. Configure it with the same credentials (i.e., secret/key) that your app uses in the `.env` file:
  ```bash
  AWS_ACCESS_KEY_ID='anykey' AWS_SECRET_ACCESS_KEY='anysecret' aws --region localhost --endpoint http://localhost:8000 dynamodb list-tables
  ```

## Deploying

Deployments are taken care of by github actions. but incase your wondering this is the flow of stuff that needs to happen.

- Checkout repo
- Install slack cli
- `npm ci` in `nestjs/`
- `npm ci` in `cdk/`
- Build the Dockerfile in `nestjs/`
- Run script `./nestjs/scripts/slack-deploy-prod.bash`
  - This does some maigc to auth the slack cli, then runs `slack deploy` with the app and team id's
    - Internally, it fetches the manifest - which in turn calls `./nestjs/scripts/slack-get-manifest.bash`
    - Then it executes the `deploy` hook in `./nestjs/.slack/hooks.json` which runs `cdk deploy` in the `./cdk` directory
- Once the deploy has finished (if its a first deploy) then
  - Add the correct values to the created secrets to SecretManager.
  - Add the RequestURL (in multiple places) in the slack app UI.
