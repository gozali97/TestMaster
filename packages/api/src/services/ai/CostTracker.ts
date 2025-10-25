import { Logger } from '../../utils/logger';
import MetricsCollector from '../MetricsCollector';

const logger = new Logger('CostTracker');

export interface CostEntry {
  timestamp: Date;
  model: string;
  operation: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  userId?: string;
  featureType: string; // 'failure_analysis', 'test_generation', etc.
}

export class CostTracker {
  private static instance: CostTracker;
  private totalCost: number = 0;
  private entriesBuffer: CostEntry[] = [];
  private readonly BUFFER_SIZE = 100;

  private constructor() {
    // Load previous total from persistent storage if needed
    this.loadTotalCost();
  }

  public static getInstance(): CostTracker {
    if (!CostTracker.instance) {
      CostTracker.instance = new CostTracker();
    }
    return CostTracker.instance;
  }

  /**
   * Track a new cost entry
   */
  public async track(entry: CostEntry): Promise<void> {
    this.totalCost += entry.cost;
    this.entriesBuffer.push(entry);

    logger.info('LLM cost tracked', {
      operation: entry.operation,
      model: entry.model,
      tokens: entry.totalTokens,
      cost: `$${entry.cost.toFixed(4)}`,
      totalCost: `$${this.totalCost.toFixed(2)}`,
    });

    // Record to metrics
    await MetricsCollector.recordMetric({
      metricName: 'llm_cost',
      metricValue: entry.cost,
      tags: {
        model: entry.model,
        operation: entry.operation,
        featureType: entry.featureType,
        tokens: entry.totalTokens.toString(),
      },
      timestamp: entry.timestamp,
    });

    await MetricsCollector.recordMetric({
      metricName: 'llm_tokens_used',
      metricValue: entry.totalTokens,
      tags: {
        model: entry.model,
        operation: entry.operation,
        tokenType: 'total',
      },
      timestamp: entry.timestamp,
    });

    // Flush buffer if full
    if (this.entriesBuffer.length >= this.BUFFER_SIZE) {
      await this.flushBuffer();
    }
  }

  /**
   * Get total cost
   */
  public getTotalCost(): number {
    return this.totalCost;
  }

  /**
   * Get cost summary
   */
  public getSummary(): {
    totalCost: number;
    totalEntries: number;
    costByModel: Record<string, number>;
    costByFeature: Record<string, number>;
    tokensByModel: Record<string, number>;
  } {
    const costByModel: Record<string, number> = {};
    const costByFeature: Record<string, number> = {};
    const tokensByModel: Record<string, number> = {};

    for (const entry of this.entriesBuffer) {
      costByModel[entry.model] = (costByModel[entry.model] || 0) + entry.cost;
      costByFeature[entry.featureType] = (costByFeature[entry.featureType] || 0) + entry.cost;
      tokensByModel[entry.model] = (tokensByModel[entry.model] || 0) + entry.totalTokens;
    }

    return {
      totalCost: this.totalCost,
      totalEntries: this.entriesBuffer.length,
      costByModel,
      costByFeature,
      tokensByModel,
    };
  }

  /**
   * Get cost for specific time period
   */
  public getCostForPeriod(startDate: Date, endDate: Date): number {
    return this.entriesBuffer
      .filter((entry) => entry.timestamp >= startDate && entry.timestamp <= endDate)
      .reduce((sum, entry) => sum + entry.cost, 0);
  }

  /**
   * Get cost for today
   */
  public getCostToday(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.getCostForPeriod(today, tomorrow);
  }

  /**
   * Get cost for this month
   */
  public getCostThisMonth(): number {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return this.getCostForPeriod(startOfMonth, endOfMonth);
  }

  /**
   * Check if cost budget is exceeded
   */
  public isBudgetExceeded(monthlyBudget: number): boolean {
    const monthCost = this.getCostThisMonth();
    return monthCost >= monthlyBudget;
  }

  /**
   * Get budget status
   */
  public getBudgetStatus(monthlyBudget: number): {
    budget: number;
    spent: number;
    remaining: number;
    percentageUsed: number;
    daysRemaining: number;
    projectedMonthCost: number;
  } {
    const spent = this.getCostThisMonth();
    const remaining = Math.max(0, monthlyBudget - spent);
    const percentageUsed = (spent / monthlyBudget) * 100;

    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysRemaining = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    const daysPassed = now.getDate();
    const avgDailyCost = spent / daysPassed;
    const projectedMonthCost = avgDailyCost * endOfMonth.getDate();

    return {
      budget: monthlyBudget,
      spent,
      remaining,
      percentageUsed,
      daysRemaining,
      projectedMonthCost,
    };
  }

  /**
   * Load total cost from storage
   */
  private async loadTotalCost(): Promise<void> {
    // Could load from database if needed
    logger.info('Cost tracker initialized');
  }

  /**
   * Flush buffer to persistent storage
   */
  private async flushBuffer(): Promise<void> {
    try {
      // Could save to database if needed
      logger.debug(`Flushed ${this.entriesBuffer.length} cost entries`);
      this.entriesBuffer = [];
    } catch (error) {
      logger.error('Failed to flush cost entries', error);
    }
  }

  /**
   * Reset total cost (for testing)
   */
  public reset(): void {
    this.totalCost = 0;
    this.entriesBuffer = [];
    logger.warn('Cost tracker reset');
  }
}

export default CostTracker.getInstance();
