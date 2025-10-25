import { Page } from 'playwright';
import { TestStep, ExecutionLog } from '../types';
import { SelfHealingEngine } from '../healing';
import { HealingContext, HealingEventData } from '@testmaster/shared';

export class StepExecutor {
  private selfHealingEngine?: SelfHealingEngine;
  private currentTestCaseId?: number;
  private currentStepIndex: number = 0;
  private onHealingEvent?: (event: HealingEventData) => Promise<void>;

  constructor(
    private page: Page,
    private logger: (level: ExecutionLog['level'], message: string) => void,
    options?: {
      enableSelfHealing?: boolean;
      onHealingEvent?: (event: HealingEventData) => Promise<void>;
    }
  ) {
    if (options?.enableSelfHealing !== false) {
      try {
        // Only use FALLBACK strategy to avoid missing implementation errors
        this.selfHealingEngine = new SelfHealingEngine(
          page,
          {
            enabled: true,
            enabledStrategies: ['FALLBACK'], // Only FALLBACK is implemented
            maxRetries: 2,
            timeout: 5000,
          },
          options?.onHealingEvent
        );
        this.onHealingEvent = options?.onHealingEvent;
        this.logger('INFO', '🔧 Self-healing enabled (FALLBACK strategy only)');
      } catch (error: any) {
        this.logger('WARN', `Failed to initialize self-healing: ${error.message}`);
        this.selfHealingEngine = undefined;
      }
    }
  }

  /**
   * Set current test case ID for healing context
   */
  setTestCaseId(testCaseId: number): void {
    this.currentTestCaseId = testCaseId;
  }

  async executeStep(step: TestStep, stepIndex?: number): Promise<void> {
    if (stepIndex !== undefined) {
      this.currentStepIndex = stepIndex;
    }

    const { actionType, parameters } = step;

    try {
      switch (actionType) {
        case 'navigate':
          await this.navigate(parameters.url);
          break;
        case 'click':
          await this.clickWithHealing(parameters.locator, step);
          break;
        case 'type':
          await this.typeWithHealing(parameters.locator, parameters.text, step);
          break;
        case 'select':
          await this.selectWithHealing(parameters.locator, parameters.value, step);
          break;
        case 'check':
          await this.checkWithHealing(parameters.locator, step);
          break;
        case 'uncheck':
          await this.uncheckWithHealing(parameters.locator, step);
          break;
        case 'wait':
          await this.wait(parameters.duration);
          break;
        case 'waitForElement':
          await this.waitForElementWithHealing(parameters.locator, step);
          break;
        case 'assert':
          await this.assert(parameters);
          break;
        case 'executeJs':
          await this.executeJs(parameters.script);
          break;
        default:
          throw new Error(`Unknown action type: ${actionType}`);
      }
    } catch (error) {
      // If self-healing is not enabled or already attempted, rethrow
      throw error;
    }
  }

  /**
   * Execute an action with self-healing support
   */
  private async executeWithHealing<T>(
    locator: string,
    action: (loc: string) => Promise<T>,
    actionName: string,
    step: TestStep
  ): Promise<T> {
    try {
      // Try original locator
      return await action(locator);
    } catch (error: any) {
      // If self-healing is not enabled, rethrow immediately
      if (!this.selfHealingEngine) {
        throw error;
      }

      this.logger('WARN', `❌ Locator failed: ${locator}`);
      this.logger('INFO', `🔧 Attempting self-healing for ${actionName}...`);

      // Attempt self-healing
      const healingContext: HealingContext = {
        failedLocator: locator,
        objectId: (step as any).objectId, // If available
        stepIndex: this.currentStepIndex,
        testCaseId: this.currentTestCaseId || 0,
        errorMessage: error.message,
      };

      const healingResult = await this.selfHealingEngine.heal(healingContext);

      if (healingResult) {
        const decision = this.selfHealingEngine.getHealingDecision(healingResult.confidence);
        
        if (decision === 'auto') {
          this.logger('INFO', `✅ Self-healing succeeded! Auto-applying new locator.`);
          this.logger('INFO', `   Strategy: ${healingResult.strategy}`);
          this.logger('INFO', `   New locator: ${healingResult.newLocator}`);
          this.logger('INFO', `   Confidence: ${(healingResult.confidence * 100).toFixed(1)}%`);

          // Retry with healed locator
          return await action(healingResult.newLocator);
        } else if (decision === 'suggest') {
          this.logger('WARN', `⚠️  Self-healing found suggestion (confidence: ${(healingResult.confidence * 100).toFixed(1)}%)`);
          this.logger('WARN', `   Suggested locator: ${healingResult.newLocator}`);
          this.logger('WARN', `   Manual review required. Test will fail for now.`);
        }
      } else {
        this.logger('ERROR', `❌ Self-healing failed - no working locator found`);
      }

      // Rethrow original error if healing didn't work or confidence too low
      throw error;
    }
  }

  private async navigate(url: string): Promise<void> {
    this.logger('INFO', `Navigating to ${url}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  private async clickWithHealing(locator: string, step: TestStep): Promise<void> {
    this.logger('INFO', `Clicking element: ${locator}`);
    await this.executeWithHealing(
      locator,
      async (loc) => await this.page.click(loc),
      'click',
      step
    );
  }

  private async click(locator: string): Promise<void> {
    this.logger('INFO', `Clicking element: ${locator}`);
    await this.page.click(locator);
  }

  private async typeWithHealing(locator: string, text: string, step: TestStep): Promise<void> {
    this.logger('INFO', `Typing "${text}" into ${locator}`);
    await this.executeWithHealing(
      locator,
      async (loc) => await this.page.fill(loc, text),
      'type',
      step
    );
  }

  private async type(locator: string, text: string): Promise<void> {
    this.logger('INFO', `Typing "${text}" into ${locator}`);
    await this.page.fill(locator, text);
  }

  private async selectWithHealing(locator: string, value: string, step: TestStep): Promise<void> {
    this.logger('INFO', `Selecting "${value}" in ${locator}`);
    await this.executeWithHealing(
      locator,
      async (loc) => await this.page.selectOption(loc, value),
      'select',
      step
    );
  }

  private async select(locator: string, value: string): Promise<void> {
    this.logger('INFO', `Selecting "${value}" in ${locator}`);
    await this.page.selectOption(locator, value);
  }

  private async checkWithHealing(locator: string, step: TestStep): Promise<void> {
    this.logger('INFO', `Checking checkbox: ${locator}`);
    await this.executeWithHealing(
      locator,
      async (loc) => await this.page.check(loc),
      'check',
      step
    );
  }

  private async check(locator: string): Promise<void> {
    this.logger('INFO', `Checking checkbox: ${locator}`);
    await this.page.check(locator);
  }

  private async uncheckWithHealing(locator: string, step: TestStep): Promise<void> {
    this.logger('INFO', `Unchecking checkbox: ${locator}`);
    await this.executeWithHealing(
      locator,
      async (loc) => await this.page.uncheck(loc),
      'uncheck',
      step
    );
  }

  private async uncheck(locator: string): Promise<void> {
    this.logger('INFO', `Unchecking checkbox: ${locator}`);
    await this.page.uncheck(locator);
  }

  private async wait(duration: number): Promise<void> {
    this.logger('INFO', `Waiting for ${duration}ms`);
    await this.page.waitForTimeout(duration);
  }

  private async waitForElementWithHealing(locator: string, step: TestStep): Promise<void> {
    this.logger('INFO', `Waiting for element: ${locator}`);
    await this.executeWithHealing(
      locator,
      async (loc) => await this.page.waitForSelector(loc, { state: 'visible' }),
      'waitForElement',
      step
    );
  }

  private async waitForElement(locator: string): Promise<void> {
    this.logger('INFO', `Waiting for element: ${locator}`);
    await this.page.waitForSelector(locator, { state: 'visible' });
  }

  /**
   * Get the self-healing engine instance
   */
  getSelfHealingEngine(): SelfHealingEngine | undefined {
    return this.selfHealingEngine;
  }

  private async assert(parameters: Record<string, any>): Promise<void> {
    const { type, locator, expected } = parameters;

    switch (type) {
      case 'textEquals':
        await this.assertTextEquals(locator, expected);
        break;
      case 'textContains':
        await this.assertTextContains(locator, expected);
        break;
      case 'elementVisible':
        await this.assertElementVisible(locator);
        break;
      case 'elementPresent':
        await this.assertElementPresent(locator);
        break;
      case 'urlEquals':
        await this.assertUrlEquals(expected);
        break;
      case 'titleContains':
        await this.assertTitleContains(expected);
        break;
      default:
        throw new Error(`Unknown assertion type: ${type}`);
    }
  }

  private async assertTextEquals(locator: string, expected: string): Promise<void> {
    this.logger('INFO', `Asserting text equals "${expected}" for ${locator}`);
    const actual = await this.page.textContent(locator);
    if (actual?.trim() !== expected.trim()) {
      throw new Error(`Text assertion failed. Expected: "${expected}", Actual: "${actual}"`);
    }
  }

  private async assertTextContains(locator: string, expected: string): Promise<void> {
    this.logger('INFO', `Asserting text contains "${expected}" for ${locator}`);
    const actual = await this.page.textContent(locator);
    if (!actual?.includes(expected)) {
      throw new Error(`Text assertion failed. Expected to contain: "${expected}", Actual: "${actual}"`);
    }
  }

  private async assertElementVisible(locator: string): Promise<void> {
    this.logger('INFO', `Asserting element is visible: ${locator}`);
    const isVisible = await this.page.isVisible(locator);
    if (!isVisible) {
      throw new Error(`Element is not visible: ${locator}`);
    }
  }

  private async assertElementPresent(locator: string): Promise<void> {
    this.logger('INFO', `Asserting element is present: ${locator}`);
    const count = await this.page.locator(locator).count();
    if (count === 0) {
      throw new Error(`Element is not present: ${locator}`);
    }
  }

  private async assertUrlEquals(expected: string): Promise<void> {
    this.logger('INFO', `Asserting URL equals: ${expected}`);
    const actual = this.page.url();
    if (actual !== expected) {
      throw new Error(`URL assertion failed. Expected: "${expected}", Actual: "${actual}"`);
    }
  }

  private async assertTitleContains(expected: string): Promise<void> {
    this.logger('INFO', `Asserting title contains: ${expected}`);
    const actual = await this.page.title();
    if (!actual.includes(expected)) {
      throw new Error(`Title assertion failed. Expected to contain: "${expected}", Actual: "${actual}"`);
    }
  }

  private async executeJs(script: string): Promise<void> {
    this.logger('INFO', `Executing JavaScript: ${script.substring(0, 50)}...`);
    await this.page.evaluate(script);
  }
}
