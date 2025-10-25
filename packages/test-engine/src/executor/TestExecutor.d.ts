import { Browser } from 'playwright';
import { GeneratedTest, ExecutionResults } from '../autonomous/AutonomousTestingOrchestrator';
/**
 * Test Executor
 *
 * Executes generated tests with:
 * - Parallel execution (multiple browsers)
 * - Self-healing for broken locators
 * - Screenshot & video capture
 * - Real-time progress updates
 */
export declare class TestExecutor {
    private browser;
    private onProgress?;
    private contexts;
    private results;
    constructor(browser: Browser, onProgress?: (progress: ExecutionProgress) => void);
    /**
     * Execute all tests
     */
    executeTests(tests: GeneratedTest[], config: ExecutionConfig): Promise<ExecutionResults>;
    /**
     * Create test batches for parallel execution
     */
    private createBatches;
    /**
     * Execute a batch of tests
     */
    private executeBatch;
    /**
     * Execute single test
     */
    private executeTest;
    /**
     * Execute single test step
     */
    private executeStep;
    /**
     * Click with self-healing
     */
    private clickWithHealing;
    /**
     * Fill with self-healing
     */
    private fillWithHealing;
    /**
     * Try to heal broken locator (simple fallback strategy)
     */
    private tryHeal;
    /**
     * Generate alternative locators
     */
    private generateAlternatives;
    /**
     * Execute assertion
     */
    private executeAssertion;
    /**
     * Execute API request
     */
    private executeAPIRequest;
    /**
     * Notify progress callback
     */
    private notifyProgress;
    /**
     * Cleanup
     */
    cleanup(): Promise<void>;
}
export interface ExecutionConfig {
    parallelWorkers: number;
    enableHealing: boolean;
    captureVideo: boolean;
    captureScreenshots: boolean;
}
export interface ExecutionProgress {
    progress: number;
    message: string;
    total: number;
    completed: number;
    passed: number;
    failed: number;
    healed: number;
    currentTest?: string;
}
//# sourceMappingURL=TestExecutor.d.ts.map