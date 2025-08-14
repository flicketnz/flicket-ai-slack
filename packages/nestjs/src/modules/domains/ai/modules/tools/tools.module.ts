import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { SearxngTool } from "./searxng.tool";
import { SlackTool } from "./slack.tools";

const toolProviders = [SearxngTool, SlackTool];

@Module({
  imports: [ConfigModule],
  providers: [...toolProviders],
  exports: [...toolProviders],
})
export class AiToolsModule {}
