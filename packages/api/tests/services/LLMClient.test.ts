import { describe, it, expect, beforeAll } from '@playwright/test';
import { LLMClient } from '../../src/services/ai/LLMClient';

describe('LLMClient', () => {
  let llmClient: LLMClient;

  beforeAll(() => {
    llmClient = LLMClient.getInstance();
  });

  it('should be a singleton', () => {
    const instance1 = LLMClient.getInstance();
    const instance2 = LLMClient.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should check if enabled based on API key', () => {
    const isEnabled = llmClient.isEnabled();
    // Will be false if OPENAI_API_KEY not set
    expect(typeof isEnabled).toBe('boolean');
  });

  it('should get usage stats', () => {
    const stats = llmClient.getUsageStats();
    expect(stats).toHaveProperty('requestCount');
    expect(stats).toHaveProperty('rateLimitRemaining');
    expect(typeof stats.requestCount).toBe('number');
    expect(typeof stats.rateLimitRemaining).toBe('number');
  });

  // Skip actual API calls in tests unless API key is configured
  it.skip('should complete a simple prompt', async () => {
    const response = await llmClient.complete('Say "Hello, TestMaster!"');
    expect(response).toContain('Hello');
  });

  it.skip('should chat with multiple messages', async () => {
    const response = await llmClient.chat([
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What is 2+2?' }
    ]);
    
    expect(response).toHaveProperty('content');
    expect(response).toHaveProperty('tokens');
    expect(response).toHaveProperty('cost');
    expect(response.content).toBeTruthy();
  });
});
