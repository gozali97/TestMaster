"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostTracker = void 0;
const logger_1 = require("../../utils/logger");
const MetricsCollector_1 = __importDefault(require("../MetricsCollector"));
const logger = new logger_1.Logger('CostTracker');
class CostTracker {
    static instance;
    totalCost = 0;
    entriesBuffer = [];
    BUFFER_SIZE = 100;
    constructor() {
        // Load previous total from persistent storage if needed
        this.loadTotalCost();
    }
    static getInstance() {
        if (!CostTracker.instance) {
            CostTracker.instance = new CostTracker();
        }
        return CostTracker.instance;
    }
    /**
     * Track a new cost entry
     */
    async track(entry) {
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
        await MetricsCollector_1.default.recordMetric({
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
        await MetricsCollector_1.default.recordMetric({
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
    getTotalCost() {
        return this.totalCost;
    }
    /**
     * Get cost summary
     */
    getSummary() {
        const costByModel = {};
        const costByFeature = {};
        const tokensByModel = {};
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
    getCostForPeriod(startDate, endDate) {
        return this.entriesBuffer
            .filter((entry) => entry.timestamp >= startDate && entry.timestamp <= endDate)
            .reduce((sum, entry) => sum + entry.cost, 0);
    }
    /**
     * Get cost for today
     */
    getCostToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.getCostForPeriod(today, tomorrow);
    }
    /**
     * Get cost for this month
     */
    getCostThisMonth() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        return this.getCostForPeriod(startOfMonth, endOfMonth);
    }
    /**
     * Check if cost budget is exceeded
     */
    isBudgetExceeded(monthlyBudget) {
        const monthCost = this.getCostThisMonth();
        return monthCost >= monthlyBudget;
    }
    /**
     * Get budget status
     */
    getBudgetStatus(monthlyBudget) {
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
    async loadTotalCost() {
        // Could load from database if needed
        logger.info('Cost tracker initialized');
    }
    /**
     * Flush buffer to persistent storage
     */
    async flushBuffer() {
        try {
            // Could save to database if needed
            logger.debug(`Flushed ${this.entriesBuffer.length} cost entries`);
            this.entriesBuffer = [];
        }
        catch (error) {
            logger.error('Failed to flush cost entries', error);
        }
    }
    /**
     * Reset total cost (for testing)
     */
    reset() {
        this.totalCost = 0;
        this.entriesBuffer = [];
        logger.warn('Cost tracker reset');
    }
}
exports.CostTracker = CostTracker;
exports.default = CostTracker.getInstance();
//# sourceMappingURL=CostTracker.js.map