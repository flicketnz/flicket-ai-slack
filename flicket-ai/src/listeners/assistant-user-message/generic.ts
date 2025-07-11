import type { Logger, WebClient } from "@slack/web-api";
import { task } from "@traceloop/node-server-sdk";
import { appConfig } from "../../config/config";
import { LLMFactory } from "../../llm";
import type { MessagesHistory } from "../../llm/LLMProvider";




/**
 * This middleware is intended to reply to messages sent to the AI bot directly as a DM.
 * @param param0
 */
/**
 * Class that handles user messages sent to the AI bot directly as a DM.
 */
export class GenericUserMessageHandler {
  private llmProvider = LLMFactory.createProvider(appConfig);
  /**
   * Gets the thread history for a given channel and thread
   */
  @task({ name: "GenericUserMessageHandler.getThreadHistory" })
  private async getThreadHistory(
    channelId: string,
    threadId: string,
    { client, logger }: { client: WebClient; logger?: Logger },
  ) {
    const channelThreadHistory = await client.conversations.replies({
      channel: channelId,
      ts: threadId,
      limit: 50,
    });
    logger?.debug(`Retrieved thread history for channel ${channelId} and thread ${threadId}`)


    return channelThreadHistory.messages;
  }

  /**
   * Handles user messages sent to the AI bot directly as a DM.
   */
  @task({ name: "GenericUserMessageHandler.handle" })
  public async handle({
    client,
    logger,
    message,
    say,
    setStatus
  }: {
    client: WebClient;
    logger?: Logger;
    message: any;
    say: any;
    setStatus: any;
  }): Promise<void> {
    if (logger) {
      this.llmProvider.setLogger(logger);
    }

    // check preconditions - is it a DM
    // 'Channel' ids for DM's start with a 'D'
    // Also check it is a thread (has a thread_ts property) all assistant DM's are in threads
    // alo check that the message text is not empty
    if (
      // is not DM
      !message.channel ||
      !message.channel.startsWith("D") ||
      // is not thread
      !("thread_ts" in message) ||
      !message.thread_ts ||
      //has no message text
      !("text" in message) ||
      !message.text
    ) {
      //exit early
      console.log(JSON.stringify(message, null, 2));
      logger?.debug(`Non-DM/Assistant channel, skipping`);
      return;
    }

    const statuses = [
      "Thinking...",
      "Powering up the mainframe...",
      "Loading the flux capacitor...",
      "Cranking the handle...",
      "Summoning the AI spirits...",
      "Consulting the oracle...",
      "Engaging hyperdrive...",
      "Initializing the neural network...",
      "Activating the AI core...",
      "Booting up the AI...",
      "Preparing the quantum computer...",
      "Aligning the stars...",
      "Charging the AI batteries...",
      "Tuning the AI antenna...",
      "Calibrating the AI sensors...",
    ];
    let statusUpdater: NodeJS.Timeout | undefined = setInterval(() => {
      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];
      setStatus(randomStatus);
    }, 2000);

    const assistantHistory: MessagesHistory = [];

    const conversationHistory = await this.getThreadHistory(
      message.channel,
      message.thread_ts,
      { logger, client },
    );
    if (conversationHistory) {
      assistantHistory.push(
        ...conversationHistory.map((m: any) => {
          return {
            role: (m.bot_id ? "assistant" : "user") as "user" | "assistant",
            content:
              `From: ${m.user}\nTimestamp: ${m.ts}\nContent:\n${m.text}` || "",
          };
        }),
      );
    }

    const generatedResponse = await this.llmProvider.generateResponse(
      assistantHistory,
      message.text,
      message.thread_ts,
      (progressMessage: string) => {
        if (statusUpdater) {
          clearInterval(statusUpdater);
          statusUpdater = undefined
        }
        setStatus(progressMessage);
      });


    if (statusUpdater) {
      // stop updating the status
      clearInterval(statusUpdater);
    }

    // Handle both string and SlackMessageBlocks responses
    if (typeof generatedResponse === 'string') {
      await say({ text: generatedResponse });
    } else {
      await say(generatedResponse);
    }

  }
}

