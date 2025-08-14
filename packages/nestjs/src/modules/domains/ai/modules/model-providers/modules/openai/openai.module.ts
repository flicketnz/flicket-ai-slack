import { type DynamicModule, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LLM_Provider } from "src/modules/config-management";

import { PRIMARY_CHAT_MODEL_PORT } from "../../ports/primary-model.port";
import {
  type ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  type OPTIONS_TYPE,
} from "./openai.module-definition";
import { OpenAIModelProviderService } from "./openai.service";

@Module({
  imports: [ConfigModule],
  providers: [OpenAIModelProviderService],
  exports: [OpenAIModelProviderService],
})
export class OpenAIModelProvider extends ConfigurableModuleClass {
  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    const dynamicModule = ConfigurableModuleClass.register(options);

    return OpenAIModelProvider.appendConditionalExport(dynamicModule);
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const dynamicModule = ConfigurableModuleClass.registerAsync(options);

    return OpenAIModelProvider.appendConditionalExport(dynamicModule);
  }

  static appendConditionalExport(dynamicModule: DynamicModule): DynamicModule {
    const additionalImports: DynamicModule["imports"] = [ConfigModule];
    const additionalExports: DynamicModule["exports"] = [
      OpenAIModelProviderService,
    ];
    const additionalProviders: DynamicModule["providers"] = [
      OpenAIModelProviderService,
    ];

    let isGlobal: boolean = false;

    // All this strange register logic comes to this:
    // if this provider is the primary provider, we want to register hte provider, and export it, as the special token
    // this is going to allow anyone to import the primary provider without needing to know what the primary provider is
    if (process.env.LLM_PRIMARY_PROVIDER === LLM_Provider.OPENAI) {
      additionalExports.push({
        provide: PRIMARY_CHAT_MODEL_PORT,
        useClass: OpenAIModelProviderService,
      });
      additionalProviders.push({
        provide: PRIMARY_CHAT_MODEL_PORT,
        useClass: OpenAIModelProviderService,
      });
      isGlobal = true;
    }

    return {
      ...dynamicModule,
      global: isGlobal,
      imports: [...(dynamicModule.imports ?? []), ...additionalImports],
      exports: [...(dynamicModule.exports ?? []), ...additionalExports],
      providers: [...(dynamicModule.providers ?? []), ...additionalProviders],
    };
  }
}
