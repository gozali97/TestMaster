/**
 * AI Services Module
 * 
 * Provides AI-powered features for TestMaster:
 * - LLMClient: OpenAI GPT-4 integration
 * - PromptTemplates: Pre-built prompts for common tasks
 * - CostTracker: Track AI API usage and costs
 */

export { LLMClient } from './LLMClient';
export { PromptTemplates } from './PromptTemplates';
export { CostTracker } from './CostTracker';

export type { ChatMessage, CompletionOptions, LLMResponse } from './LLMClient';
export type { CostEntry } from './CostTracker';

// Re-export singleton instances
import LLMClient from './LLMClient';
import CostTracker from './CostTracker';

export { LLMClient as llmClient, CostTracker as costTracker };
