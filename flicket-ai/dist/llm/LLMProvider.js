"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMProvider = void 0;
const searxng_search_1 = require("@langchain/community/tools/searxng_search");
const chat_history_1 = require("@langchain/core/chat_history");
const messages_1 = require("@langchain/core/messages");
const prompts_1 = require("@langchain/core/prompts");
const node_server_sdk_1 = require("@traceloop/node-server-sdk");
const agents_1 = require("langchain/agents");
const config_js_1 = require("../config/config.js");
/**
 * Abstract base class for LLM providers
 * This provides a consistent interface for different LLM services
 */
class LLMProvider {
    /**
     * Configuration for the LLM provider
     */
    config;
    /**
     * Logger instance for debugging and tracking
     */
    logger = console;
    /**
     * Collection of tools available to the LLM for enhanced capabilities
     */
    tools = [];
    constructor(config) {
        this.config = config;
        this.tools.push(new searxng_search_1.SearxngSearch({
            params: {
                format: "json",
                engines: "duckduckgo",
            },
            // Custom Headers to support rapidAPI authentication Or any instance that requires custom headers
            headers: {},
        }));
    }
    /**
     * Sets a custom logger for the LLM provider
     * @param logger - The logger implementation to use
     */
    setLogger(logger) {
        this.logger = logger;
    }
    /**
     * Generate a response from the LLM
     * @param {Array} messages - Array of message objects with role and content
     * @param {string} question - the user prompt
     * @param {Array} sessionId - an identifing value for the session. often a user or a thread id
     * @param {boolean} formatForSlack - Whether to format the response for Slack
     * @returns {Promise<string | SlackMessageBlocks>} - The generated response, either as plain text or formatted for Slack
     */
    async generateResponse(history, question, sessionId, progressCallback) {
        const prompt = prompts_1.ChatPromptTemplate.fromMessages([
            [
                "system",
                `
The date/time now is ${new Date().toISOString()}. The human is in ${Intl.DateTimeFormat().resolvedOptions().timeZone} time zone.

Respond to the human as helpfully and accurately as possible. You have access to the following tools:

{tools}

Use a json blob to specify a tool by providing an action key (tool name) and an action_input key (tool input).

Valid "action" values: "Final Answer" or {tool_names}

Provide only ONE action per $JSON_BLOB, as shown:

\`\`\`
{{
  "action": $TOOL_NAME,
  "action_input": $INPUT
}}
\`\`\`

Follow this format:

Question: input question to answer
Thought: consider previous and subsequent steps
Action:
\`\`\`
$JSON_BLOB
\`\`\`
Observation: action result
... (repeat Thought/Action/Observation N times)
Thought: I know what to respond
Action:
\`\`\`
{{
  "action": "Final Answer",
  "action_input": "Final response to human"
}}
\`\`\`

Begin! Reminder to ALWAYS respond with a valid json blob of a single action. Use tools if necessary. Respond directly if appropriate. Format is Action: \`\`\`$JSON_BLOB\`\`\` then Observation`,
            ],
            ["system", config_js_1.appConfig.assistant.systemContent],
            new prompts_1.MessagesPlaceholder("chat_history"),
            ["human", "{input}"],
            ["placeholder", "{agent_scratchpad}"],
        ]);
        const messageHistory = new chat_history_1.InMemoryChatMessageHistory();
        messageHistory.addMessages(history.map((m) => new messages_1.ChatMessage(m)));
        // const agent = createToolCallingAgent({
        //   llm: this.llm,
        //   tools: this.tools,
        //   prompt,
        // });
        const agent = await (0, agents_1.createStructuredChatAgent)({
            llm: this.llm,
            tools: this.tools,
            prompt,
        });
        const that = this;
        const agentExecutor = new agents_1.AgentExecutor({
            agent,
            tools: this.tools,
            verbose: true, // Helps with debugging in Slack
            maxIterations: 3, // Prevent infinite loops
            callbacks: [
                {
                    handleToolError(err, runId, parentRunId, tags) {
                        that.logger.error(`Error in tool execution: ${err.message}`);
                        if (progressCallback) {
                            progressCallback(`Error executing tool: ${err.message}`);
                        }
                    },
                    handleAgentAction: async (action) => {
                        if (progressCallback) {
                            await progressCallback(`Using tool: ${action.tool}`);
                        }
                    },
                    handleToolEnd: async () => {
                        if (progressCallback) {
                            await progressCallback("Processing tool results...");
                        }
                    }
                }
            ]
        });
        const agentResult = await agentExecutor.invoke({
            input: question,
            chat_history: await messageHistory.getMessages(),
        });
        // Otherwise return the raw text
        return agentResult.output;
    }
}
exports.LLMProvider = LLMProvider;
__decorate([
    (0, node_server_sdk_1.task)({ name: "LLMProvider.generateResponse" })
], LLMProvider.prototype, "generateResponse", null);
