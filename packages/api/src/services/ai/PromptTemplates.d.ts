/**
 * Prompt templates for AI-powered features
 */
export declare class PromptTemplates {
    /**
     * Failure Analysis Prompt
     */
    static failureAnalysis(context: {
        testName: string;
        errorMessage: string;
        stackTrace?: string;
        logs?: string[];
        testCode?: string;
        previousFailures?: string;
    }): string;
    /**
     * Test Generation from Specification
     */
    static testGeneration(context: {
        feature: string;
        userStory?: string;
        acceptanceCriteria?: string[];
        existingObjects?: any[];
    }): string;
    /**
     * Code Analysis for Test Impact
     */
    static testImpactAnalysis(context: {
        changedFiles: string[];
        changedFunctions: string[];
        testName: string;
        testCode: string;
    }): string;
    /**
     * Locator Healing Suggestion
     */
    static locatorHealing(context: {
        failedLocator: string;
        pageSnapshot: string;
        elementContext?: string;
    }): string;
    /**
     * Test Flakiness Analysis
     */
    static flakinessAnalysis(context: {
        testName: string;
        failureHistory: Array<{
            date: string;
            error: string;
            duration: number;
        }>;
    }): string;
    /**
     * Bug Report Generation
     */
    static bugReportGeneration(context: {
        testName: string;
        errorMessage: string;
        stackTrace?: string;
        screenshots?: string[];
        logs?: string[];
        environment: string;
    }): string;
}
export default PromptTemplates;
//# sourceMappingURL=PromptTemplates.d.ts.map