import { type BaseCheckpointSaver, MemorySaver } from "@langchain/langgraph";
import { Injectable, type OnModuleInit } from "@nestjs/common";

import type { CheckpointerPort } from "./ports/checkpointer.port";

@Injectable()
export class MemorySaverCheckpointerAdapter
  implements CheckpointerPort, OnModuleInit
{
  public instance!: BaseCheckpointSaver;

  onModuleInit() {
    this.instance = new MemorySaver();
  }
}
