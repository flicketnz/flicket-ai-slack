import { Middleware, type SlackEventMiddlewareArgs } from "@slack/bolt";
import type { Logger, WebClient } from "@slack/web-api";
import { task } from "@traceloop/node-server-sdk";
import { appConfig } from "../../config/config";
import { LLMFactory } from "../../llm";
import type { MessagesHistory } from "../../llm/LLMProvider";



/**
 * Class that handles user messages sent to the AI bot directly as a DM.
 */
export class GenericReplyAppMentionHandler {
  private llmProvider = LLMFactory.createProvider(appConfig);

  /**
   * Handles user messages sent to the AI bot directly as a DM.
   */
  @task({ name: "GenericReplyAppMentionHandler.handle" })
  public async handle({
    event,
    body,
    say
  }: SlackEventMiddlewareArgs<"app_mention">): Promise<void> {
    const generatedResponse = await this.llmProvider.generateResponse(
      [],
      event.text,
      event.ts,
    );

    await say({ text: generatedResponse });

  }
}
