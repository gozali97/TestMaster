import { Page } from 'playwright';
import { SelfHealingConfig } from './HealingStrategy.interface';
import { HealingResult, HealingContext, HealingEventData, LocatorOption } from '@testmaster/shared/types/healing';
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
export declare class SelfHealingEngine {
    private page;
    private onHealingEvent?;
    private healingService?;
    private strategies;
    private config;
    private healingHistory;
    constructor(page: Page, config?: Partial<SelfHealingConfig>, onHealingEvent?: (event: HealingEventData) => Promise<void>, healingService?: any);
    /**
     * Initialize healing strategies based on configuration
     */
    private initializeStrategies;
    /**
     * Main healing method - attempts to heal a failed locator
     */
    heal(context: HealingContext): Promise<HealingResult | null>;
    /**
     * Check if healing should be auto-applied based on confidence
     */
    shouldAutoApply(confidence: number): boolean;
    /**
     * Check if healing should be suggested for manual review
     */
    shouldSuggest(confidence: number): boolean;
    /**
     * Get healing decision
     */
    getHealingDecision(confidence: number): 'auto' | 'suggest' | 'reject';
    /**
     * Log healing event to database/metrics
     */
    private logHealingEvent;
    /**
     * Get historical healing for a locator
     */
    private getHistoricalHealing;
    /**
     * Add healing to history
     */
    private addToHistory;
    /**
     * Update object repository for Fallback strategy
     */
    updateObjectRepository(objectId: number, locators: LocatorOption[]): void;
    /**
     * Get healing statistics
     */
    getStatistics(): {
        totalAttempts: number;
        successfulHeals: number;
        byStrategy: {
            [key: string]: number;
        };
    };
    /**
     * Clear healing history
     */
    clearHistory(): void;
    /**
     * Get configuration
     */
    getConfig(): SelfHealingConfig;
    /**
     * Update configuration
     */
    updateConfig(config: Partial<SelfHealingConfig>): void;
}
//# sourceMappingURL=SelfHealingEngine.d.ts.map