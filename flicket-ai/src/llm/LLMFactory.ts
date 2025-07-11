import type { Config } from '../config/config.js';
import type { LLMConfig, LLMProvider } from './LLMProvider.js';
import { OpenRouterProvider } from './OpenRouterProvider.js';


const providers: Partial<Record<'openrouter', LLMProvider>> = {}

// biome-ignore lint/complexity/noStaticOnlyClass: i dont care about this rule
export class LLMFactory {
  static createProvider(config: Config & { llm: LLMConfig }): LLMProvider {
    switch (config.llm.provider) {
      case 'openrouter':
        if (!providers.openrouter) {
          providers.openrouter = new OpenRouterProvider(config.llm);
        }
        return providers.openrouter;



      // Add other providers here as needed
      default:
        throw new Error(`Unsupported LLM provider`);
    }
  }
}
