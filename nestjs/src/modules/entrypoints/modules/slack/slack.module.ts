import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SlackModule } from "nestjs-slack-bolt";
import { SlackModuleOptions } from "nestjs-slack-bolt/dist/interfaces/modules/module.options";

import { SlackEntrypointController } from "./slack.controller";

@Module({
  imports: [
    SlackModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          appToken: configService.get<string>("slack.appToken"),
          socketMode: configService.get<boolean>("slack.socketMode"),
          signingSecret: configService.get<string>("slack.signingSecret"),
          token: configService.get<string>("slack.botToken"),
          logLevel: "debug" as SlackModuleOptions["logLevel"],
        };
      },
    }),
  ],
  controllers: [SlackEntrypointController],
})
export class SlackEntryPointModule {}
