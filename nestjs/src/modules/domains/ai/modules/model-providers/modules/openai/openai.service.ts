import { ChatOpenAI } from "@langchain/openai";
import { Injectable, type OnApplicationBootstrap } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { PrimaryChatModelPort } from "../../ports/primary-model.port";

@Injectable()
export class OpenAIModelProviderService
  implements PrimaryChatModelPort, OnApplicationBootstrap
{
  public model!: ChatOpenAI;

  constructor(private readonly configService: ConfigService) {}

  onApplicationBootstrap() {
    this.model = new ChatOpenAI({
      apiKey: this.configService.get<string>("llm.openai.apiKey"),
      model: this.configService.get<string>("llm.openai.model"),
      configuration: {
        baseURL: this.configService.get<string>("llm.openai.baseUrl"),
      },
      temperature: this.configService.get<number>("llm.openai.temp"),
    });
  }
}
