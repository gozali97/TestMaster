import { Page } from 'playwright';
import { HealingStrategy } from './HealingStrategy.interface';
import { HealingResult, HealingContext, LocatorOption } from '@testmaster/shared/types/healing';
/**
 * Fallback Locator Strategy
 *
 * Tries alternative locators for the same element.
 * This is the fastest and most reliable strategy (60% success rate).
 *
 * How it works:
 * 1. Get all known locators for the object from object repository
 * 2. Try each locator in priority order
 * 3. Return first working locator
 */
export declare class FallbackLocatorStrategy implements HealingStrategy {
    private objectRepository;
    readonly name = "FALLBACK";
    readonly priority = 1;
    constructor(objectRepository?: Map<number, {
        locators: LocatorOption[];
    }>);
    /**
     * Check if strategy is applicable
     * Only works if we have an objectId with multiple locators
     */
    isApplicable(context: HealingContext): boolean;
    /**
     * Attempt to heal using fallback locators
     */
    heal(context: HealingContext, page: Page): Promise<HealingResult | null>;
    /**
     * Update object repository with new locators
     * This would typically be called from a service that manages objects
     */
    updateObjectRepository(objectId: number, locators: LocatorOption[]): void;
    /**
     * Generate common fallback locators for a given failed locator
     * This is used when we don't have an object repository entry
     */
    generateFallbackLocators(failedLocator: string, page: Page): Promise<HealingResult | null>;
    /**
     * Generate alternative locators based on the failed locator
     */
    private generateAlternativeLocators;
}
//# sourceMappingURL=FallbackLocatorStrategy.d.ts.map