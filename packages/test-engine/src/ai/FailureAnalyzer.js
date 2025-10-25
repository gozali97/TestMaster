"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FailureAnalyzer = void 0;
const LLMClient_1 = __importDefault(require("../../../api/src/services/ai/LLMClient"));
/**
 * Failure Analyzer
 *
 * Uses GPT-4 to analyze test failures and provide:
 * - Classification (APP_BUG, TEST_ISSUE, ENVIRONMENT, FLAKY)
 * - Root cause analysis
 * - Suggested fixes for developers and QA
 * - Similarity to past issues
 */
class FailureAnalyzer {
    onProgress;
    llmClient;
    constructor(onProgress) {
        this.onProgress = onProgress;
        this.llmClient = LLMClient_1.default;
    }
    /**
     * Analyze all failed tests
     */
    async analyzeFailures(failures, config) {
        console.log(`🧠 Analyzing ${failures.length} failures...`);
        const analyses = [];
        for (const [index, failure] of failures.entries()) {
            this.notifyProgress({
                progress: ((index + 1) / failures.length) * 100,
                message: `Analyzing failure ${index + 1}/${failures.length}`,
            });
            try {
                const analysis = await this.analyzeFailure(failure, config);
                analyses.push(analysis);
            }
            catch (error) {
                console.error(`Error analyzing failure:`, error);
                // Fallback analysis
                analyses.push({
                    testId: failure.testId,
                    category: 'TEST_ISSUE',
                    rootCause: failure.error || 'Unknown error',
                    suggestedFix: {
                        forDeveloper: 'Review test logs and error message',
                        forQA: 'Check test steps and locators',
                    },
                    confidence: 0.5,
                });
            }
        }
        return analyses;
    }
    /**
     * Analyze single failure with GPT-4
     */
    async analyzeFailure(failure, config) {
        // Check if LLM is enabled
        if (!this.llmClient.isEnabled()) {
            return this.fallbackAnalysis(failure);
        }
        // Build context for GPT-4
        const prompt = this.buildAnalysisPrompt(failure);
        try {
            // Call GPT-4
            const response = await this.llmClient.complete(prompt, {
                temperature: 0.2,
                maxTokens: 1500,
            });
            // Parse GPT-4 response
            const analysis = this.parseGPTResponse(response, failure.testId);
            // Create Jira ticket if requested
            if (config.createJiraTickets && analysis.category === 'APP_BUG' && analysis.confidence > 0.7) {
                analysis.jiraTicket = await this.createJiraTicket(analysis, failure);
            }
            return analysis;
        }
        catch (error) {
            console.error('GPT-4 analysis failed:', error);
            return this.fallbackAnalysis(failure);
        }
    }
    /**
     * Build prompt for GPT-4 analysis
     */
    buildAnalysisPrompt(failure) {
        return `Analyze this test failure and provide insights:

Error: ${failure.error}
Duration: ${failure.duration}ms
Has Screenshots: ${failure.screenshots ? 'Yes' : 'No'}
Has Video: ${failure.video ? 'Yes' : 'No'}

Classify this failure into ONE of these categories:
1. APP_BUG - Actual bug in the application
2. TEST_ISSUE - Problem with the test script itself
3. ENVIRONMENT - Infrastructure/network/timeout issues
4. FLAKY - Intermittent issue, unstable test

Provide:
1. Category (one of the above)
2. Root Cause (concise explanation)
3. Suggested Fix for Developer (if APP_BUG)
4. Suggested Fix for QA (if TEST_ISSUE)
5. Confidence (0.0 to 1.0)

Respond ONLY with valid JSON:
{
  "category": "APP_BUG | TEST_ISSUE | ENVIRONMENT | FLAKY",
  "rootCause": "explanation...",
  "suggestedFixDev": "fix for developer...",
  "suggestedFixQA": "fix for QA...",
  "confidence": 0.85
}`;
    }
    /**
     * Parse GPT-4 response
     */
    parseGPTResponse(response, testId) {
        try {
            // Try to extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                testId,
                category: parsed.category || 'TEST_ISSUE',
                rootCause: parsed.rootCause || 'Unknown cause',
                suggestedFix: {
                    forDeveloper: parsed.suggestedFixDev || 'Review the error message and fix the issue',
                    forQA: parsed.suggestedFixQA || 'Update test script to handle new behavior',
                },
                confidence: parseFloat(parsed.confidence) || 0.7,
            };
        }
        catch (error) {
            console.error('Failed to parse GPT response:', error);
            throw error;
        }
    }
    /**
     * Fallback analysis without AI
     */
    fallbackAnalysis(failure) {
        const error = failure.error || '';
        let category = 'TEST_ISSUE';
        let rootCause = error;
        // Simple pattern matching
        if (error.includes('timeout') || error.includes('network')) {
            category = 'ENVIRONMENT';
            rootCause = 'Network timeout or connectivity issue';
        }
        else if (error.includes('element not found') || error.includes('locator')) {
            category = 'TEST_ISSUE';
            rootCause = 'Element locator is outdated or incorrect';
        }
        else if (error.includes('assertion failed') || error.includes('expected')) {
            category = 'APP_BUG';
            rootCause = 'Application behavior does not match expectations';
        }
        return {
            testId: failure.testId,
            category,
            rootCause,
            suggestedFix: {
                forDeveloper: category === 'APP_BUG'
                    ? 'Review the failed assertion and fix the application logic'
                    : 'No action needed',
                forQA: category === 'TEST_ISSUE'
                    ? 'Update test locators or assertions'
                    : 'Re-run the test',
            },
            confidence: 0.6,
        };
    }
    /**
     * Create Jira ticket for bug
     */
    async createJiraTicket(analysis, failure) {
        // Placeholder - implement actual Jira integration
        console.log(`📋 Creating Jira ticket for bug: ${analysis.rootCause}`);
        // Would call Jira API here
        // const ticket = await jiraClient.createIssue({...});
        return `JIRA-${Math.floor(Math.random() * 1000)}`;
    }
    /**
     * Notify progress callback
     */
    notifyProgress(progress) {
        if (this.onProgress) {
            this.onProgress(progress);
        }
    }
}
exports.FailureAnalyzer = FailureAnalyzer;
//# sourceMappingURL=FailureAnalyzer.js.map