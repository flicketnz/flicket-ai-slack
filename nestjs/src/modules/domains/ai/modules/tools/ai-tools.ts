import { DiscoveryService } from "@nestjs/core";
import { StructuredTool } from "langchain/tools";

export interface AiToolProvider {
  tool: StructuredTool | undefined;
}

export const Tool = DiscoveryService.createDecorator();
