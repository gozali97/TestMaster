import LLMClient from '../../../api/src/services/ai/LLMClient';
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
export class TestGenerator {
  private llmClient: typeof LLMClient;
  private generatedTests: GeneratedTest[] = [];

  constructor(
    private onProgress?: (progress: GenerationProgress) => void
  ) {
    this.llmClient = LLMClient;
  }

  /**
   * Generate all tests from application map
   */
  async generateTests(
    appMap: ApplicationMap,
    config: any
  ): Promise<GeneratedTest[]> {
    console.log('🧪 Generating test cases...');

    this.generatedTests = [];

    // 1. Generate website tests
    if (appMap.website) {
      await this.generateWebsiteTests(appMap.website);
    }

    // 2. Generate API tests
    if (appMap.api) {
      await this.generateAPITests(appMap.api);
    }

    // 3. Generate E2E flow tests
    if (appMap.website && appMap.api) {
      await this.generateE2ETests(appMap);
    }

    this.notifyProgress({
      progress: 100,
      message: `Generated ${this.generatedTests.length} test cases`,
      testsGenerated: this.generatedTests.length,
    });

    return this.generatedTests;
  }

  /**
   * Generate website tests
   */
  private async generateWebsiteTests(websiteMap: any): Promise<void> {
    // 1. Critical user flow tests
    for (const flow of websiteMap.userFlows || []) {
      this.generatedTests.push(await this.generateUserFlowTest(flow));
    }

    // 2. Navigation tests - verify all pages load
    for (const page of websiteMap.pages.slice(0, 20)) { // Limit to first 20 pages
      this.generatedTests.push(this.generateNavigationTest(page));
    }

    // 3. Form validation tests
    const formsPages = websiteMap.pages.filter((p: any) => 
      p.elements.some((e: any) => e.type === 'form')
    );

    for (const page of formsPages) {
      const formTests = await this.generateFormTests(page);
      this.generatedTests.push(...formTests);
    }

    // 4. Interactive element tests
    this.generatedTests.push(...this.generateInteractionTests(websiteMap));

    this.notifyProgress({
      progress: 40,
      message: 'Website tests generated',
      testsGenerated: this.generatedTests.length,
    });
  }

  /**
   * Generate API tests
   */
  private async generateAPITests(apiMap: any): Promise<void> {
    for (const endpoint of apiMap.endpoints) {
      // Generate test for each endpoint
      this.generatedTests.push(await this.generateAPIEndpointTest(endpoint, apiMap));
    }

    this.notifyProgress({
      progress: 70,
      message: 'API tests generated',
      testsGenerated: this.generatedTests.length,
    });
  }

  /**
   * Generate E2E flow tests
   */
  private async generateE2ETests(appMap: ApplicationMap): Promise<void> {
    // Generate combined web + API tests
    // Example: User registration on web triggers API call
    
    if (appMap.website?.userFlows) {
      const registerFlow = appMap.website.userFlows.find(f => 
        f.name.toLowerCase().includes('register')
      );

      if (registerFlow) {
        this.generatedTests.push({
          id: `e2e-registration-${Date.now()}`,
          name: 'E2E: User Registration Flow',
          description: 'Complete user registration including API verification',
          type: 'e2e',
          priority: 'critical',
          steps: [
            { action: 'navigate', url: '${baseUrl}/register' },
            { action: 'fill', locator: '[name="email"]', value: 'test@example.com' },
            { action: 'fill', locator: '[name="password"]', value: 'Test@123' },
            { action: 'click', locator: 'button:has-text("Register")' },
            { action: 'waitForNavigation' },
            { action: 'verifyAPI', endpoint: '/api/users', method: 'GET' },
          ],
          estimatedDuration: 10000,
        });
      }
    }

    this.notifyProgress({
      progress: 90,
      message: 'E2E tests generated',
      testsGenerated: this.generatedTests.length,
    });
  }

  /**
   * Generate user flow test using AI
   */
  private async generateUserFlowTest(flow: any): Promise<GeneratedTest> {
    // Use GPT-4 to generate intelligent test steps
    const prompt = `Generate test steps for this user flow:
    
    Flow: ${flow.name}
    Steps: ${flow.steps.join(', ')}
    
    Create detailed Playwright test steps with proper assertions.
    Return as JSON array of steps: [{action, locator?, value?, assertion?}]`;

    try {
      if (this.llmClient.isEnabled()) {
        const response = await this.llmClient.complete(prompt, {
          temperature: 0.3,
          maxTokens: 1000,
        });

        const aiSteps = JSON.parse(response);
        
        return {
          id: `flow-${flow.name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`,
          name: `User Flow: ${flow.name}`,
          description: `Test for ${flow.name} flow`,
          type: 'web',
          priority: flow.priority,
          steps: aiSteps,
          estimatedDuration: aiSteps.length * 2000,
        };
      }
    } catch (error) {
      console.error('AI generation failed, using template:', error);
    }

    // Fallback to template
    return {
      id: `flow-${flow.name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`,
      name: `User Flow: ${flow.name}`,
      description: `Test for ${flow.name} flow`,
      type: 'web',
      priority: flow.priority,
      steps: flow.steps.map((step: string) => ({
        action: 'comment',
        value: step,
      })),
      estimatedDuration: 5000,
    };
  }

  /**
   * Generate navigation test
   */
  private generateNavigationTest(page: any): GeneratedTest {
    return {
      id: `nav-${Buffer.from(page.url).toString('base64').substring(0, 10)}-${Date.now()}`,
      name: `Navigation: ${page.title}`,
      description: `Verify ${page.url} loads successfully`,
      type: 'web',
      priority: 'medium',
      steps: [
        { action: 'navigate', url: page.url },
        { action: 'waitForLoadState', state: 'networkidle' },
        { action: 'assert', type: 'title', expected: page.title },
      ],
      estimatedDuration: 3000,
    };
  }

  /**
   * Generate form validation tests
   */
  private async generateFormTests(page: any): Promise<GeneratedTest[]> {
    const tests: GeneratedTest[] = [];
    const forms = page.elements.filter((e: any) => e.type === 'form');

    for (const form of forms) {
      // Find inputs in this form
      const inputs = page.elements.filter((e: any) => 
        e.type === 'input' && e.locator.includes(form.locator)
      );

      if (inputs.length > 0) {
        // Positive test - valid data
        tests.push({
          id: `form-valid-${Date.now()}`,
          name: `Form Validation: Valid submission`,
          description: `Test form with valid data on ${page.url}`,
          type: 'web',
          priority: 'high',
          steps: [
            { action: 'navigate', url: page.url },
            ...inputs.map((input: any) => ({
              action: 'fill',
              locator: input.locator,
              value: this.generateValidValue(input),
            })),
            { action: 'click', locator: `${form.locator} button[type="submit"]` },
            { action: 'waitForNavigation' },
          ],
          estimatedDuration: 8000,
        });

        // Negative test - empty required fields
        tests.push({
          id: `form-invalid-${Date.now()}`,
          name: `Form Validation: Empty required fields`,
          description: `Test form validation on ${page.url}`,
          type: 'web',
          priority: 'high',
          steps: [
            { action: 'navigate', url: page.url },
            { action: 'click', locator: `${form.locator} button[type="submit"]` },
            { action: 'assert', type: 'errorMessage', visible: true },
          ],
          estimatedDuration: 5000,
        });
      }
    }

    return tests;
  }

  /**
   * Generate interaction tests
   */
  private generateInteractionTests(websiteMap: any): GeneratedTest[] {
    const tests: GeneratedTest[] = [];
    const interactions = websiteMap.interactions.slice(0, 30); // Limit

    for (const interaction of interactions) {
      tests.push({
        id: `interact-${Date.now()}-${Math.random()}`,
        name: `Interaction: ${interaction.action} on ${interaction.element.text || 'element'}`,
        description: `Test ${interaction.action} interaction`,
        type: 'web',
        priority: 'low',
        steps: [
          { action: 'navigate', url: interaction.page },
          { action: interaction.action, locator: interaction.element.locator },
          { action: 'waitForTimeout', duration: 1000 },
        ],
        estimatedDuration: 3000,
      });
    }

    return tests;
  }

  /**
   * Generate API endpoint test
   */
  private async generateAPIEndpointTest(endpoint: any, apiMap: any): Promise<GeneratedTest> {
    const testData = this.generateTestData(endpoint);

    return {
      id: `api-${endpoint.method.toLowerCase()}-${Date.now()}`,
      name: `API: ${endpoint.method} ${endpoint.path}`,
      description: `Test ${endpoint.method} request to ${endpoint.path}`,
      type: 'api',
      priority: endpoint.path.includes('/auth') ? 'critical' : 'high',
      steps: [
        {
          action: 'apiRequest',
          method: endpoint.method,
          url: `${apiMap.baseUrl}${endpoint.path}`,
          data: testData,
          expectedStatus: this.expectedStatus(endpoint.method),
        },
      ],
      estimatedDuration: 1000,
    };
  }

  /**
   * Generate valid test data for input
   */
  private generateValidValue(input: any): string {
    const locator = input.locator.toLowerCase();

    if (locator.includes('email')) return 'test@example.com';
    if (locator.includes('password')) return 'Test@123456';
    if (locator.includes('name')) return 'Test User';
    if (locator.includes('phone')) return '+1234567890';
    if (locator.includes('address')) return '123 Test Street';
    if (locator.includes('city')) return 'Test City';
    if (locator.includes('zip')) return '12345';

    return 'Test Value';
  }

  /**
   * Generate test data for API request
   */
  private generateTestData(endpoint: any): any {
    if (endpoint.method === 'GET' || endpoint.method === 'DELETE') {
      return undefined;
    }

    if (endpoint.requestBody) {
      return endpoint.requestBody;
    }

    // Generate based on path
    if (endpoint.path.includes('/auth/login')) {
      return { email: 'test@example.com', password: 'Test@123' };
    }

    if (endpoint.path.includes('/auth/register')) {
      return { 
        email: 'newuser@example.com', 
        password: 'Test@123',
        name: 'Test User' 
      };
    }

    return { data: 'test' };
  }

  /**
   * Expected HTTP status for method
   */
  private expectedStatus(method: string): number {
    switch (method) {
      case 'GET': return 200;
      case 'POST': return 201;
      case 'PUT': return 200;
      case 'DELETE': return 204;
      case 'PATCH': return 200;
      default: return 200;
    }
  }

  /**
   * Notify progress callback
   */
  private notifyProgress(progress: GenerationProgress): void {
    if (this.onProgress) {
      this.onProgress(progress);
    }
  }
}

export interface GenerationProgress {
  progress: number; // 0-100
  message: string;
  testsGenerated?: number;
}
