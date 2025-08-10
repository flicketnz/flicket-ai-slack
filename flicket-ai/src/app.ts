import * as RunnablesModule from "@langchain/core/runnables";
import * as SlackBolt from "@slack/bolt";
import * as traceloop from "@traceloop/node-server-sdk";
import { createServer } from "http";
import * as AgentsModule from "langchain/agents";
import * as ChainsModule from "langchain/chains";
import * as ToolsModule from "langchain/tools";
import { OpenAI } from "openai";
import { appConfig } from "./config/config";
import { GenericReplyAppMentionHandler } from "./listeners/app-mention/generic-reply";
import { GenericUserMessageHandler } from "./listeners/assistant-user-message/generic";
import { createMiddlewares } from "./utils/middleware";

/**
 * There is some very weird stuff gong on in the slackbolt module.
 * It exports some named exports & a default. the default includes
 * some of the same named exports but not all of them. Depening on
 * how I compile the app - i've getting different resutls. The
 * following code is attempting to locate the `App` class regardless
 * of where it may be.
 */
const { Assistant, LogLevel } = SlackBolt;
let App: typeof SlackBolt.App = SlackBolt?.App;
if (!App) {
  App = SlackBolt && "default" in SlackBolt && (SlackBolt.default as any).App;
}

// Setup OTEL Instrumentation
traceloop.initialize({
  disableBatch: true,
  instrumentModules: {
    openAI: OpenAI,
    langchain: {
      chainsModule: ChainsModule,
      agentsModule: AgentsModule,
      toolsModule: ToolsModule,
      runnablesModule: RunnablesModule,
    },
  },
  tracingEnabled: true
});

// Validate Config
const validation = appConfig.validate();

if (!validation.isValid) {
  console.error("Configuration validation failed:");
  validation.errors.forEach((error) => console.error(`  - ${error}`));
  process.exit(1);
}

// Log configuration (without sensitive data)
if (appConfig.logLevel === "DEBUG") {
  appConfig.logConfig();
}

/** Initializationof Slack App */
const app = new App({
  token: appConfig.slack.botToken,
  appToken: appConfig.slack.appToken,
  socketMode: appConfig.slack.socketMode,
  logLevel: LogLevel[appConfig.slack.logLevel],
  port: appConfig.slack.port,
});

const assistant = new Assistant({
  /**
   * `assistant_thread_started` is sent when a user opens the Assistant container.
   * This can happen via DM with the app or as a side-container within a channel.
   * https://api.slack.com/events/assistant_thread_started
   */
  threadStarted: async ({
    event,
    logger,
    say,
    setSuggestedPrompts,
    saveThreadContext,
  }) => {
    const { context } = event.assistant_thread;

    try {
      // Since context is not sent along with individual user messages, it's necessary to keep
      // track of the context of the conversation to better assist the user. Sending an initial
      // message to the user with context metadata facilitates this, and allows us to update it
      // whenever the user changes context (via the `assistant_thread_context_changed` event).
      // The `say` utility sends this metadata along automatically behind the scenes.
      // !! Please note: this is only intended for development and demonstrative purposes.
      await say("Hi, how can I help?");

      await saveThreadContext();

      const prompts: { title: string; message: string }[] = [
        {
          title: "This is a suggested prompt",
          message:
            "When a user clicks a prompt, the resulting prompt message text can be passed " +
            "directly to your LLM for processing.\n\nAssistant, please create some helpful prompts " +
            "I can provide to my users.",
        },
      ];

      // If the user opens the Assistant container in a channel, additional
      // context is available.This can be used to provide conditional prompts
      // that only make sense to appear in that context (like summarizing a channel).
      if (context.channel_id) {
        prompts.push({
          title: "Summarize channel",
          message: "Assistant, please summarize the activity in this channel!",
        });
      }

      /**
       * Provide the user up to 4 optional, preset prompts to choose from.
       * The optional `title` prop serves as a label above the prompts. If
       * not, provided, 'Try these prompts:' will be displayed.
       * https://api.slack.com/methods/assistant.threads.setSuggestedPrompts
       */
      if (prompts.length > 0) {
        // biome-ignore lint/suspicious/noExplicitAny: could not ge thte types write - but the object shape is correct
        await setSuggestedPrompts({
          prompts: prompts as any,
          title: "Here are some suggested options:",
        });
      }
    } catch (e) {
      logger.error(e);
    }
  },

  /**
   * `assistant_thread_context_changed` is sent when a user switches channels
   * while the Assistant container is open. If `threadContextChanged` is not
   * provided, context will be saved using the AssistantContextStore's `save`
   * method (either the DefaultAssistantContextStore or custom, if provided).
   * https://api.slack.com/events/assistant_thread_context_changed
   */
  threadContextChanged: async ({ logger, saveThreadContext }) => {
    // const { channel_id, thread_ts, context: assistantContext } = event.assistant_thread;
    try {
      await saveThreadContext();
    } catch (e) {
      logger.error(e);
    }
  },

  /**
   * Messages sent to the Assistant do not contain a subtype and must
   * be deduced based on their shape and metadata (if provided).
   * https://api.slack.com/events/message
   */
  userMessage: createMiddlewares([GenericUserMessageHandler]),
});

app.event("app_mention", ...createMiddlewares([GenericReplyAppMentionHandler]));
app.assistant(assistant);


// Small healthcheck endpoint - We should add this to slack 'receiver' but it seems 
// like the reciever isnt running (nothind on the port after startup)
createServer((req, res) => {
  if (req.url === "/health") {
    console.debug("Health check received");
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
    return;
  }
  // end the response for any other request
  res.end()
}).listen(appConfig.slack.port);

/** Start the Bolt App */
(async () => {
  try {
    await app.start();
    app.logger.info("⚡️ Bolt app is running!");
  } catch (error) {
    app.logger.error("Failed to start the app", error);
  }
})();
