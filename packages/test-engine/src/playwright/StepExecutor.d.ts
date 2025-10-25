import { Page } from 'playwright';
import { TestStep, ExecutionLog } from '../types';
import { SelfHealingEngine } from '../healing';
import { HealingEventData } from '@testmaster/shared/types/healing';
export declare class StepExecutor {
    private page;
    private logger;
    private selfHealingEngine?;
    private currentTestCaseId?;
    private currentStepIndex;
    private onHealingEvent?;
    constructor(page: Page, logger: (level: ExecutionLog['level'], message: string) => void, options?: {
        enableSelfHealing?: boolean;
        onHealingEvent?: (event: HealingEventData) => Promise<void>;
    });
    /**
     * Set current test case ID for healing context
     */
    setTestCaseId(testCaseId: number): void;
    executeStep(step: TestStep, stepIndex?: number): Promise<void>;
    /**
     * Execute an action with self-healing support
     */
    private executeWithHealing;
    private navigate;
    private clickWithHealing;
    private click;
    private typeWithHealing;
    private type;
    private selectWithHealing;
    private select;
    private checkWithHealing;
    private check;
    private uncheckWithHealing;
    private uncheck;
    private wait;
    private waitForElementWithHealing;
    private waitForElement;
    /**
     * Get the self-healing engine instance
     */
    getSelfHealingEngine(): SelfHealingEngine | undefined;
    private assert;
    private assertTextEquals;
    private assertTextContains;
    private assertElementVisible;
    private assertElementPresent;
    private assertUrlEquals;
    private assertTitleContains;
    private executeJs;
}
//# sourceMappingURL=StepExecutor.d.ts.map