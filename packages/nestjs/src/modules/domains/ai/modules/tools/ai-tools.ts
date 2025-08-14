import { BaseToolkit } from "@langchain/core/tools";
import { DiscoveryService } from "@nestjs/core";
import { StructuredTool } from "langchain/tools";

export type AiToolProvider = {
  tool: StructuredTool | BaseToolkit | undefined;
};

export const Tool = DiscoveryService.createDecorator();
