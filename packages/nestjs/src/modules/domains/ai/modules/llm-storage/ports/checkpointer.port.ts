import { BaseCheckpointSaver } from "@langchain/langgraph";
import { Inject } from "@nestjs/common";

export const CHECKPOINTER = Symbol("checkpointer");

export interface CheckpointerPort {
  instance: BaseCheckpointSaver;
}

export const InjectCheckpointer = () => Inject(CHECKPOINTER);
