"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericUserMessageHandler = void 0;
const node_server_sdk_1 = require("@traceloop/node-server-sdk");
const config_1 = require("../../config/config");
const llm_1 = require("../../llm");
/**
 * This middleware is intended to reply to messages sent to the AI bot directly as a DM.
 * @param param0
 */
/**
 * Class that handles user messages sent to the AI bot directly as a DM.
 */
class GenericUserMessageHandler {
    llmProvider = llm_1.LLMFactory.createProvider(config_1.appConfig);
    /**
     * Gets the thread history for a given channel and thread
     */
    async getThreadHistory(channelId, threadId, { client, logger }) {
        const channelThreadHistory = await client.conversations.replies({
            channel: channelId,
            ts: threadId,
            limit: 50,
        });
        logger?.debug(`Retrieved thread history for channel ${channelId} and thread ${threadId}`);
        return channelThreadHistory.messages;
    }
    /**
     * Handles user messages sent to the AI bot directly as a DM.
     */
    async handle({ client, logger, message, say, setStatus }) {
        if (logger) {
            this.llmProvider.setLogger(logger);
        }
        // check preconditions - is it a DM
        // 'Channel' ids for DM's start with a 'D'
        // Also check it is a thread (has a thread_ts property) all assistant DM's are in threads
        // alo check that the message text is not empty
        if (
        // is not DM
        !message.channel ||
            !message.channel.startsWith("D") ||
            // is not thread
            !("thread_ts" in message) ||
            !message.thread_ts ||
            //has no message text
            !("text" in message) ||
            !message.text) {
            //exit early
            console.log(JSON.stringify(message, null, 2));
            logger?.debug(`Non-DM/Assistant channel, skipping`);
            return;
        }
        const statuses = [
            "Thinking...",
            "Powering up the mainframe...",
            "Loading the flux capacitor...",
            "Cranking the handle...",
            "Summoning the AI spirits...",
            "Consulting the oracle...",
            "Engaging hyperdrive...",
            "Initializing the neural network...",
            "Activating the AI core...",
            "Booting up the AI...",
            "Preparing the quantum computer...",
            "Aligning the stars...",
            "Charging the AI batteries...",
            "Tuning the AI antenna...",
            "Calibrating the AI sensors...",
        ];
        let statusUpdater = setInterval(() => {
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            setStatus(randomStatus);
        }, 2000);
        const assistantHistory = [];
        const conversationHistory = await this.getThreadHistory(message.channel, message.thread_ts, { logger, client });
        if (conversationHistory) {
            assistantHistory.push(...conversationHistory.map((m) => {
                return {
                    role: (m.bot_id ? "assistant" : "user"),
                    content: `From: ${m.user}\nTimestamp: ${m.ts}\nContent:\n${m.text}` || "",
                };
            }));
        }
        const generatedResponse = await this.llmProvider.generateResponse(assistantHistory, message.text, message.thread_ts, (progressMessage) => {
            if (statusUpdater) {
                clearInterval(statusUpdater);
                statusUpdater = undefined;
            }
            setStatus(progressMessage);
        });
        if (statusUpdater) {
            // stop updating the status
            clearInterval(statusUpdater);
        }
        // Handle both string and SlackMessageBlocks responses
        if (typeof generatedResponse === 'string') {
            await say({ text: generatedResponse });
        }
        else {
            await say(generatedResponse);
        }
    }
}
exports.GenericUserMessageHandler = GenericUserMessageHandler;
__decorate([
    (0, node_server_sdk_1.task)({ name: "GenericUserMessageHandler.getThreadHistory" })
], GenericUserMessageHandler.prototype, "getThreadHistory", null);
__decorate([
    (0, node_server_sdk_1.task)({ name: "GenericUserMessageHandler.handle" })
], GenericUserMessageHandler.prototype, "handle", null);
