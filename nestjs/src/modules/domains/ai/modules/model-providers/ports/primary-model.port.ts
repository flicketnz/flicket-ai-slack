import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { Inject } from "@nestjs/common";

export const PRIMARY_CHAT_MODEL_PORT = "PRIMARY_CHAT_MODEL_PORT";

export interface PrimaryChatModelPort {
  /**
   *  The primary Chat Model
   */
  model: BaseChatModel;
}

export const InjectPrimaryChatModel = () => Inject(PRIMARY_CHAT_MODEL_PORT);
