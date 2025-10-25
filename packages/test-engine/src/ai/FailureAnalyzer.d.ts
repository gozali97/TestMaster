import { TestResult, AnalysisResult } from '../autonomous/AutonomousTestingOrchestrator';
/**
 * Failure Analyzer
 *
 * Uses GPT-4 to analyze test failures and provide:
 * - Classification (APP_BUG, TEST_ISSUE, ENVIRONMENT, FLAKY)
 * - Root cause analysis
 * - Suggested fixes for developers and QA
 * - Similarity to past issues
 */
export declare class FailureAnalyzer {
    private onProgress?;
    private llmClient;
    constructor(onProgress?: (progress: AnalysisProgress) => void);
    /**
     * Analyze all failed tests
     */
    analyzeFailures(failures: TestResult[], config: any): Promise<AnalysisResult[]>;
    /**
     * Analyze single failure with GPT-4
     */
    private analyzeFailure;
    /**
     * Build prompt for GPT-4 analysis
     */
    private buildAnalysisPrompt;
    /**
     * Parse GPT-4 response
     */
    private parseGPTResponse;
    /**
     * Fallback analysis without AI
     */
    private fallbackAnalysis;
    /**
     * Create Jira ticket for bug
     */
    private createJiraTicket;
    /**
     * Notify progress callback
     */
    private notifyProgress;
}
export interface AnalysisProgress {
    progress: number;
    message: string;
}
//# sourceMappingURL=FailureAnalyzer.d.ts.map