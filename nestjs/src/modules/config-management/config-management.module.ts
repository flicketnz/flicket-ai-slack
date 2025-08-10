import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import Joi from "joi";

import awsConfig from "./configs/aws.config";
import llmConfig from "./configs/llm.config";
import llmOpenaiConfig from "./configs/llm-openai.config";
import llmToolsSearxngConfig from "./configs/llm-tools-searxng.config";
import llmToolsSlackConfig from "./configs/llm-tools-slack.config";
import slackConfig from "./configs/slack.config";
import { awsValidationSchema } from "./schemas/aws.schema";
import { commonValidationSchema } from "./schemas/common.schema";
import { llmValidationSchema } from "./schemas/llm.schema";
import { llmOpenAiValidationSchema } from "./schemas/llm-openai.schema";
import { llmToolsSearxngValidationSchema } from "./schemas/llm-tools-searxng.schema";
import { llmToolsSlackValidationSchema } from "./schemas/llm-tools-slack.schema";
import { slackValidationSchema } from "./schemas/slack.schema";

@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
      validationSchema: Joi.any()
        .concat(commonValidationSchema)
        .concat(awsValidationSchema)
        .concat(slackValidationSchema)
        .concat(llmValidationSchema)
        .concat(llmOpenAiValidationSchema)
        .concat(llmToolsSearxngValidationSchema)
        .concat(llmToolsSlackValidationSchema),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
      load: [
        awsConfig,
        slackConfig,
        llmConfig,
        llmOpenaiConfig,
        llmToolsSearxngConfig,
        llmToolsSlackConfig,
      ],
    }),
  ],
})
export class ConfigManagementModule {}
