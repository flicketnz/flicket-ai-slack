import { tool } from "@langchain/core/tools";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { StructuredTool } from "langchain/tools";
import { SlackService } from "nestjs-slack-bolt/dist/services/slack.service";
import { z } from "zod";

import { type AiToolProvider, Tool } from "./ai-tools";

@Injectable()
@Tool()
export class SlackTool implements AiToolProvider, OnModuleInit {
  public tool!: StructuredTool | undefined;
  private readonly logger = new Logger(SlackTool.name);

  constructor(
    private readonly configService: ConfigService,
    private slackService: SlackService,
  ) {}

  onModuleInit() {
    const enabled = this.configService.get<string>("llm.tools.slack.enabled");
    if (enabled) {
      this.tool = tool(
        async ({ userId }: { userId: string }) => {
          const profileResponse =
            await this.slackService.client.users.profile.get({
              user: userId,
            });
          if (profileResponse.ok) {
            return profileResponse.profile;
          } else {
            this.logger.error(profileResponse.error);
            this.logger.debug(profileResponse);

            return profileResponse.error;
          }
        },
        {
          name: "get-slack-user",
          description: "Get profile of the slack user by their userId",
          schema: z.object({
            userId: z.string(),
          }),
        },
      );
    }
  }
}
