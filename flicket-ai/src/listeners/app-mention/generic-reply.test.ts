import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenericReplyAppMentionHandler } from './generic-reply';
import { LLMFactory } from '../../llm';

// Mock dependencies
vi.mock('../../llm', () => {
  return {
    LLMFactory: {
      createProvider: vi.fn(() => ({
        generateResponse: vi.fn().mockResolvedValue('mocked response')
      }))
    }
  };
});

vi.mock('@traceloop/node-server-sdk', () => {
  return {
    task: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => descriptor
  };
});

describe('GenericReplyAppMentionHandler', () => {
  let handler: GenericReplyAppMentionHandler;
  let mockSay: any;

  beforeEach(() => {
    handler = new GenericReplyAppMentionHandler();
    mockSay = vi.fn().mockResolvedValue(undefined);
  });

  it('should handle app mentions and respond with LLM-generated text', async () => {
    // Arrange
    const mockEvent = {
      text: 'Hello AI bot!',
      ts: '1234567890.123456'
    };

    // Act
    await handler.handle({
      event: mockEvent,
      body: {} as any,
      say: mockSay
    } as any);

    // Assert
    expect(LLMFactory.createProvider).toHaveBeenCalled();
    const llmProvider = (LLMFactory.createProvider as any).mock.results[0].value;
    expect(llmProvider.generateResponse).toHaveBeenCalledWith(
      [],
      mockEvent.text,
      mockEvent.ts
    );
    expect(mockSay).toHaveBeenCalledWith({ text: 'mocked response' });
  });

  it('should pass the correct parameters to the LLM provider', async () => {
    // Arrange
    const mockEvent = {
      text: 'Different message here',
      ts: '9876543210.123456'
    };

    // Act
    await handler.handle({
      event: mockEvent,
      body: {} as any,
      say: mockSay
    } as any);

    // Assert
    const llmProvider = (LLMFactory.createProvider as any).mock.results[0].value;
    expect(llmProvider.generateResponse).toHaveBeenCalledWith(
      [],
      'Different message here',
      '9876543210.123456'
    );
  });
});