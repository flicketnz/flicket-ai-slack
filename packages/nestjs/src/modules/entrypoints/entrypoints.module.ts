import { Module } from "@nestjs/common";

import { SlackEntryPointModule } from "./modules/slack/slack.module";

@Module({
  imports: [SlackEntryPointModule],
})
export class EntrypointsModule {}
