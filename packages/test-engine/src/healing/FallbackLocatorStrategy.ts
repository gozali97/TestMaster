import { Page } from 'playwright';
import { HealingStrategy } from './HealingStrategy.interface';
import { HealingResult, HealingContext, LocatorOption } from '@testmaster/shared';

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
export class FallbackLocatorStrategy implements HealingStrategy {
  readonly name = 'FALLBACK';
  readonly priority = 1; // Highest priority

  constructor(
    private objectRepository: Map<number, { locators: LocatorOption[] }> = new Map()
  ) {}

  /**
   * Check if strategy is applicable
   * Only works if we have an objectId with multiple locators
   */
  isApplicable(context: HealingContext): boolean {
    if (!context.objectId) {
      return false;
    }

    const object = this.objectRepository.get(context.objectId);
    return object ? object.locators.length > 1 : false;
  }

  /**
   * Attempt to heal using fallback locators
   */
  async heal(context: HealingContext, page: Page): Promise<HealingResult | null> {
    if (!context.objectId) {
      return null;
    }

    const object = this.objectRepository.get(context.objectId);
    if (!object || object.locators.length === 0) {
      return null;
    }

    // Sort locators by priority (lower = higher priority)
    const sortedLocators = [...object.locators].sort((a, b) => {
      // Primary sort: priority
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // Secondary sort: success rate (if available)
      return (b.successRate || 0) - (a.successRate || 0);
    });

    const alternativeLocators: string[] = [];

    // Try each locator
    for (const locator of sortedLocators) {
      // Skip the failed locator
      if (locator.value === context.failedLocator) {
        continue;
      }

      alternativeLocators.push(locator.value);

      try {
        // Try to find element with this locator
        const element = await page.locator(locator.value).first();
        
        // Wait for element to be visible (with short timeout)
        await element.waitFor({ state: 'visible', timeout: 2000 });

        // Verify element exists and is visible
        const isVisible = await element.isVisible();
        if (isVisible) {
          // Calculate confidence based on locator priority and success rate
          const priorityScore = 1 - (locator.priority * 0.1); // Lower priority = higher score
          const successRateScore = locator.successRate || 0.5;
          const confidence = Math.min(priorityScore * 0.6 + successRateScore * 0.4, 0.99);

          return {
            strategy: 'FALLBACK',
            newLocator: locator.value,
            confidence: Math.max(confidence, 0.7), // Minimum 0.7 for fallback strategy
            metadata: {
              reason: `Found element using ${locator.type} locator`,
              alternativeLocators,
              locatorType: locator.type,
              locatorPriority: locator.priority,
            },
          };
        }
      } catch (error) {
        // Locator didn't work, try next one
        continue;
      }
    }

    // No working locator found
    return null;
  }

  /**
   * Update object repository with new locators
   * This would typically be called from a service that manages objects
   */
  updateObjectRepository(objectId: number, locators: LocatorOption[]): void {
    this.objectRepository.set(objectId, { locators });
  }

  /**
   * Generate common fallback locators for a given failed locator
   * This is used when we don't have an object repository entry
   */
  async generateFallbackLocators(failedLocator: string, page: Page): Promise<HealingResult | null> {
    const fallbacks = this.generateAlternativeLocators(failedLocator);

    for (const fallbackLocator of fallbacks) {
      try {
        const element = await page.locator(fallbackLocator).first();
        await element.waitFor({ state: 'visible', timeout: 2000 });

        const isVisible = await element.isVisible();
        if (isVisible) {
          return {
            strategy: 'FALLBACK',
            newLocator: fallbackLocator,
            confidence: 0.75, // Medium confidence for generated fallbacks
            metadata: {
              reason: 'Found element using generated fallback locator',
              originalLocator: failedLocator,
            },
          };
        }
      } catch {
        continue;
      }
    }

    return null;
  }

  /**
   * Generate alternative locators based on the failed locator
   */
  private generateAlternativeLocators(locator: string): string[] {
    const alternatives: string[] = [];

    // If it's an ID selector, try as name, class, and data-testid
    if (locator.startsWith('#')) {
      const id = locator.substring(1);
      alternatives.push(`[name="${id}"]`);
      alternatives.push(`.${id}`);
      alternatives.push(`[data-testid="${id}"]`);
      alternatives.push(`[data-test="${id}"]`);
      alternatives.push(`[id*="${id}"]`); // Partial match
    }

    // If it's a class selector, try as ID and data attributes
    if (locator.startsWith('.')) {
      const className = locator.substring(1);
      alternatives.push(`#${className}`);
      alternatives.push(`[data-testid="${className}"]`);
      alternatives.push(`[class*="${className}"]`); // Partial match
    }

    // If it's a data-testid, try other data attributes and ID
    if (locator.includes('data-testid')) {
      const match = locator.match(/data-testid="([^"]+)"/);
      if (match) {
        const testId = match[1];
        alternatives.push(`[data-test="${testId}"]`);
        alternatives.push(`[data-test-id="${testId}"]`);
        alternatives.push(`#${testId}`);
        alternatives.push(`[id*="${testId}"]`);
      }
    }

    // If it's an XPath, try converting to CSS (basic cases)
    if (locator.startsWith('/') || locator.startsWith('(')) {
      // Extract ID from XPath like //*[@id="foo"]
      const idMatch = locator.match(/@id=["']([^"']+)["']/);
      if (idMatch) {
        alternatives.push(`#${idMatch[1]}`);
      }

      // Extract class from XPath
      const classMatch = locator.match(/@class=["']([^"']+)["']/);
      if (classMatch) {
        alternatives.push(`.${classMatch[1]}`);
      }
    }

    // If it's a text locator, try with different whitespace
    if (locator.includes('text=')) {
      const textMatch = locator.match(/text=["']?([^"']+)["']?/);
      if (textMatch) {
        const text = textMatch[1].trim();
        alternatives.push(`text=${text}`); // Exact match
        alternatives.push(`text=${text.toLowerCase()}`); // Lowercase
        alternatives.push(`text=/${text}/i`); // Case-insensitive regex
        alternatives.push(`text=/${text.split(' ').join('\\s+')}/i`); // Flexible whitespace
      }
    }

    return alternatives;
  }
}
