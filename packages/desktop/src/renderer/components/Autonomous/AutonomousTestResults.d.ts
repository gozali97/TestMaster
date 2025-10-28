import React from 'react';
interface TestResult {
    testId: string;
    testName: string;
    status: 'passed' | 'failed' | 'healed';
    duration: number;
    error?: string;
    screenshots?: string[];
    video?: string;
}
interface AnalysisResult {
    testId: string;
    category: 'APP_BUG' | 'TEST_ISSUE' | 'ENVIRONMENT' | 'FLAKY';
    rootCause: string;
    suggestedFix: {
        forDeveloper: string;
        forQA: string;
    };
    confidence: number;
}
interface AutonomousTestResultsProps {
    results: {
        passed: TestResult[];
        failed: TestResult[];
        healed: TestResult[];
        totalDuration: number;
    };
    analyses?: AnalysisResult[];
    generatedTests?: any[];
}
export declare const AutonomousTestResults: React.FC<AutonomousTestResultsProps>;
export {};
//# sourceMappingURL=AutonomousTestResults.d.ts.map