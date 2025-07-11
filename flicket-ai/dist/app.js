"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const RunnablesModule = __importStar(require("@langchain/core/runnables"));
const SlackBolt = __importStar(require("@slack/bolt"));
const traceloop = __importStar(require("@traceloop/node-server-sdk"));
const http_1 = require("http");
const AgentsModule = __importStar(require("langchain/agents"));
const ChainsModule = __importStar(require("langchain/chains"));
const ToolsModule = __importStar(require("langchain/tools"));
const openai_1 = require("openai");
const config_1 = require("./config/config");
const generic_reply_1 = require("./listeners/app-mention/generic-reply");
const generic_1 = require("./listeners/assistant-user-message/generic");
const middleware_1 = require("./utils/middleware");
/**
 * There is some very weird stuff gong on in the slackbolt module.
 * It exports some named exports & a default. the default includes
 * some of the same named exports but not all of them. Depening on
 * how I compile the app - i've getting different resutls. The
 * following code is attempting to locate the `App` class regardless
 * of where it may be.
 */
const { Assistant, LogLevel } = SlackBolt;
let App = SlackBolt?.App;
if (!App) {
    App = SlackBolt && "default" in SlackBolt && SlackBolt.default.App;
}
// Setup OTEL Instrumentation
traceloop.initialize({
    disableBatch: true,
    instrumentModules: {
        openAI: openai_1.OpenAI,
        langchain: {
            chainsModule: ChainsModule,
            agentsModule: AgentsModule,
            toolsModule: ToolsModule,
            runnablesModule: RunnablesModule,
        },
    },
    tracingEnabled: false, // Set to true to enable tracing
});
// Validate Config
const validation = config_1.appConfig.validate();
if (!validation.isValid) {
    console.error("Configuration validation failed:");
    validation.errors.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
}
// Log configuration (without sensitive data)
if (config_1.appConfig.logLevel === "DEBUG") {
    config_1.appConfig.logConfig();
}
/** Initializationof Slack App */
const app = new App({
    token: config_1.appConfig.slack.botToken,
    appToken: config_1.appConfig.slack.appToken,
    socketMode: config_1.appConfig.slack.socketMode,
    logLevel: LogLevel[config_1.appConfig.slack.logLevel],
    port: config_1.appConfig.slack.port,
});
const assistant = new Assistant({
    /**
     * `assistant_thread_started` is sent when a user opens the Assistant container.
     * This can happen via DM with the app or as a side-container within a channel.
     * https://api.slack.com/events/assistant_thread_started
     */
    threadStarted: async ({ event, logger, say, setSuggestedPrompts, saveThreadContext, }) => {
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
            const prompts = [
                {
                    title: "This is a suggested prompt",
                    message: "When a user clicks a prompt, the resulting prompt message text can be passed " +
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
                    prompts: prompts,
                    title: "Here are some suggested options:",
                });
            }
        }
        catch (e) {
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
        }
        catch (e) {
            logger.error(e);
        }
    },
    /**
     * Messages sent to the Assistant do not contain a subtype and must
     * be deduced based on their shape and metadata (if provided).
     * https://api.slack.com/events/message
     */
    userMessage: (0, middleware_1.createMiddlewares)([generic_1.GenericUserMessageHandler]),
});
app.event("app_mention", ...(0, middleware_1.createMiddlewares)([generic_reply_1.GenericReplyAppMentionHandler]));
app.assistant(assistant);
(0, http_1.createServer)((req, res) => {
    if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("OK");
        return;
    }
}).listen(config_1.appConfig.slack.port);
/** Start the Bolt App */
(async () => {
    try {
        await app.start();
        app.logger.info("⚡️ Bolt app is running!");
    }
    catch (error) {
        app.logger.error("Failed to start the app", error);
    }
})();
