"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genericUserMessageMiddleware = void 0;
const config_1 = require("../../config/config");
const llm_1 = require("../../llm");
const llmProvider = llm_1.LLMFactory.createProvider(config_1.appConfig);
const DEFAULT_SYSTEM_CONTENT = config_1.appConfig.assistant.systemContent;
/**
 * Thi middleware is inteded to reply to messages sent to the ai bot directly as a DM.
 * @param param0
 */
const genericUserMessageMiddleware = async ({ client, logger, message, say, setStatus }) => {
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
    const statuses = ["Thinking...", "Powering up the mainframe...", "Loading the flux capacitor...", "Cranking the handle...", "Summoning the AI spirits...", "Consulting the oracle...", "Engaging hyperdrive...", "Initializing the neural network...", "Activating the AI core...", "Booting up the AI...", "Preparing the quantum computer...", "Aligning the stars...", "Charging the AI batteries...", "Tuning the AI antenna...", "Calibrating the AI sensors..."];
    const statusUpdater = setInterval(() => {
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        setStatus(randomStatus);
    }, 2000);
    const assistantHistory = [];
    const conversationHistory = await getThreadHistory(message.channel, message.thread_ts, { logger, client });
    if (conversationHistory) {
        assistantHistory.push(...conversationHistory.map((m) => {
            return {
                role: (m.bot_id ? "assistant" : "user"),
                content: `From: ${m.user}\nTimestamp: ${m.ts}\nContent:\n${m.text}` || "",
            };
        }));
    }
    const generatedResponse = await llmProvider.generateResponse(assistantHistory, message.text, message.thread_ts);
    // stop updating the status
    clearInterval(statusUpdater);
    await say({ text: generatedResponse });
};
exports.genericUserMessageMiddleware = genericUserMessageMiddleware;
const getThreadHistory = async (channelId, threadId, { client, logger }) => {
    const channelThreadHistory = await client.conversations.replies({
        channel: channelId,
        ts: threadId,
        limit: 50,
    });
    return channelThreadHistory.messages;
};
