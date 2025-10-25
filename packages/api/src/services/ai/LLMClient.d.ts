export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface CompletionOptions {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stop?: string[];
}
export interface LLMResponse {
    content: string;
    model: string;
    tokens: {
        prompt: number;
        completion: number;
        total: number;
    };
    cost: number;
    cached: boolean;
}
export declare class LLMClient {
    private static instance;
    private openai;
    private enabled;
    private requestCount;
    private lastRequestTime;
    private readonly RATE_LIMIT;
    private readonly RATE_WINDOW;
    private cache;
    private readonly PRICING;
    private constructor();
    private initializeOpenAI;
    static getInstance(): LLMClient;
    /**
     * Check if LLM client is enabled and ready
     */
    isEnabled(): boolean;
    /**
     * Rate limiting check
     */
    private checkRateLimit;
    /**
     * Generate cache key for request
     */
    private getCacheKey;
    /**
     * Get cached response (in-memory)
     */
    private getCachedResponse;
    /**
     * Cache response (in-memory)
     */
    private cacheResponse;
    /**
     * Calculate cost for tokens
     */
    private calculateCost;
    /**
     * Chat completion with multiple messages
     */
    chat(messages: ChatMessage[], options?: CompletionOptions): Promise<LLMResponse>;
    /**
     * Simple completion (single prompt)
     */
    complete(prompt: string, options?: CompletionOptions): Promise<string>;
    /**
     * Get embeddings for text (for similarity search)
     */
    getEmbeddings(text: string): Promise<number[]>;
    /**
     * Get usage statistics
     */
    getUsageStats(): {
        requestCount: number;
        rateLimitRemaining: number;
    };
    /**
     * Close connections & clear cache
     */
    close(): Promise<void>;
}
declare const _default: LLMClient;
export default _default;
//# sourceMappingURL=LLMClient.d.ts.map