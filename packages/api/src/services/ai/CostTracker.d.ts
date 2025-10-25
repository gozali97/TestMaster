export interface CostEntry {
    timestamp: Date;
    model: string;
    operation: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
    userId?: string;
    featureType: string;
}
export declare class CostTracker {
    private static instance;
    private totalCost;
    private entriesBuffer;
    private readonly BUFFER_SIZE;
    private constructor();
    static getInstance(): CostTracker;
    /**
     * Track a new cost entry
     */
    track(entry: CostEntry): Promise<void>;
    /**
     * Get total cost
     */
    getTotalCost(): number;
    /**
     * Get cost summary
     */
    getSummary(): {
        totalCost: number;
        totalEntries: number;
        costByModel: Record<string, number>;
        costByFeature: Record<string, number>;
        tokensByModel: Record<string, number>;
    };
    /**
     * Get cost for specific time period
     */
    getCostForPeriod(startDate: Date, endDate: Date): number;
    /**
     * Get cost for today
     */
    getCostToday(): number;
    /**
     * Get cost for this month
     */
    getCostThisMonth(): number;
    /**
     * Check if cost budget is exceeded
     */
    isBudgetExceeded(monthlyBudget: number): boolean;
    /**
     * Get budget status
     */
    getBudgetStatus(monthlyBudget: number): {
        budget: number;
        spent: number;
        remaining: number;
        percentageUsed: number;
        daysRemaining: number;
        projectedMonthCost: number;
    };
    /**
     * Load total cost from storage
     */
    private loadTotalCost;
    /**
     * Flush buffer to persistent storage
     */
    private flushBuffer;
    /**
     * Reset total cost (for testing)
     */
    reset(): void;
}
declare const _default: CostTracker;
export default _default;
//# sourceMappingURL=CostTracker.d.ts.map