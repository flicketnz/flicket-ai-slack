import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ModuleRef } from "@nestjs/core";
import { SlackModule } from "nestjs-slack-bolt";
import { SlackModuleOptions } from "nestjs-slack-bolt/dist/interfaces/modules/module.options";
import slackConfig from "src/modules/config-management/configs/slack.config";

import { SlackEntrypointController } from "./slack.controller";
import { SlackReceiverController } from "./slack-receiver.controller";

@Module({
  imports: [
    ConfigModule.forFeature(slackConfig),
    SlackModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService, ModuleRef],
      useFactory: (configService: ConfigService) => {
        return {
          appToken: configService.get<string>("slack.appToken"),
          socketMode: configService.get<boolean>("slack.socketMode"),
          signingSecret: configService.get<string>("slack.signingSecret"),
          token: configService.get<string>("slack.botToken"),
          logLevel: "debug" as SlackModuleOptions["logLevel"],
          tokenVerificationEnabled: false,
          receiver: {
            init: () => {},

            start: (...args: any[]) => {
              return Promise.resolve();
            },
            stop: (...args: any[]) => {
              return Promise.resolve();
            },
          },
        };
      },
    }),
  ],

  controllers: [SlackEntrypointController, SlackReceiverController],
})
export class SlackEntryPointModule {}
