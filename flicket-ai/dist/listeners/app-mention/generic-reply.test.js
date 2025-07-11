"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const generic_reply_1 = require("./generic-reply");
const llm_1 = require("../../llm");
// Mock dependencies
vitest_1.vi.mock('../../llm', () => {
    return {
        LLMFactory: {
            createProvider: vitest_1.vi.fn(() => ({
                generateResponse: vitest_1.vi.fn().mockResolvedValue('mocked response')
            }))
        }
    };
});
vitest_1.vi.mock('@traceloop/node-server-sdk', () => {
    return {
        task: () => (target, propertyKey, descriptor) => descriptor
    };
});
(0, vitest_1.describe)('GenericReplyAppMentionHandler', () => {
    let handler;
    let mockSay;
    (0, vitest_1.beforeEach)(() => {
        handler = new generic_reply_1.GenericReplyAppMentionHandler();
        mockSay = vitest_1.vi.fn().mockResolvedValue(undefined);
    });
    (0, vitest_1.it)('should handle app mentions and respond with LLM-generated text', async () => {
        // Arrange
        const mockEvent = {
            text: 'Hello AI bot!',
            ts: '1234567890.123456'
        };
        // Act
        await handler.handle({
            event: mockEvent,
            body: {},
            say: mockSay
        });
        // Assert
        (0, vitest_1.expect)(llm_1.LLMFactory.createProvider).toHaveBeenCalled();
        const llmProvider = llm_1.LLMFactory.createProvider.mock.results[0].value;
        (0, vitest_1.expect)(llmProvider.generateResponse).toHaveBeenCalledWith([], mockEvent.text, mockEvent.ts);
        (0, vitest_1.expect)(mockSay).toHaveBeenCalledWith({ text: 'mocked response' });
    });
    (0, vitest_1.it)('should pass the correct parameters to the LLM provider', async () => {
        // Arrange
        const mockEvent = {
            text: 'Different message here',
            ts: '9876543210.123456'
        };
        // Act
        await handler.handle({
            event: mockEvent,
            body: {},
            say: mockSay
        });
        // Assert
        const llmProvider = llm_1.LLMFactory.createProvider.mock.results[0].value;
        (0, vitest_1.expect)(llmProvider.generateResponse).toHaveBeenCalledWith([], 'Different message here', '9876543210.123456');
    });
});
