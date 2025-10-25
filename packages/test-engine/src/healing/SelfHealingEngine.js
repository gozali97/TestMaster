"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelfHealingEngine = void 0;
const HealingStrategy_interface_1 = require("./HealingStrategy.interface");
const FallbackLocatorStrategy_1 = require("./FallbackLocatorStrategy");
const SimilarityStrategy_1 = require("./SimilarityStrategy");
const VisualMatchStrategy_1 = require("./VisualMatchStrategy");
const HistoricalStrategy_1 = require("./HistoricalStrategy");
/**
 * Self-Healing Engine
 *
 * Orchestrates multiple healing strategies to automatically fix broken test locators.
 *
 * Strategy Priority (executed in order):
 * 0. HISTORICAL - Learn from past healings (instant, 5% boost)
 * 1. FALLBACK - Try alternative locators (fast, 60% success)
 * 2. SIMILARITY - DOM similarity analysis (medium, 25% success)
 * 3. VISUAL - Visual template matching (slow, 10% success)
 *
 * Total Expected Success Rate: 90%+
 */
class SelfHealingEngine {
    page;
    onHealingEvent;
    healingService;
    strategies;
    config;
    healingHistory = new Map();
    constructor(page, config = {}, onHealingEvent, healingService // Optional HealingService for Historical strategy
    ) {
        this.page = page;
        this.onHealingEvent = onHealingEvent;
        this.healingService = healingService;
        this.config = { ...HealingStrategy_interface_1.DEFAULT_HEALING_CONFIG, ...config };
        this.strategies = this.initializeStrategies();
    }
    /**
     * Initialize healing strategies based on configuration
     */
    initializeStrategies() {
        const strategies = [];
        // Historical strategy (highest priority - instant)
        if (this.config.enabledStrategies.includes('HISTORICAL') && this.healingService) {
            const historical = new HistoricalStrategy_1.HistoricalStrategy(this.healingService);
            strategies.push(historical);
        }
        // Fallback strategy (second priority - fast and reliable)
        if (this.config.enabledStrategies.includes('FALLBACK')) {
            strategies.push(new FallbackLocatorStrategy_1.FallbackLocatorStrategy());
        }
        // Similarity strategy (third priority - medium speed)
        if (this.config.enabledStrategies.includes('SIMILARITY')) {
            strategies.push(new SimilarityStrategy_1.SimilarityStrategy());
        }
        // Visual strategy (lowest priority - slow but robust)
        if (this.config.enabledStrategies.includes('VISUAL')) {
            strategies.push(new VisualMatchStrategy_1.VisualMatchStrategy());
        }
        // Sort by priority (lower number = higher priority)
        return strategies.sort((a, b) => a.priority - b.priority);
    }
    /**
     * Main healing method - attempts to heal a failed locator
     */
    async heal(context) {
        if (!this.config.enabled) {
            return null;
        }
        const startTime = Date.now();
        const timeout = this.config.maxHealingTime;
        console.log(`\n🔧 Self-Healing: Attempting to heal locator "${context.failedLocator}"...`);
        // Check historical healings first (instant)
        const historicalHeal = this.getHistoricalHealing(context.failedLocator);
        if (historicalHeal) {
            console.log(`✅ Self-Healing: Found historical healing (confidence: ${historicalHeal.confidence})`);
            return historicalHeal;
        }
        // Try each strategy in order
        for (const strategy of this.strategies) {
            // Check timeout
            if (Date.now() - startTime > timeout) {
                console.log(`⏰ Self-Healing: Timeout reached (${timeout}ms)`);
                break;
            }
            // Check if strategy is applicable
            if (!strategy.isApplicable(context)) {
                console.log(`⏭️  Self-Healing: ${strategy.name} strategy not applicable`);
                continue;
            }
            console.log(`🔍 Self-Healing: Trying ${strategy.name} strategy...`);
            try {
                const result = await strategy.heal(context, this.page);
                if (result) {
                    const executionTime = Date.now() - startTime;
                    result.metadata = {
                        ...result.metadata,
                        executionTime,
                    };
                    console.log(`✅ Self-Healing: SUCCESS with ${result.strategy} strategy!`);
                    console.log(`   New locator: ${result.newLocator}`);
                    console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
                    console.log(`   Execution time: ${executionTime}ms`);
                    // Store in history
                    this.addToHistory(context.failedLocator, result);
                    // Log healing event if callback provided
                    if (this.onHealingEvent) {
                        await this.logHealingEvent(context, result);
                    }
                    return result;
                }
            }
            catch (error) {
                console.log(`❌ Self-Healing: ${strategy.name} strategy failed:`, error);
            }
        }
        console.log(`❌ Self-Healing: All strategies failed`);
        return null;
    }
    /**
     * Check if healing should be auto-applied based on confidence
     */
    shouldAutoApply(confidence) {
        return confidence >= this.config.autoApplyThreshold;
    }
    /**
     * Check if healing should be suggested for manual review
     */
    shouldSuggest(confidence) {
        return (confidence >= this.config.suggestionThreshold.min &&
            confidence < this.config.suggestionThreshold.max);
    }
    /**
     * Get healing decision
     */
    getHealingDecision(confidence) {
        if (this.shouldAutoApply(confidence)) {
            return 'auto';
        }
        if (this.shouldSuggest(confidence)) {
            return 'suggest';
        }
        return 'reject';
    }
    /**
     * Log healing event to database/metrics
     */
    async logHealingEvent(context, result) {
        if (!this.onHealingEvent) {
            return;
        }
        const event = {
            testResultId: 0, // Will be set by caller
            testCaseId: context.testCaseId,
            objectId: context.objectId,
            stepIndex: context.stepIndex,
            failedLocator: context.failedLocator,
            healedLocator: result.newLocator,
            strategy: result.strategy,
            confidence: result.confidence,
            autoApplied: this.shouldAutoApply(result.confidence),
            metadata: {
                ...result.metadata,
                errorMessage: context.errorMessage,
            },
        };
        await this.onHealingEvent(event);
    }
    /**
     * Get historical healing for a locator
     */
    getHistoricalHealing(locator) {
        const history = this.healingHistory.get(locator);
        if (!history || history.length === 0) {
            return null;
        }
        // Get most recent successful healing
        const recent = history[history.length - 1];
        // Boost confidence slightly for historical match (proven to work)
        return {
            ...recent,
            strategy: 'HISTORICAL',
            confidence: Math.min(recent.confidence + 0.05, 0.99),
            metadata: {
                ...recent.metadata,
                reason: 'Used previously successful healing',
                originalStrategy: recent.strategy,
            },
        };
    }
    /**
     * Add healing to history
     */
    addToHistory(locator, result) {
        if (!this.healingHistory.has(locator)) {
            this.healingHistory.set(locator, []);
        }
        const history = this.healingHistory.get(locator);
        history.push(result);
        // Keep only last 10 healings per locator
        if (history.length > 10) {
            history.shift();
        }
    }
    /**
     * Update object repository for Fallback strategy
     */
    updateObjectRepository(objectId, locators) {
        for (const strategy of this.strategies) {
            if (strategy instanceof FallbackLocatorStrategy_1.FallbackLocatorStrategy) {
                strategy.updateObjectRepository(objectId, locators);
            }
        }
    }
    /**
     * Get healing statistics
     */
    getStatistics() {
        let totalAttempts = 0;
        let successfulHeals = 0;
        const byStrategy = {};
        for (const history of this.healingHistory.values()) {
            totalAttempts += history.length;
            successfulHeals += history.length; // All in history are successful
            for (const heal of history) {
                byStrategy[heal.strategy] = (byStrategy[heal.strategy] || 0) + 1;
            }
        }
        return {
            totalAttempts,
            successfulHeals,
            byStrategy,
        };
    }
    /**
     * Clear healing history
     */
    clearHistory() {
        this.healingHistory.clear();
    }
    /**
     * Get configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.strategies = this.initializeStrategies();
    }
}
exports.SelfHealingEngine = SelfHealingEngine;
//# sourceMappingURL=SelfHealingEngine.js.map