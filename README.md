# Flicket Slack AI Bot

## Getting Started (Development)

Follow these steps to get your development environment up and running:

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd flicket-ai-slackbot
   ```

1. **Install the Slack CLI** (if not already installed)

   ```bash
   curl -fsSL https://downloads.slack-edge.com/slack-cli/install.sh | bash
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
