import { Browser, Page, BrowserContext } from 'playwright';
import { GeneratedTest, ExecutionResults, TestResult } from '../autonomous/AutonomousTestingOrchestrator';

/**
 * Test Executor
 * 
 * Executes generated tests with:
 * - Parallel execution (multiple browsers)
 * - Self-healing for broken locators
 * - Screenshot & video capture
 * - Real-time progress updates
 */
export class TestExecutor {
  private contexts: BrowserContext[] = [];
  private results: ExecutionResults = {
    total: 0,
    passed: [],
    failed: [],
    healed: [],
    totalDuration: 0,
  };

  constructor(
    private browser: Browser,
    private onProgress?: (progress: ExecutionProgress) => void
  ) {}

  /**
   * Execute all tests
   */
  async executeTests(
    tests: GeneratedTest[],
    config: TestExecutorConfig
  ): Promise<ExecutionResults> {
    console.log(`▶️  Executing ${tests.length} tests...`);

    this.results.total = tests.length;
    const startTime = Date.now();

    // Split tests into batches for parallel execution
    const batches = this.createBatches(tests, config.parallelWorkers);

    // Execute batches in parallel
    await Promise.all(
      batches.map((batch, index) => this.executeBatch(batch, index, config))
    );

    this.results.totalDuration = Date.now() - startTime;

    this.notifyProgress({
      progress: 100,
      message: `Execution completed: ${this.results.passed.length}/${tests.length} passed`,
      total: this.results.total,
      completed: this.results.passed.length + this.results.failed.length,
      passed: this.results.passed.length,
      failed: this.results.failed.length,
      healed: this.results.healed.length,
    });

    return this.results;
  }

  /**
   * Create test batches for parallel execution
   */
  private createBatches(tests: GeneratedTest[], workers: number): GeneratedTest[][] {
    const batches: GeneratedTest[][] = [];
    const batchSize = Math.ceil(tests.length / workers);

    for (let i = 0; i < tests.length; i += batchSize) {
      batches.push(tests.slice(i, i + batchSize));
    }

    return batches;
  }

  /**
   * Execute a batch of tests
   */
  private async executeBatch(
    batch: GeneratedTest[],
    workerIndex: number,
    config: TestExecutorConfig
  ): Promise<void> {
    console.log(`\n👷 [Worker ${workerIndex}] Starting batch with ${batch.length} tests`);
    
    let context: BrowserContext | null = null;
    let page: Page | null = null;

    try {
      // Create isolated browser context
      console.log(`🌐 [Worker ${workerIndex}] Creating browser context...`);
      
      // Setup video recording to Downloads folder
      let recordVideoConfig = undefined;
      if (config.captureVideo) {
        const os = require('os');
        const path = require('path');
        const fs = require('fs');
        
        // Get Downloads folder path
        const downloadsPath = path.join(os.homedir(), 'Downloads', 'TestMaster-Videos');
        
        // Create folder if not exists
        if (!fs.existsSync(downloadsPath)) {
          fs.mkdirSync(downloadsPath, { recursive: true });
        }
        
        recordVideoConfig = {
          dir: downloadsPath,
          size: { width: 1920, height: 1080 }
        };
        
        console.log(`📹 [Worker ${workerIndex}] Video will be saved to: ${downloadsPath}`);
      }
      
      context = await this.browser.newContext({
        viewport: null,  // null = use full window size (maximized)
        recordVideo: recordVideoConfig,
      });
      
      console.log(`✅ [Worker ${workerIndex}] Context created`);
      this.contexts.push(context);

      console.log(`📄 [Worker ${workerIndex}] Creating new page...`);
      page = await context.newPage();
      console.log(`✅ [Worker ${workerIndex}] Page created`);

      for (const test of batch) {
        await this.executeTest(test, page, config, workerIndex);
      }
      
      console.log(`✅ [Worker ${workerIndex}] Batch completed successfully`);
      
    } catch (error: any) {
      console.error(`❌ [Worker ${workerIndex}] Batch execution error:`, error.message);
      throw error;
    } finally {
      // Close page first, then context
      console.log(`🧹 [Worker ${workerIndex}] Cleaning up...`);
      
      if (page) {
        try {
          await page.close();
          console.log(`✅ [Worker ${workerIndex}] Page closed`);
        } catch (error: any) {
          console.error(`❌ [Worker ${workerIndex}] Error closing page:`, error.message);
        }
      }
      
      if (context) {
        try {
          await context.close();
          console.log(`✅ [Worker ${workerIndex}] Context closed`);
        } catch (error: any) {
          console.error(`❌ [Worker ${workerIndex}] Error closing context:`, error.message);
        }
      }
    }
  }

  /**
   * Execute single test
   */
  private async executeTest(
    test: GeneratedTest,
    page: Page,
    config: TestExecutorConfig,
    workerIndex: number
  ): Promise<void> {
    console.log(`\n🧪 [Worker ${workerIndex}] ========== Starting Test: ${test.name} ==========`);

    const startTime = Date.now();
    const screenshots: string[] = [];
    let videoPath: string | undefined;
    let wasHealed = false;

    this.notifyProgress({
      progress: ((this.results.passed.length + this.results.failed.length) / this.results.total) * 100,
      message: `Running: ${test.name}`,
      total: this.results.total,
      completed: this.results.passed.length + this.results.failed.length,
      passed: this.results.passed.length,
      failed: this.results.failed.length,
      healed: this.results.healed.length,
      currentTest: test.name,
    });

    try {
      // Check if page is still open before starting
      if (page.isClosed()) {
        throw new Error('Page was closed before test execution');
      }
      
      console.log(`📝 [Worker ${workerIndex}] Executing ${test.steps.length} steps...`);
      
      // Execute test steps
      for (const [index, step] of test.steps.entries()) {
        console.log(`  📍 [Worker ${workerIndex}] Step ${index + 1}/${test.steps.length}: ${step.action}`);
        
        await this.executeStep(step, page, config);
        
        console.log(`  ✅ [Worker ${workerIndex}] Step ${index + 1} completed`);

        // Capture screenshot after each step if enabled
        if (config.captureScreenshots) {
          try {
            if (!page.isClosed()) {
              const screenshot = await page.screenshot({ fullPage: false });
              screenshots.push(screenshot.toString('base64'));
            }
          } catch (error: any) {
            console.warn(`  ⚠️  [Worker ${workerIndex}] Screenshot failed: ${error.message}`);
          }
        }
      }

      // Test passed - GET VIDEO PATH
      const duration = Date.now() - startTime;

      // Try to get video path for passed test
      try {
        if (!page.isClosed()) {
          const video = page.video();
          if (video) {
            // Note: We can't get the path yet as the video is still being recorded
            // We'll need to close the page/context first to finalize the video
            console.log(`  📹 [Worker ${workerIndex}] Video is being recorded for passed test`);
          }
        }
      } catch (videoError: any) {
        console.warn(`  ⚠️  [Worker ${workerIndex}] Could not check video: ${videoError.message}`);
      }

      const result: TestResult = {
        testId: test.id,
        status: wasHealed ? 'healed' : 'passed',
        duration,
        screenshots: config.captureScreenshots ? screenshots : undefined,
        video: videoPath, // Will be updated in cleanup
      };

      if (wasHealed) {
        this.results.healed.push(result);
      } else {
        this.results.passed.push(result);
      }

      console.log(`  ✅✅✅ [Worker ${workerIndex}] PASSED: ${test.name} (${duration}ms)`);

    } catch (error: any) {
      // Test failed
      console.error(`  ❌ [Worker ${workerIndex}] Test failed:`, error.message);
      console.error(`  ❌ [Worker ${workerIndex}] Error stack:`, error.stack);
      
      const duration = Date.now() - startTime;

      // Try to get video path if page is still open
      try {
        if (!page.isClosed()) {
          const video = page.video();
          if (video) {
            videoPath = await video.path();
            console.log(`  📹 [Worker ${workerIndex}] Video saved: ${videoPath}`);
          }
        }
      } catch (videoError: any) {
        console.warn(`  ⚠️  [Worker ${workerIndex}] Could not get video path: ${videoError.message}`);
      }

      const result: TestResult = {
        testId: test.id,
        status: 'failed',
        duration,
        error: error.message,
        screenshots: screenshots.length > 0 ? screenshots : undefined,
        video: videoPath,
      };

      this.results.failed.push(result);

      console.log(`  ❌❌❌ [Worker ${workerIndex}] FAILED: ${test.name} - ${error.message}`);
    } finally {
      console.log(`🏁 [Worker ${workerIndex}] ========== Test Finished: ${test.name} ==========\n`);
    }
  }

  /**
   * Execute single test step
   */
  private async executeStep(step: any, page: Page, config: TestExecutorConfig): Promise<void> {
    const { action } = step;

    switch (action) {
      case 'navigate':
        await page.goto(step.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        break;

      case 'click':
        await this.clickWithHealing(page, step.locator, config);
        break;

      case 'fill':
        await this.fillWithHealing(page, step.locator, step.value, config);
        break;

      case 'select':
        await page.selectOption(step.locator, step.value);
        break;

      case 'waitForNavigation':
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
        break;

      case 'waitForTimeout':
        await page.waitForTimeout(step.duration || 1000);
        break;

      case 'waitForLoadState':
        await page.waitForLoadState(step.state || 'networkidle');
        break;

      case 'assert':
        await this.executeAssertion(step, page);
        break;

      case 'apiRequest':
        await this.executeAPIRequest(step, page);
        break;

      case 'comment':
        // Just a comment, skip
        break;

      default:
        console.warn(`Unknown action: ${action}`);
    }
  }

  /**
   * Click with self-healing
   */
  private async clickWithHealing(page: Page, locator: string, config: TestExecutorConfig): Promise<void> {
    try {
      await page.click(locator, { timeout: 5000 });
    } catch (error) {
      if (config.enableHealing) {
        const healed = await this.tryHeal(page, locator);
        if (healed) {
          await page.click(healed);
          return;
        }
      }
      throw error;
    }
  }

  /**
   * Fill with self-healing
   */
  private async fillWithHealing(page: Page, locator: string, value: string, config: TestExecutorConfig): Promise<void> {
    try {
      await page.fill(locator, value, { timeout: 5000 });
    } catch (error) {
      if (config.enableHealing) {
        const healed = await this.tryHeal(page, locator);
        if (healed) {
          await page.fill(healed, value);
          return;
        }
      }
      throw error;
    }
  }

  /**
   * Try to heal broken locator (simple fallback strategy)
   */
  private async tryHeal(page: Page, failedLocator: string): Promise<string | null> {
    console.log(`    🔧 Attempting self-healing for: ${failedLocator}`);

    // Simple fallback strategies
    const alternatives = this.generateAlternatives(failedLocator);

    for (const alternative of alternatives) {
      try {
        const element = await page.locator(alternative).first();
        await element.waitFor({ state: 'visible', timeout: 2000 });
        
        const isVisible = await element.isVisible();
        if (isVisible) {
          console.log(`    ✅ Healed with: ${alternative}`);
          return alternative;
        }
      } catch {
        continue;
      }
    }

    console.log(`    ❌ Healing failed`);
    return null;
  }

  /**
   * Generate alternative locators
   */
  private generateAlternatives(locator: string): string[] {
    const alternatives: string[] = [];

    // If it's an ID selector
    if (locator.startsWith('#')) {
      const id = locator.substring(1);
      alternatives.push(`[name="${id}"]`);
      alternatives.push(`.${id}`);
      alternatives.push(`[data-testid="${id}"]`);
    }

    // If it's a class selector
    if (locator.startsWith('.')) {
      const className = locator.substring(1);
      alternatives.push(`#${className}`);
      alternatives.push(`[data-testid="${className}"]`);
    }

    // If it contains data-testid
    if (locator.includes('data-testid')) {
      const match = locator.match(/data-testid="([^"]+)"/);
      if (match) {
        const testId = match[1];
        alternatives.push(`#${testId}`);
        alternatives.push(`[name="${testId}"]`);
      }
    }

    // If it's text-based
    if (locator.includes(':has-text')) {
      const match = locator.match(/:has-text\("([^"]+)"\)/);
      if (match) {
        const text = match[1];
        alternatives.push(`text=${text}`);
        alternatives.push(`[aria-label="${text}"]`);
      }
    }

    return alternatives;
  }

  /**
   * Execute assertion
   */
  private async executeAssertion(step: any, page: Page): Promise<void> {
    const { type, expected } = step;

    switch (type) {
      case 'title':
        const title = await page.title();
        if (!title.includes(expected)) {
          throw new Error(`Title assertion failed: expected "${expected}", got "${title}"`);
        }
        break;

      case 'url':
        const url = page.url();
        if (!url.includes(expected)) {
          throw new Error(`URL assertion failed: expected "${expected}", got "${url}"`);
        }
        break;

      case 'errorMessage':
        const hasError = await page.locator('.error, .alert-danger, [role="alert"]').count() > 0;
        if (!hasError && expected.visible) {
          throw new Error('Error message not visible');
        }
        break;

      default:
        console.warn(`Unknown assertion type: ${type}`);
    }
  }

  /**
   * Execute API request
   */
  private async executeAPIRequest(step: any, page: Page): Promise<void> {
    const { method, url, data, expectedStatus } = step;

    const requestMethod = method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';
    const response = await page.request[requestMethod](url, {
      data,
    });

    if (response.status() !== expectedStatus) {
      throw new Error(
        `API request failed: expected status ${expectedStatus}, got ${response.status()}`
      );
    }
  }

  /**
   * Notify progress callback
   */
  private notifyProgress(progress: ExecutionProgress): void {
    if (this.onProgress) {
      this.onProgress(progress);
    }
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    for (const context of this.contexts) {
      try {
        await context.close();
      } catch (error) {
        console.error('Error closing context:', error);
      }
    }
  }
}

export interface TestExecutorConfig {
  parallelWorkers: number;
  enableHealing: boolean;
  captureVideo: boolean;
  captureScreenshots: boolean;
}

export interface ExecutionProgress {
  progress: number; // 0-100
  message: string;
  total: number;
  completed: number;
  passed: number;
  failed: number;
  healed: number;
  currentTest?: string;
}
