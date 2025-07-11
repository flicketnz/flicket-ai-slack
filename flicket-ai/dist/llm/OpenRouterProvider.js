"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterProvider = void 0;
const openai_1 = require("@langchain/openai");
const LLMProvider_js_1 = require("./LLMProvider.js");
/**
 * OpenRouter LLM Provider using LangChain
 * Supports any model available through OpenRouter
 */
class OpenRouterProvider extends LLMProvider_js_1.LLMProvider {
    llm;
    constructor(config) {
        super(config);
        if (this.config.provider !== 'openrouter') {
            throw new Error("OpenRouterProvider requires 'openrouter' as the provider in LLMConfig");
        }
        this.llm = new openai_1.ChatOpenAI({
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
exports.OpenRouterProvider = OpenRouterProvider;
