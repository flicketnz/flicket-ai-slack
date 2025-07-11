# Slack AI Assistant Bot with LangChain

This Slack bot template demonstrates how to build [Agents & Assistants](https://api.slack.com/docs/apps/ai) in Slack using LangChain with pluggable LLM providers.

The bot uses a flexible architecture that allows easy swapping between different LLM providers like OpenRouter, OpenAI, Anthropic, and more. Currently, it's configured to use OpenRouter, which provides access to a wide variety of models through a single API.

## Features

- 🔌 **Pluggable LLM Providers**: Easy to switch between different LLM services
- 🎯 **OpenRouter Integration**: Access to multiple models (Qwen, Claude, GPT-4, Llama, etc.)
- ⚙️ **Centralized Configuration**: Environment-based configuration management
- 🔧 **Type Safety**: Clean abstractions and error handling
- 📝 **Context Awareness**: Maintains conversation context and channel history
- 🚀 **Production Ready**: Proper logging, validation, and error handling

## Available Models (via OpenRouter)

- `qwen/qwq-32b-preview` (default) - Great reasoning capabilities
- `anthropic/claude-3.5-sonnet` - Excellent for analysis and writing
- `openai/gpt-4o` - Latest GPT-4 model
- `openai/gpt-4o-mini` - Cost-effective GPT-4 variant
- `meta-llama/llama-3.1-405b-instruct` - Large open-source model
- `google/gemini-pro-1.5` - Google's latest model
- `mistralai/mistral-large` - European model with strong capabilities

## Setup

Before getting started, make sure you have a development workspace where you have permissions to install apps. If you don't have one setup, go ahead and [create one](https://slack.com/create).

### Developer Program

Join the [Slack Developer Program](https://api.slack.com/developer-program) for exclusive access to sandbox environments for building and testing your apps, tooling, and resources created to help you build and grow.

## Installation

### Create a Slack App

1. Open [https://api.slack.com/apps/new](https://api.slack.com/apps/new) and
   choose "From an app manifest"
2. Choose the workspace you want to install the application to
3. Copy the contents of [manifest.json](./manifest.json) into the text box that
   says `*Paste your manifest code here*` (within the JSON tab) and click _Next_
4. Review the configuration and click _Create_
5. You'll then be redirected to App Settings. Visit the **Install App** page and install your app.

### Environment Variables

Before you can run the app, you'll need to store some environment variables.

1. Copy `.env.example` to `.env`
2. Open your apps setting page from
   [this list](https://api.slack.com/apps), click _OAuth & Permissions_ in the
   left hand menu, then copy the _Bot User OAuth Token_ into your `.env` file
   under `SLACK_BOT_TOKEN`
3. Click _Basic Information_ from the left hand menu and follow the steps in the
   _App-Level Tokens_ section to create an app-level token with the
   `connections:write` scope. Copy that token into your `.env` as
   `SLACK_APP_TOKEN`.

#### LLM Provider Setup (OpenRouter)

1. Get an API key from [OpenRouter](https://openrouter.ai/keys)
2. Add it to your `.env` file as `OPENROUTER_API_KEY`
3. Optionally configure other LLM settings:
   - `LLM_MODEL`: Choose from available models (default: `qwen/qwq-32b-preview`)
   - `LLM_MAX_TOKENS`: Maximum tokens for responses (default: 2000)
   - `LLM_TEMPERATURE`: Response creativity (default: 0.7)

### Local Project

```zsh
# Clone this project onto your machine
git clone https://github.com/your-repo/slack-ai-assistant.git

# Change into this project directory
cd slack-ai-assistant

# Install dependencies
npm install

# Run Bolt server
npm start
```

### Linting

```zsh
# Run lint for code formatting and linting
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

## Configuration

The bot uses a centralized configuration system that validates all settings on startup. Here are the main configuration options:

### Environment Variables

```bash
# Required Slack Settings
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token

# Required LLM Settings
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=your-openrouter-api-key

# Optional LLM Settings
LLM_MODEL=qwen/qwq-32b-preview
LLM_MAX_TOKENS=2000
LLM_TEMPERATURE=0.7

# Optional OpenRouter Headers
OPENROUTER_REFERER=https://github.com/your-repo
OPENROUTER_TITLE=Your Bot Name

# Optional Slack Settings
SLACK_LOG_LEVEL=DEBUG
```

## Architecture

### LLM Provider System

The bot uses a flexible provider system that makes it easy to swap between different LLM services:

```javascript
// Create any supported provider
const provider = LLMFactory.createProvider('openrouter', {
  apiKey: 'your-key',
  model: 'qwen/qwq-32b-preview',
  maxTokens: 2000,
  temperature: 0.7
});

// Generate responses
const response = await provider.generateResponse([
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Hello!' }
]);
```

### Project Structure

```
flicket-ai/
├── app.js                 # Main application entry point
├── package.json           # Dependencies and scripts
├── .env.example          # Environment variable template
├── manifest.json         # Slack app configuration
├── config/
│   └── Config.js         # Centralized configuration management
└── llm/
    ├── index.js          # LLM module exports
    ├── LLMProvider.js    # Abstract base class
    ├── OpenRouterProvider.js  # OpenRouter implementation
    └── LLMFactory.js     # Provider factory
```

### Adding New LLM Providers

To add a new LLM provider:

1. Create a new provider class extending `LLMProvider`
2. Implement the required methods: `generateResponse()` and `validateConfig()`
3. Add the provider to `LLMFactory.js`
4. Update configuration in `Config.js`

Example:
```javascript
class MyProvider extends LLMProvider {
  async generateResponse(messages, options = {}) {
    // Implementation here
  }
  
  validateConfig() {
    // Validation here
  }
}
```

## Usage

### In Direct Messages
1. Open a DM with your bot
2. The assistant will greet you and show suggested prompts
3. Ask any question or use the suggested prompts

### In Channels
1. Invite the bot to a channel: `/invite @your-bot-name`
2. Open the Assistant panel
3. The bot will have additional context-aware prompts like "Summarize channel"

### Custom Prompts
The bot supports custom prompts and maintains conversation context. It can:
- Answer questions about any topic
- Help with writing and analysis
- Summarize channel activity
- Maintain context across multiple messages

## App Distribution / OAuth

Only implement OAuth if you plan to distribute your application across multiple workspaces. A separate `app-oauth.js` file can be found with relevant OAuth settings.

When using OAuth, Slack requires a public URL where it can send requests. In this template app, we've used [`ngrok`](https://ngrok.com/download). Checkout [this guide](https://ngrok.com/docs#getting-started-expose) for setting it up.

Start `ngrok` to access the app on an external network and create a redirect URL for OAuth.

```
ngrok http 3000
```

This output should include a forwarding address for `http` and `https` (we'll use `https`). It should look something like the following:

```
Forwarding   https://3cb89939.ngrok.io -> http://localhost:3000
```

Navigate to **OAuth & Permissions** in your app configuration and click **Add a Redirect URL**. The redirect URL should be set to your `ngrok` forwarding address with the `slack/oauth_redirect` path appended. For example:

```
https://3cb89939.ngrok.io/slack/oauth_redirect
```

## Migration from Hugging Face

If you're migrating from the original Hugging Face version:

1. Update your `.env` file with the new OpenRouter configuration
2. Remove the `HUGGINGFACE_API_KEY` environment variable
3. The bot will automatically use the new LLM provider system

The conversation experience remains the same - only the underlying LLM provider has changed.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
