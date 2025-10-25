"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepExecutor = void 0;
const healing_1 = require("../healing");
class StepExecutor {
    page;
    logger;
    selfHealingEngine;
    currentTestCaseId;
    currentStepIndex = 0;
    onHealingEvent;
    constructor(page, logger, options) {
        this.page = page;
        this.logger = logger;
        if (options?.enableSelfHealing !== false) {
            this.selfHealingEngine = new healing_1.SelfHealingEngine(page, {}, options?.onHealingEvent);
            this.onHealingEvent = options?.onHealingEvent;
            this.logger('INFO', '🔧 Self-healing enabled for this test execution');
        }
    }
    /**
     * Set current test case ID for healing context
     */
    setTestCaseId(testCaseId) {
        this.currentTestCaseId = testCaseId;
    }
    async executeStep(step, stepIndex) {
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
        }
        catch (error) {
            // If self-healing is not enabled or already attempted, rethrow
            throw error;
        }
    }
    /**
     * Execute an action with self-healing support
     */
    async executeWithHealing(locator, action, actionName, step) {
        try {
            // Try original locator
            return await action(locator);
        }
        catch (error) {
            // If self-healing is not enabled, rethrow immediately
            if (!this.selfHealingEngine) {
                throw error;
            }
            this.logger('WARN', `❌ Locator failed: ${locator}`);
            this.logger('INFO', `🔧 Attempting self-healing for ${actionName}...`);
            // Attempt self-healing
            const healingContext = {
                failedLocator: locator,
                objectId: step.objectId, // If available
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
                }
                else if (decision === 'suggest') {
                    this.logger('WARN', `⚠️  Self-healing found suggestion (confidence: ${(healingResult.confidence * 100).toFixed(1)}%)`);
                    this.logger('WARN', `   Suggested locator: ${healingResult.newLocator}`);
                    this.logger('WARN', `   Manual review required. Test will fail for now.`);
                }
            }
            else {
                this.logger('ERROR', `❌ Self-healing failed - no working locator found`);
            }
            // Rethrow original error if healing didn't work or confidence too low
            throw error;
        }
    }
    async navigate(url) {
        this.logger('INFO', `Navigating to ${url}`);
        await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    }
    async clickWithHealing(locator, step) {
        this.logger('INFO', `Clicking element: ${locator}`);
        await this.executeWithHealing(locator, async (loc) => await this.page.click(loc), 'click', step);
    }
    async click(locator) {
        this.logger('INFO', `Clicking element: ${locator}`);
        await this.page.click(locator);
    }
    async typeWithHealing(locator, text, step) {
        this.logger('INFO', `Typing "${text}" into ${locator}`);
        await this.executeWithHealing(locator, async (loc) => await this.page.fill(loc, text), 'type', step);
    }
    async type(locator, text) {
        this.logger('INFO', `Typing "${text}" into ${locator}`);
        await this.page.fill(locator, text);
    }
    async selectWithHealing(locator, value, step) {
        this.logger('INFO', `Selecting "${value}" in ${locator}`);
        await this.executeWithHealing(locator, async (loc) => await this.page.selectOption(loc, value), 'select', step);
    }
    async select(locator, value) {
        this.logger('INFO', `Selecting "${value}" in ${locator}`);
        await this.page.selectOption(locator, value);
    }
    async checkWithHealing(locator, step) {
        this.logger('INFO', `Checking checkbox: ${locator}`);
        await this.executeWithHealing(locator, async (loc) => await this.page.check(loc), 'check', step);
    }
    async check(locator) {
        this.logger('INFO', `Checking checkbox: ${locator}`);
        await this.page.check(locator);
    }
    async uncheckWithHealing(locator, step) {
        this.logger('INFO', `Unchecking checkbox: ${locator}`);
        await this.executeWithHealing(locator, async (loc) => await this.page.uncheck(loc), 'uncheck', step);
    }
    async uncheck(locator) {
        this.logger('INFO', `Unchecking checkbox: ${locator}`);
        await this.page.uncheck(locator);
    }
    async wait(duration) {
        this.logger('INFO', `Waiting for ${duration}ms`);
        await this.page.waitForTimeout(duration);
    }
    async waitForElementWithHealing(locator, step) {
        this.logger('INFO', `Waiting for element: ${locator}`);
        await this.executeWithHealing(locator, async (loc) => await this.page.waitForSelector(loc, { state: 'visible' }), 'waitForElement', step);
    }
    async waitForElement(locator) {
        this.logger('INFO', `Waiting for element: ${locator}`);
        await this.page.waitForSelector(locator, { state: 'visible' });
    }
    /**
     * Get the self-healing engine instance
     */
    getSelfHealingEngine() {
        return this.selfHealingEngine;
    }
    async assert(parameters) {
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
    async assertTextEquals(locator, expected) {
        this.logger('INFO', `Asserting text equals "${expected}" for ${locator}`);
        const actual = await this.page.textContent(locator);
        if (actual?.trim() !== expected.trim()) {
            throw new Error(`Text assertion failed. Expected: "${expected}", Actual: "${actual}"`);
        }
    }
    async assertTextContains(locator, expected) {
        this.logger('INFO', `Asserting text contains "${expected}" for ${locator}`);
        const actual = await this.page.textContent(locator);
        if (!actual?.includes(expected)) {
            throw new Error(`Text assertion failed. Expected to contain: "${expected}", Actual: "${actual}"`);
        }
    }
    async assertElementVisible(locator) {
        this.logger('INFO', `Asserting element is visible: ${locator}`);
        const isVisible = await this.page.isVisible(locator);
        if (!isVisible) {
            throw new Error(`Element is not visible: ${locator}`);
        }
    }
    async assertElementPresent(locator) {
        this.logger('INFO', `Asserting element is present: ${locator}`);
        const count = await this.page.locator(locator).count();
        if (count === 0) {
            throw new Error(`Element is not present: ${locator}`);
        }
    }
    async assertUrlEquals(expected) {
        this.logger('INFO', `Asserting URL equals: ${expected}`);
        const actual = this.page.url();
        if (actual !== expected) {
            throw new Error(`URL assertion failed. Expected: "${expected}", Actual: "${actual}"`);
        }
    }
    async assertTitleContains(expected) {
        this.logger('INFO', `Asserting title contains: ${expected}`);
        const actual = await this.page.title();
        if (!actual.includes(expected)) {
            throw new Error(`Title assertion failed. Expected to contain: "${expected}", Actual: "${actual}"`);
        }
    }
    async executeJs(script) {
        this.logger('INFO', `Executing JavaScript: ${script.substring(0, 50)}...`);
        await this.page.evaluate(script);
    }
}
exports.StepExecutor = StepExecutor;
//# sourceMappingURL=StepExecutor.js.map