import { Page } from 'playwright';
import { HealingResult, HealingContext } from '@testmaster/shared/types/healing';
/**
 * Base interface for all healing strategies
 * Each strategy implements a different approach to healing failed locators
 */
export interface HealingStrategy {
    /**
     * Name of the strategy
     */
    readonly name: string;
    /**
     * Priority order (lower = higher priority)
     */
    readonly priority: number;
    /**
     * Attempt to heal a failed locator
     *
     * @param context - Context about the failure
     * @param page - Playwright page instance
     * @returns HealingResult if successful, null otherwise
     */
    heal(context: HealingContext, page: Page): Promise<HealingResult | null>;
    /**
     * Check if this strategy is applicable for the given context
     *
     * @param context - Context about the failure
     * @returns true if strategy should be attempted
     */
    isApplicable(context: HealingContext): boolean;
}
/**
 * Configuration for self-healing behavior
 */
export interface SelfHealingConfig {
    /**
     * Enable/disable self-healing
     */
    enabled: boolean;
    /**
     * Auto-apply heals above this confidence threshold
     */
    autoApplyThreshold: number;
    /**
     * Suggest heals between these thresholds for manual review
     */
    suggestionThreshold: {
        min: number;
        max: number;
    };
    /**
     * Maximum time (ms) to spend on healing attempts
     */
    maxHealingTime: number;
    /**
     * Which strategies to enable
     */
    enabledStrategies: string[];
    /**
     * Strategy-specific configuration
     */
    strategyConfig?: {
        fallback?: {
            maxLocatorsToTry: number;
        };
        similarity?: {
            minSimilarityScore: number;
        };
        visual?: {
            matchThreshold: number;
        };
        historical?: {
            lookbackDays: number;
            minSuccessCount: number;
        };
    };
}
/**
 * Default configuration
 */
export declare const DEFAULT_HEALING_CONFIG: SelfHealingConfig;
//# sourceMappingURL=HealingStrategy.interface.d.ts.map