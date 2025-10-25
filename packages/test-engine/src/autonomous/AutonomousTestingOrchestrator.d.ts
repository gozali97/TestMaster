/**
 * Main orchestrator for Autonomous Testing
 *
 * This is the brain that coordinates all phases:
 * 1. Discovery - Crawl website & API
 * 2. Generation - Generate tests automatically
 * 3. Execution - Run tests with self-healing
 * 4. Analysis - AI analyzes failures
 * 5. Reporting - Generate comprehensive report
 */
export declare class AutonomousTestingOrchestrator {
    private browser?;
    private sessionId;
    private progressCallback?;
    constructor(sessionId: string, onProgress?: (progress: ProgressUpdate) => void);
    /**
     * Main entry point - run full autonomous testing
     */
    runAutonomousTesting(config: AutonomousTestingConfig): Promise<AutonomousTestingResult>;
    /**
     * Phase 1: Discover application structure
     */
    private discoverApplication;
    /**
     * Phase 2: Generate tests from application map
     */
    private generateTests;
    /**
     * Phase 3: Execute generated tests
     */
    private executeTests;
    /**
     * Phase 4: Analyze failures with AI
     */
    private analyzeFailures;
    /**
     * Phase 5: Generate comprehensive report
     */
    private generateReport;
    /**
     * Update progress and notify callback
     */
    private updateProgress;
    /**
     * Check if application has registration forms
     */
    private hasRegistrationForms;
    /**
     * Test registration flow with auto-generated data
     */
    private testRegistration;
    /**
     * Get current session ID
     */
    getSessionId(): string;
}
export interface AutonomousTestingConfig {
    websiteUrl?: string;
    apiUrl?: string;
    depth: 'shallow' | 'deep' | 'exhaustive';
    parallelWorkers?: number;
    enableHealing?: boolean;
    captureVideo?: boolean;
    captureScreenshots?: boolean;
    headless?: boolean;
    authentication?: {
        username: string;
        password: string;
    };
    createJiraTickets?: boolean;
    aiAnalysisEnabled?: boolean;
}
export interface ApplicationMap {
    website: WebsiteMap | null;
    api: APIMap | null;
}
export interface WebsiteMap {
    baseUrl: string;
    pages: PageInfo[];
    userFlows: UserFlow[];
    interactions: Interaction[];
}
export interface APIMap {
    baseUrl: string;
    endpoints: APIEndpoint[];
    authentication?: AuthType;
}
export interface PageInfo {
    url: string;
    title: string;
    elements: ElementInfo[];
    screenshot?: string;
}
export interface ElementInfo {
    type: 'button' | 'link' | 'form' | 'input' | 'select';
    locator: string;
    text?: string;
    visible: boolean;
    name?: string;
    id?: string;
    placeholder?: string;
}
export interface UserFlow {
    name: string;
    steps: string[];
    priority: 'critical' | 'high' | 'medium' | 'low';
}
export interface Interaction {
    element: ElementInfo;
    action: 'click' | 'fill' | 'select';
    page: string;
}
export interface APIEndpoint {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    parameters?: any;
    requestBody?: any;
    responseSchema?: any;
}
export type AuthType = 'none' | 'basic' | 'bearer' | 'oauth';
export interface GeneratedTest {
    id: string;
    name: string;
    description: string;
    type: 'web' | 'api' | 'e2e';
    priority: 'critical' | 'high' | 'medium' | 'low';
    steps: any[];
    estimatedDuration: number;
}
export interface ExecutionResults {
    total: number;
    passed: TestResult[];
    failed: TestResult[];
    healed: TestResult[];
    totalDuration: number;
}
export interface TestResult {
    testId: string;
    status: 'passed' | 'failed' | 'healed';
    duration: number;
    error?: string;
    screenshots?: string[];
    video?: string;
}
export interface AnalysisResult {
    testId: string;
    category: 'APP_BUG' | 'TEST_ISSUE' | 'ENVIRONMENT' | 'FLAKY';
    rootCause: string;
    suggestedFix: {
        forDeveloper: string;
        forQA: string;
    };
    confidence: number;
    jiraTicket?: string;
}
export interface Report {
    summary: {
        total: number;
        passed: number;
        failed: number;
        healed: number;
        duration: number;
        coverage: number;
    };
    details: {
        tests: TestResult[];
        failures: AnalysisResult[];
    };
    files: {
        html: string;
        json: string;
        pdf?: string;
    };
}
export interface ReportData {
    applicationMap: ApplicationMap;
    generatedTests: GeneratedTest[];
    executionResults: ExecutionResults;
    analysisResults: AnalysisResult[];
    config: AutonomousTestingConfig;
}
export interface AutonomousTestingResult {
    sessionId: string;
    success: boolean;
    applicationMap: ApplicationMap;
    testsGenerated: number;
    testsPassed: number;
    testsFailed: number;
    testsHealed: number;
    duration: number;
    report: Report;
}
export interface ProgressUpdate {
    phase: 'discovery' | 'registration' | 'generation' | 'execution' | 'analysis' | 'report' | 'completed' | 'error';
    progress: number;
    message: string;
    details?: any;
}
//# sourceMappingURL=AutonomousTestingOrchestrator.d.ts.map