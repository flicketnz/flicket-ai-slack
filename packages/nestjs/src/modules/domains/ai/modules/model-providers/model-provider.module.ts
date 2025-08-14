import { Module } from "@nestjs/common";
import { ConditionalModule } from "@nestjs/config";
import { LLM_Provider } from "src/modules/config-management";

import { OpenAIModelProvider } from "./modules/openai/openai.module";

@Module({
  imports: [
    ConditionalModule.registerWhen(
      OpenAIModelProvider.register({}),
      (env: NodeJS.ProcessEnv) =>
        env.LLM_PRIMARY_PROVIDER === LLM_Provider.OPENAI,
    ),
  ],
  providers: [],
})
export class ModelProviderModule {}
