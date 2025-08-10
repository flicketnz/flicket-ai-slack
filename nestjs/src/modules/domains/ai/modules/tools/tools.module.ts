import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { SlackTool } from "./get-slack-profile.tool";
import { SearxngTool } from "./searxng.tool";

const toolProviders = [SearxngTool, SlackTool];

@Module({
  imports: [ConfigModule],
  providers: [...toolProviders],
  exports: [...toolProviders],
})
export class AiToolsModule {}
