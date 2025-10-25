import { ApplicationMap, GeneratedTest } from '../autonomous/AutonomousTestingOrchestrator';
/**
 * Test Generator
 *
 * Automatically generates test cases from application map:
 * - Critical user flows (login, checkout, CRUD)
 * - Form validations
 * - Navigation tests
 * - API tests
 * - Edge cases (AI-powered)
 */
export declare class TestGenerator {
    private onProgress?;
    private llmClient;
    private generatedTests;
    constructor(onProgress?: (progress: GenerationProgress) => void);
    /**
     * Generate all tests from application map
     */
    generateTests(appMap: ApplicationMap, config: any): Promise<GeneratedTest[]>;
    /**
     * Generate website tests
     */
    private generateWebsiteTests;
    /**
     * Generate API tests
     */
    private generateAPITests;
    /**
     * Generate E2E flow tests
     */
    private generateE2ETests;
    /**
     * Generate user flow test using AI
     */
    private generateUserFlowTest;
    /**
     * Generate navigation test
     */
    private generateNavigationTest;
    /**
     * Generate form validation tests
     */
    private generateFormTests;
    /**
     * Generate interaction tests
     */
    private generateInteractionTests;
    /**
     * Generate API endpoint test
     */
    private generateAPIEndpointTest;
    /**
     * Generate valid test data for input
     */
    private generateValidValue;
    /**
     * Generate test data for API request
     */
    private generateTestData;
    /**
     * Expected HTTP status for method
     */
    private expectedStatus;
    /**
     * Notify progress callback
     */
    private notifyProgress;
}
export interface GenerationProgress {
    progress: number;
    message: string;
    testsGenerated?: number;
}
//# sourceMappingURL=TestGenerator.d.ts.map