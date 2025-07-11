import { SearxngSearch } from "@langchain/community/tools/searxng_search";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

import type { Tool } from "@langchain/core/tools";
import { task } from "@traceloop/node-server-sdk";
import {
  AgentExecutor,
  createStructuredChatAgent,
  createToolCallingAgent,
} from "langchain/agents";
import { appConfig, type Config } from "../config/config.js";
import type { ILogger } from "../utils/logger.js";

export type LLMConfig = Pick<
  Config["llm"],
  "model" | "maxTokens" | "temperature"
> &
  (
    | ({
      provider: "openrouter";
    } & Required<Pick<Config["llm"], "openrouter">>)
    | {
      provider: never; // Placeholder for other providers
    }
  );

export type MessagesHistory = Array<{
  role: "user" | "system" | "assistant";
  content: string;
}>;

/**
 * Abstract base class for LLM providers
 * This provides a consistent interface for different LLM services
 */
export abstract class LLMProvider {
  /**
   * The underlying language model implementation
   */
  protected abstract llm: BaseChatModel;

  /**
   * Configuration for the LLM provider
   */
  protected config: LLMConfig;

  /**
   * Logger instance for debugging and tracking
   */
  protected logger: ILogger = console;

  /**
   * Collection of tools available to the LLM for enhanced capabilities
   */
  private tools: Tool[] = [];

  constructor(config: LLMConfig) {
    this.config = config;

    this.tools.push(
      new SearxngSearch({
        params: {
          format: "json",
          engines: "duckduckgo",
        },
        // Custom Headers to support rapidAPI authentication Or any instance that requires custom headers
        headers: {},
      }),
    );
  }

  /**
   * Sets a custom logger for the LLM provider
   * @param logger - The logger implementation to use
   */
  setLogger(logger: ILogger): void {
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
  @task({ name: "LLMProvider.generateResponse" })
  async generateResponse(
    history: MessagesHistory,
    question: string,
    sessionId: string,
    progressCallback?: (message: string) => void,
  ): Promise<string> {
    const prompt = ChatPromptTemplate.fromMessages([
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
      ["system", appConfig.assistant.systemContent],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      ["placeholder", "{agent_scratchpad}"],
    ]);

    const messageHistory = new InMemoryChatMessageHistory();
    messageHistory.addMessages(history.map((m) => new ChatMessage(m)));

    // const agent = createToolCallingAgent({
    //   llm: this.llm,
    //   tools: this.tools,
    //   prompt,
    // });
    const agent = await createStructuredChatAgent({
      llm: this.llm,
      tools: this.tools,
      prompt,

    });

    const that = this

    const agentExecutor = new AgentExecutor({
      agent,
      tools: this.tools,
      verbose: true, // Helps with debugging in Slack
      maxIterations: 3, // Prevent infinite loops
      callbacks: [
        {
          handleToolError(err, runId, parentRunId, tags) {
            that.logger.error(
              `Error in tool execution: ${err.message}`
            );
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
