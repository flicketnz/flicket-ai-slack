"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = exports.Config = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
/**
 * Configuration management for the Slack Bot
 * Centralizes all configuration and provides validation
 */
class Config {
    logLevel;
    slack;
    llm;
    assistant;
    constructor() {
        /**
         * General purpose log level
         * @type {string}
         */
        this.logLevel = this.parseLogLevel(process.env.LOG_LEVEL || "INFO");
        // Slack Configuration
        this.slack = {
            botToken: process.env.SLACK_BOT_TOKEN ?? "",
            appToken: process.env.SLACK_APP_TOKEN ?? "",
            socketMode: true,
            port: process.env.PORT ? Number.parseInt(process.env.PORT) : 3000,
            logLevel: this.parseLogLevel(process.env.SLACK_LOG_LEVEL ?? this.logLevel),
        };
        // LLM Configuration
        this.llm = {
            provider: "openrouter",
            model: process.env.LLM_MODEL || "qwen/qwen3-235b-a22b",
            maxTokens: process.env.LLM_MAX_TOKENS
                ? Number.parseInt(process.env.LLM_MAX_TOKENS)
                : 2000,
            temperature: process.env.LLM_TEMPERATURE
                ? Number.parseFloat(process.env.LLM_TEMPERATURE)
                : 0.7,
            // Provider-specific configurations
            openrouter: {
                apiKey: process.env.OPENROUTER_API_KEY ?? "",
                baseURL: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
                referer: process.env.OPENROUTER_REFERER ?? "",
                title: process.env.OPENROUTER_TITLE ?? "Slack Assistant Bot",
            },
            // Add other providers here as needed
            // openai: {
            //   apiKey: process.env.OPENAI_API_KEY,
            // },
            // anthropic: {
            //   apiKey: process.env.ANTHROPIC_API_KEY,
            // },
        };
        // Assistant Configuration
        this.assistant = {
            systemContent: process.env.SYSTEM_CONTENT ||
                `You're an assistant in a Slack workspace.
Users in the workspace will ask you to help them write something or to think better about a specific topic.
You'll respond to those questions in a professional way.
When a prompt has Slack's special syntax like <@USER_ID> or <#CHANNEL_ID>, you must keep them as-is in your response.
Responses should be limited to 1-2 paragraphs, and should not be too verbose. The exception to this is when the user asks for a detailed explanation or a long-form response.

Message Formatting: messages should be formatted ONLY wwith slack 'mrkdwn' syntax. Examples: 
_italic_, *bold*, ~strike~. 
Line break by including '\n' . 
block quotes by preceding a line with '>'. 
inline code by surrounding with '\`', \`\`\`This is a code block\nAnd it's multi-line\`\`\` 
you can add lines by including the url as is, or named links like this: <http://www.example.com|This message *is* a link>. 
you may also use any unicode emojis
you MAY NOT use any heading syntax`
        };
    }
    /**
     * Validate the configuration
     * @returns {Object} - Validation result with isValid boolean and errors array
     */
    validate() {
        const errors = [];
        // Validate Slack configuration
        if (!this.slack.botToken || this.slack.botToken === "") {
            errors.push("SLACK_BOT_TOKEN is required");
        }
        if (!this.slack.appToken || this.slack.appToken === "") {
            errors.push("SLACK_APP_TOKEN is required");
        }
        // Validate LLM configuration
        const providerConfig = this.llm[this.llm.provider];
        if (!providerConfig) {
            errors.push(`Unsupported LLM provider: ${this.llm.provider}`);
        }
        else {
            switch (this.llm.provider) {
                case "openrouter":
                    if (!providerConfig.apiKey || providerConfig.apiKey === "") {
                        errors.push("OPENROUTER_API_KEY is required for OpenRouter provider");
                    }
                    break;
                // Add validation for other providers
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    /**
     * Log the current configuration (without sensitive data)
     */
    logConfig() {
        const safeConfig = {
            slack: {
                ...this.slack,
                botToken: this.slack.botToken ? "[REDACTED]" : "NOT_SET",
                appToken: this.slack.appToken ? "[REDACTED]" : "NOT_SET",
            },
            llm: {
                provider: this.llm.provider,
                model: this.llm.model,
                maxTokens: this.llm.maxTokens,
                temperature: this.llm.temperature,
            },
        };
        console.log("Configuration:", JSON.stringify(safeConfig, null, 2));
    }
    /**
     * takes a string representation of a log level, and validates it is one of the valid levels, then returns a typed string of the level
     * @param level
     * @returns
     */
    parseLogLevel(level) {
        const validLevels = ["DEBUG", "INFO", "WARN", "ERROR"];
        if (validLevels.includes(level)) {
            return level;
        }
        return "INFO"; // Default level
    }
}
exports.Config = Config;
/**
 * Initialised Config ready to use
 */
exports.appConfig = new Config();
