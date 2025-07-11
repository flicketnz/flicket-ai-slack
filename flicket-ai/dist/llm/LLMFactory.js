"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMFactory = void 0;
const OpenRouterProvider_js_1 = require("./OpenRouterProvider.js");
const providers = {};
// biome-ignore lint/complexity/noStaticOnlyClass: i dont care about this rule
class LLMFactory {
    static createProvider(config) {
        switch (config.llm.provider) {
            case 'openrouter':
                if (!providers.openrouter) {
                    providers.openrouter = new OpenRouterProvider_js_1.OpenRouterProvider(config.llm);
                }
                return providers.openrouter;
            // Add other providers here as needed
            default:
                throw new Error(`Unsupported LLM provider`);
        }
    }
}
exports.LLMFactory = LLMFactory;
