import { BaseMessage, SystemMessage } from "@langchain/core/messages";
import { Injectable, Logger } from "@nestjs/common";
import { type IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import {
  LlmConversationQuery,
  type ProgressCallback,
} from "../../../../../../../common/queries/llm-conversation.query";
import { LlmService } from "../../services/llm.service";

@QueryHandler(LlmConversationQuery)
@Injectable()
export class LlmConversationQueryHandler
  implements IQueryHandler<LlmConversationQuery, BaseMessage>
{
  private readonly logger = new Logger(LlmConversationQueryHandler.name);

  constructor(private readonly llmService: LlmService) {}

  async execute(query: LlmConversationQuery): Promise<BaseMessage> {
    const startTime = Date.now();

    try {
      this.logger.log(
        `Processing LLM conversation query for session: ${query.session.sessionId}`,
      );

      // Setup progress callback wrapper
      const progressCallback = this.createProgressCallbackWrapper(
        query.progressCallback,
      );

      // Generate LLM response
      const llmResult = await this.llmService.generateResponse(query.question, {
        session: query.session,
        additionalSystemPrompt: query.systemPrompt,
        progressCallback,
      });

      return llmResult.messages[llmResult.messages.length - 1];
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `LLM conversation query failed: ${errorObj.message}`,
        errorObj.stack,
      );
      return this.createErrorResponse(`Internal error: ${errorObj.message}`);
    }
  }

  private createProgressCallbackWrapper(
    originalCallback?: ProgressCallback,
  ): ProgressCallback {
    return async (message: string, stage?: string) => {
      this.logger.debug(`Progress: ${stage || "unknown"} - ${message}`);

      if (originalCallback) {
        try {
          await originalCallback(message, stage);
        } catch (error) {
          const errorObj =
            error instanceof Error ? error : new Error(String(error));
          this.logger.warn(`Progress callback error: ${errorObj.message}`);
        }
      }
    };
  }

  private createErrorResponse(errorMessage: string): BaseMessage {
    return new SystemMessage(
      `I apologize, but I encountered an error while processing your request. Please try again.\n\n Error: ${errorMessage}`,
    );
  }
}
