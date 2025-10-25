import OpenAI from 'openai';
import { Logger } from '../../utils/logger';

const logger = new Logger('LLMClient');

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

export class LLMClient {
  private static instance: LLMClient;
  private openai: OpenAI | null = null;
  private enabled: boolean;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;
  private readonly RATE_LIMIT = 60; // requests per minute
  private readonly RATE_WINDOW = 60000; // 1 minute in ms
  // Redis caching removed - using in-memory cache instead
  private cache: Map<string, { response: LLMResponse; expires: number }> = new Map();

  // GPT-4 pricing (as of 2024)
  private readonly PRICING = {
    'gpt-4-turbo-preview': {
      prompt: 0.01 / 1000, // $0.01 per 1K tokens
      completion: 0.03 / 1000, // $0.03 per 1K tokens
    },
    'gpt-4': {
      prompt: 0.03 / 1000,
      completion: 0.06 / 1000,
    },
    'gpt-3.5-turbo': {
      prompt: 0.0005 / 1000,
      completion: 0.0015 / 1000,
    },
  };

  private constructor() {
    this.enabled = !!process.env.OPENAI_API_KEY;

    if (this.enabled) {
      this.initializeOpenAI();
    } else {
      logger.warn('OpenAI API key not configured. LLM features disabled.');
    }
  }

  private initializeOpenAI(): void {
    try {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      logger.info('OpenAI client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize OpenAI client', error);
      this.enabled = false;
    }
  }



  public static getInstance(): LLMClient {
    if (!LLMClient.instance) {
      LLMClient.instance = new LLMClient();
    }
    return LLMClient.instance;
  }

  /**
   * Check if LLM client is enabled and ready
   */
  public isEnabled(): boolean {
    return this.enabled && this.openai !== null;
  }

  /**
   * Rate limiting check
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    // Reset counter if outside window
    if (timeSinceLastRequest > this.RATE_WINDOW) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }

    // Check if rate limit exceeded
    if (this.requestCount >= this.RATE_LIMIT) {
      const waitTime = this.RATE_WINDOW - timeSinceLastRequest;
      logger.warn(`Rate limit reached. Waiting ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastRequestTime = Date.now();
    }

    this.requestCount++;
  }

  /**
   * Generate cache key for request
   */
  private getCacheKey(messages: ChatMessage[], options: CompletionOptions): string {
    const hash = JSON.stringify({ messages, options });
    return `llm:cache:${Buffer.from(hash).toString('base64').substring(0, 64)}`;
  }

  /**
   * Get cached response (in-memory)
   */
  private async getCachedResponse(cacheKey: string): Promise<LLMResponse | null> {
    try {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expires > Date.now()) {
        logger.debug('Cache hit for LLM request');
        const response = { ...cached.response };
        response.cached = true;
        return response;
      } else if (cached) {
        // Remove expired cache
        this.cache.delete(cacheKey);
      }
    } catch (error) {
      logger.warn('Failed to get cached response', error);
    }

    return null;
  }

  /**
   * Cache response (in-memory)
   */
  private async cacheResponse(cacheKey: string, response: LLMResponse, ttl: number = 86400): Promise<void> {
    try {
      // Clean old cache entries (simple LRU)
      if (this.cache.size > 1000) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }

      this.cache.set(cacheKey, {
        response: { ...response },
        expires: Date.now() + ttl * 1000,
      });
      logger.debug('Cached LLM response');
    } catch (error) {
      logger.warn('Failed to cache response', error);
    }
  }

  /**
   * Calculate cost for tokens
   */
  private calculateCost(model: string, promptTokens: number, completionTokens: number): number {
    const pricing = this.PRICING[model as keyof typeof this.PRICING] || this.PRICING['gpt-4-turbo-preview'];
    return promptTokens * pricing.prompt + completionTokens * pricing.completion;
  }

  /**
   * Chat completion with multiple messages
   */
  public async chat(
    messages: ChatMessage[],
    options: CompletionOptions = {}
  ): Promise<LLMResponse> {
    if (!this.isEnabled()) {
      throw new Error('LLM client is not enabled. Please configure OPENAI_API_KEY.');
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    const temperature = options.temperature ?? parseFloat(process.env.OPENAI_TEMPERATURE || '0.1');
    const maxTokens = options.maxTokens ?? parseInt(process.env.OPENAI_MAX_TOKENS || '2000');

    // Check cache
    const cacheKey = this.getCacheKey(messages, options);
    const cached = await this.getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }

    // Rate limiting
    await this.checkRateLimit();

    try {
      logger.debug('Sending chat completion request', { model, messages: messages.length });

      const response = await this.openai!.chat.completions.create({
        model,
        messages: messages as any,
        temperature,
        max_tokens: maxTokens,
        top_p: options.topP,
        frequency_penalty: options.frequencyPenalty,
        presence_penalty: options.presencePenalty,
        stop: options.stop,
      });

      const content = response.choices[0]?.message?.content || '';
      const usage = response.usage!;
      const cost = this.calculateCost(model, usage.prompt_tokens, usage.completion_tokens);

      const llmResponse: LLMResponse = {
        content,
        model,
        tokens: {
          prompt: usage.prompt_tokens,
          completion: usage.completion_tokens,
          total: usage.total_tokens,
        },
        cost,
        cached: false,
      };

      // Cache response
      await this.cacheResponse(cacheKey, llmResponse);

      logger.info('Chat completion successful', {
        tokens: usage.total_tokens,
        cost: `$${cost.toFixed(4)}`,
      });

      return llmResponse;
    } catch (error: any) {
      logger.error('Chat completion failed', error);
      
      // Handle specific OpenAI errors
      if (error.status === 429) {
        throw new Error('OpenAI rate limit exceeded. Please try again later.');
      } else if (error.status === 401) {
        throw new Error('Invalid OpenAI API key.');
      } else if (error.status === 500) {
        throw new Error('OpenAI service error. Please try again later.');
      }
      
      throw error;
    }
  }

  /**
   * Simple completion (single prompt)
   */
  public async complete(prompt: string, options: CompletionOptions = {}): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await this.chat(messages, options);
    return response.content;
  }

  /**
   * Get embeddings for text (for similarity search)
   */
  public async getEmbeddings(text: string): Promise<number[]> {
    if (!this.isEnabled()) {
      throw new Error('LLM client is not enabled.');
    }

    // Check cache (in-memory)
    const cacheKey = `llm:embeddings:${Buffer.from(text).toString('base64').substring(0, 64)}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      logger.debug('Cache hit for embeddings');
      return cached.response as any; // embeddings stored as response
    }

    // Rate limiting
    await this.checkRateLimit();

    try {
      const response = await this.openai!.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      const embeddings = response.data[0].embedding;

      // Cache embeddings (7 days)
      this.cache.set(cacheKey, {
        response: embeddings as any,
        expires: Date.now() + 86400 * 7 * 1000,
      });

      return embeddings;
    } catch (error) {
      logger.error('Failed to get embeddings', error);
      throw error;
    }
  }

  /**
   * Get usage statistics
   */
  public getUsageStats(): {
    requestCount: number;
    rateLimitRemaining: number;
  } {
    return {
      requestCount: this.requestCount,
      rateLimitRemaining: Math.max(0, this.RATE_LIMIT - this.requestCount),
    };
  }

  /**
   * Close connections & clear cache
   */
  public async close(): Promise<void> {
    this.cache.clear();
    logger.info('LLM cache cleared');
  }
}

export default LLMClient.getInstance();
