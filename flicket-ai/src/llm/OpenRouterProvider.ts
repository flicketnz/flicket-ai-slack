import { ChatOpenAI } from '@langchain/openai';
import { type LLMConfig, LLMProvider } from './LLMProvider.js';

/**
 * OpenRouter LLM Provider using LangChain
 * Supports any model available through OpenRouter
 */
export class OpenRouterProvider extends LLMProvider {
  protected llm: ChatOpenAI;

  constructor(config: LLMConfig) {
    super(config);

    if (this.config.provider !== 'openrouter') {
      throw new Error("OpenRouterProvider requires 'openrouter' as the provider in LLMConfig");
    }

    this.llm = new ChatOpenAI({
      openAIApiKey: this.config.openrouter.apiKey,
      modelName: this.config.model,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
      configuration: {
        baseURL: this.config.openrouter.baseURL,
        defaultHeaders: {
          ...(this.config.openrouter.referer ? { 'HTTP-Referer': this.config.openrouter.referer } : {}),
          'X-Title': this.config.openrouter.title,
        },
      },
    });
  }
}
