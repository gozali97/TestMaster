import { Browser, chromium } from 'playwright';
import { WebsiteCrawler } from '../discovery/WebsiteCrawler';
import { APICrawler } from '../discovery/APICrawler';
import { TestGenerator } from '../generator/TestGenerator';
import { TestExecutor } from '../executor/TestExecutor';
import { FailureAnalyzer } from '../ai/FailureAnalyzer';
import { ReportGenerator } from '../reporter/ReportGenerator';
import { SmartAuthDetector, LoginDetectionResult, RegisterDetectionResult } from './SmartAuthDetector';
import { EnhancedLoginFlow, LoginResult } from './EnhancedLoginFlow';
import { PostAuthCrawler, AuthenticatedWebsiteMap } from './PostAuthCrawler';
import { CreatePageHandler } from './CreatePageHandler';

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
export class AutonomousTestingOrchestrator {
  private browser?: Browser;
  private sessionId: string;
  private progressCallback?: (progress: ProgressUpdate) => void;

  constructor(
    sessionId: string,
    onProgress?: (progress: ProgressUpdate) => void
  ) {
    this.sessionId = sessionId;
    this.progressCallback = onProgress;
  }

  /**
   * Main entry point - run full autonomous testing
   */
  async runAutonomousTesting(config: AutonomousTestingConfig): Promise<AutonomousTestingResult> {
    console.log(`\n🤖 Starting Autonomous Testing Session: ${this.sessionId}\n`);

    try {
      // Initialize browser with detailed logging
      console.log('🌐 [BROWSER] Launching browser...');
      console.log('🌐 [BROWSER] Headless mode:', config.headless ?? true);
      
      // Launch args for fullscreen/maximized window
      const launchArgs = [
        '--start-maximized',  // Start Chrome maximized
        '--disable-blink-features=AutomationControlled',  // Hide automation
      ];
      
      this.browser = await chromium.launch({ 
        headless: config.headless ?? true,
        timeout: 60000, // Increase launch timeout to 60s
        args: launchArgs,  // Maximize browser window
      });
      
      console.log('✅ [BROWSER] Browser launched successfully');
      console.log('🌐 [BROWSER] Browser version:', this.browser.version());

      // PHASE 1: Discovery
      this.updateProgress({
        phase: 'discovery',
        progress: 0,
        message: 'Starting initial discovery (public pages)...',
      });

      const applicationMap = await this.discoverApplication(config);

      // PHASE 2: Smart Authentication
      let authState: LoginResult | null = null;
      let authenticatedMap: AuthenticatedWebsiteMap | null = null;

      if (config.websiteUrl && applicationMap.website) {
        authState = await this.handleAuthentication(applicationMap, config);

        // PHASE 3: Post-Auth Discovery (if authenticated)
        if (authState && authState.success) {
          this.updateProgress({
            phase: 'discovery',
            progress: 50,
            message: 'Crawling authenticated pages...',
          });

          authenticatedMap = await this.discoverAuthenticatedPages(
            config.websiteUrl,
            authState,
            config.depth
          );

          // Merge authenticated pages into main application map
          if (authenticatedMap) {
            applicationMap.website.pages = [
              ...applicationMap.website.pages,
              ...authenticatedMap.pages.filter(p => 
                !applicationMap.website!.pages.some(existing => existing.url === p.url)
              )
            ];

            console.log(`\n📊 DISCOVERY COMPLETE:`);
            console.log(`   Total pages: ${applicationMap.website.pages.length}`);
            console.log(`   Create pages: ${authenticatedMap.crudPages.createPages.length}`);
            console.log(`   Edit pages: ${authenticatedMap.crudPages.editPages.length}`);
            console.log(`   Dashboard pages: ${authenticatedMap.dashboardPages.length}`);
          }
        }
      }

      // PHASE 4: Test Generation
      this.updateProgress({
        phase: 'generation',
        progress: 0,
        message: 'Generating test cases...',
      });

      const generatedTests = await this.generateTests(applicationMap, config);

      // PHASE 3: Test Execution
      this.updateProgress({
        phase: 'execution',
        progress: 0,
        message: `Executing ${generatedTests.length} tests...`,
      });

      const executionResults = await this.executeTests(generatedTests, config);

      // PHASE 4: Failure Analysis
      this.updateProgress({
        phase: 'analysis',
        progress: 0,
        message: 'Analyzing failures...',
      });

      const analysisResults = await this.analyzeFailures(executionResults, config);

      // PHASE 5: Report Generation
      this.updateProgress({
        phase: 'report',
        progress: 0,
        message: 'Generating report...',
      });

      const report = await this.generateReport({
        applicationMap,
        generatedTests,
        executionResults,
        analysisResults,
        config,
      });

      this.updateProgress({
        phase: 'completed',
        progress: 100,
        message: 'Autonomous testing completed!',
      });

      return {
        sessionId: this.sessionId,
        success: true,
        applicationMap,
        testsGenerated: generatedTests.length,
        testsPassed: executionResults.passed.length,
        testsFailed: executionResults.failed.length,
        testsHealed: executionResults.healed.length,
        duration: executionResults.totalDuration,
        report,
      };

    } catch (error: any) {
      console.error('❌❌❌ Autonomous testing failed:', error);
      console.error('Error Type:', error.constructor.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);

      this.updateProgress({
        phase: 'error',
        progress: 0,
        message: `Error: ${error.message}`,
      });

      throw error;

    } finally {
      // Cleanup - close browser only after everything is done
      if (this.browser) {
        console.log('🌐 [BROWSER] Closing browser...');
        try {
          await this.browser.close();
          console.log('✅ [BROWSER] Browser closed successfully');
        } catch (closeError: any) {
          console.error('❌ [BROWSER] Error closing browser:', closeError.message);
        }
      }
    }
  }

  /**
   * Phase 1: Discover application structure
   */
  private async discoverApplication(config: AutonomousTestingConfig): Promise<ApplicationMap> {
    console.log('🔍 Phase 1: Discovery');
    console.log('📄 [DISCOVERY] Creating new page for discovery...');

    const page = await this.browser!.newPage();
    console.log('✅ [DISCOVERY] Page created successfully');

    try {
      // Discover website structure
      let websiteMap = null;
      if (config.websiteUrl) {
        const websiteCrawler = new WebsiteCrawler(page, (progress) => {
          this.updateProgress({
            phase: 'discovery',
            progress: progress.progress * 0.6, // Website is 60% of discovery
            message: `Crawling website: ${progress.message}`,
            details: {
              pagesFound: progress.pagesFound,
              linksFound: progress.linksFound,
            },
          });
        });

        websiteMap = await websiteCrawler.crawl(config.websiteUrl, config.depth);
      }

      // Discover API structure
      let apiMap = null;
      if (config.apiUrl) {
        const apiCrawler = new APICrawler(page, (progress) => {
          this.updateProgress({
            phase: 'discovery',
            progress: 60 + (progress.progress * 0.4), // API is 40% of discovery
            message: `Discovering APIs: ${progress.message}`,
            details: {
              endpointsFound: progress.endpointsFound,
            },
          });
        });

        apiMap = await apiCrawler.discover(config.apiUrl);
      }

      this.updateProgress({
        phase: 'discovery',
        progress: 100,
        message: 'Discovery completed',
        details: {
          pagesFound: websiteMap?.pages.length || 0,
          endpointsFound: apiMap?.endpoints.length || 0,
        },
      });

      return {
        website: websiteMap,
        api: apiMap,
      };

    } catch (discoveryError: any) {
      console.error('❌ [DISCOVERY] Discovery phase failed:', discoveryError.message);
      throw discoveryError;
    } finally {
      console.log('🧹 [DISCOVERY] Closing discovery page...');
      try {
        if (!page.isClosed()) {
          await page.close();
          console.log('✅ [DISCOVERY] Discovery page closed');
        }
      } catch (closeError: any) {
        console.error('❌ [DISCOVERY] Error closing page:', closeError.message);
      }
    }
  }

  /**
   * Phase 2: Generate tests from application map
   */
  private async generateTests(
    appMap: ApplicationMap,
    config: AutonomousTestingConfig
  ): Promise<GeneratedTest[]> {
    console.log('🧪 Phase 2: Test Generation');

    const generator = new TestGenerator((progress) => {
      this.updateProgress({
        phase: 'generation',
        progress: progress.progress,
        message: progress.message,
        details: {
          testsGenerated: progress.testsGenerated,
        },
      });
    });

    const tests = await generator.generateTests(appMap, config);

    this.updateProgress({
      phase: 'generation',
      progress: 100,
      message: `Generated ${tests.length} test cases`,
    });

    return tests;
  }

  /**
   * Phase 3: Execute generated tests
   */
  private async executeTests(
    tests: GeneratedTest[],
    config: AutonomousTestingConfig
  ): Promise<ExecutionResults> {
    console.log('▶️  Phase 3: Test Execution');

    const executor = new TestExecutor(this.browser!, (progress) => {
      this.updateProgress({
        phase: 'execution',
        progress: progress.progress,
        message: progress.message,
        details: {
          total: progress.total,
          completed: progress.completed,
          passed: progress.passed,
          failed: progress.failed,
          healed: progress.healed,
          currentTest: progress.currentTest,
        },
      });
    });

    const results = await executor.executeTests(tests, {
      parallelWorkers: config.parallelWorkers || 5,
      enableHealing: config.enableHealing ?? true,
      captureVideo: config.captureVideo ?? true,
      captureScreenshots: config.captureScreenshots ?? true,
    });

    this.updateProgress({
      phase: 'execution',
      progress: 100,
      message: `Execution completed: ${results.passed.length}/${tests.length} passed`,
    });

    return results;
  }

  /**
   * Phase 4: Analyze failures with AI
   */
  private async analyzeFailures(
    results: ExecutionResults,
    config: AutonomousTestingConfig
  ): Promise<AnalysisResult[]> {
    console.log('🧠 Phase 4: Failure Analysis');

    if (results.failed.length === 0) {
      this.updateProgress({
        phase: 'analysis',
        progress: 100,
        message: 'No failures to analyze - all tests passed!',
      });
      return [];
    }

    const analyzer = new FailureAnalyzer((progress) => {
      this.updateProgress({
        phase: 'analysis',
        progress: progress.progress,
        message: progress.message,
      });
    });

    const analyses = await analyzer.analyzeFailures(results.failed, config);

    this.updateProgress({
      phase: 'analysis',
      progress: 100,
      message: `Analyzed ${results.failed.length} failures`,
    });

    return analyses;
  }

  /**
   * Phase 5: Generate comprehensive report
   */
  private async generateReport(data: ReportData): Promise<Report> {
    console.log('📊 Phase 5: Report Generation');

    const reportGenerator = new ReportGenerator();
    const report = await reportGenerator.generate(data);

    this.updateProgress({
      phase: 'report',
      progress: 100,
      message: 'Report generated successfully',
    });

    return report;
  }

  /**
   * Update progress and notify callback
   */
  private updateProgress(update: ProgressUpdate): void {
    if (this.progressCallback) {
      this.progressCallback(update);
    }
  }

  /**
   * PHASE 2: Handle Authentication (Smart Login/Register)
   */
  private async handleAuthentication(
    appMap: ApplicationMap,
    config: AutonomousTestingConfig
  ): Promise<LoginResult | null> {
    if (!appMap.website) return null;

    console.log('\n🔐 PHASE 2: Smart Authentication');

    this.updateProgress({
      phase: 'discovery',
      progress: 30,
      message: 'Detecting authentication methods...',
    });

    // Create smart auth detector
    const authDetector = new SmartAuthDetector();

    // Detect login and registration pages
    const loginDetection = authDetector.detectLoginPage(appMap.website.pages);
    const registerDetection = authDetector.detectRegisterPage(appMap.website.pages);

    // Determine strategy
    const hasCredentials = !!(config.authentication?.username && config.authentication?.password);
    const authStrategy = authDetector.determineAuthStrategy(
      loginDetection,
      registerDetection,
      hasCredentials
    );

    console.log(`\n🧠 Authentication Strategy: ${authStrategy.strategy.toUpperCase()}`);
    console.log(`   Reason: ${authStrategy.reason}`);

    // Execute strategy
    if (authStrategy.strategy === 'login') {
      return await this.executeLogin(loginDetection, config);
    } else if (authStrategy.strategy === 'register' || authStrategy.strategy === 'register-then-login') {
      const registerResult = await this.executeRegister(registerDetection, config);
      
      // If register-then-login, also execute login
      if (authStrategy.strategy === 'register-then-login' && registerResult) {
        return await this.executeLogin(loginDetection, config, {
          username: registerResult.username || config.authentication?.username || '',
          password: registerResult.password || config.authentication?.password || ''
        });
      }
      
      return registerResult;
    }

    console.log('⚠️  No authentication performed');
    return null;
  }

  /**
   * Execute login with credentials
   */
  private async executeLogin(
    loginInfo: LoginDetectionResult,
    config: AutonomousTestingConfig,
    overrideCredentials?: { username: string; password: string }
  ): Promise<LoginResult | null> {
    if (!loginInfo.hasLogin || !loginInfo.loginPage) {
      console.log('⚠️  No login page available');
      return null;
    }

    this.updateProgress({
      phase: 'discovery',
      progress: 35,
      message: 'Executing login...',
    });

    const page = await this.browser!.newPage();

    try {
      const credentials = overrideCredentials || {
        username: config.authentication?.username || '',
        password: config.authentication?.password || ''
      };

      if (!credentials.username || !credentials.password) {
        console.log('⚠️  No credentials provided');
        return null;
      }

      const loginFlow = new EnhancedLoginFlow(page);
      const result = await loginFlow.executeLogin(loginInfo, credentials);

      if (result.success) {
        console.log('✅ Login successful!');
        this.updateProgress({
          phase: 'discovery',
          progress: 40,
          message: 'Login successful! Preparing for authenticated crawling...',
        });
      } else {
        console.log('❌ Login failed:', result.message);
      }

      return result;

    } finally {
      await page.close();
    }
  }

  /**
   * Execute registration
   */
  private async executeRegister(
    registerInfo: RegisterDetectionResult,
    _config: AutonomousTestingConfig
  ): Promise<LoginResult | null> {
    if (!registerInfo.hasRegister || !registerInfo.registerPage) {
      console.log('⚠️  No registration page available');
      return null;
    }

    this.updateProgress({
      phase: 'discovery',
      progress: 35,
      message: 'Executing registration...',
    });

    const page = await this.browser!.newPage();

    try {
      // Import FakeDataGenerator
      const { FakeDataGenerator } = await import('../utils/FakeDataGenerator');
      
      // Generate fake registration data
      const fakeData = FakeDataGenerator.generateRegistrationData();
      console.log('🎭 Generated registration data');

      // Use CreatePageHandler to fill registration form
      const createHandler = new CreatePageHandler(page);
      const result = await createHandler.handleCreatePage(registerInfo.registerPage);

      if (result.success) {
        console.log('✅ Registration successful!');

        // Get auth state if auto-logged-in
        const cookies = await page.context().cookies();
        const localStorage = await page.evaluate(() => {
          // @ts-ignore - window.localStorage exists in browser context
          return JSON.stringify(window.localStorage);
        }).catch(() => '{}');

        this.updateProgress({
          phase: 'discovery',
          progress: 40,
          message: 'Registration successful!',
        });

        return {
          success: true,
          redirectUrl: page.url(),
          cookies,
          localStorage,
          message: 'Registration successful',
          username: fakeData.email,
          password: fakeData.password
        };
      }

      console.log('❌ Registration failed');
      return null;

    } finally {
      await page.close();
    }
  }

  /**
   * PHASE 3: Discover Authenticated Pages
   */
  private async discoverAuthenticatedPages(
    baseUrl: string,
    authState: LoginResult,
    depth: 'shallow' | 'deep' | 'exhaustive'
  ): Promise<AuthenticatedWebsiteMap | null> {
    console.log('\n🔐 PHASE 3: Post-Authentication Discovery');

    try {
      const postAuthCrawler = new PostAuthCrawler(this.browser!);
      
      const authenticatedMap = await postAuthCrawler.crawlAuthenticated(
        baseUrl,
        authState,
        depth,
        (progress) => {
          this.updateProgress({
            phase: 'discovery',
            progress: 50 + (progress.progress * 0.4), // 50-90% of discovery
            message: `Crawling authenticated pages: ${progress.message}`,
            details: progress.details,
          });
        }
      );

      this.updateProgress({
        phase: 'discovery',
        progress: 90,
        message: 'Authenticated discovery completed!',
      });

      return authenticatedMap;

    } catch (error: any) {
      console.error('❌ Post-auth crawling failed:', error.message);
      return null;
    }
  }

  /**
   * Check if application has registration forms (legacy - kept for backward compatibility)
   */
  private hasRegistrationForms(_appMap: ApplicationMap): boolean {
    if (!_appMap.website) return false;

    const hasRegisterFlow = _appMap.website.userFlows?.some(
      (flow: any) => flow.name.toLowerCase().includes('registration') || 
              flow.name.toLowerCase().includes('register') ||
              flow.name.toLowerCase().includes('signup')
    );

    const hasRegisterPage = _appMap.website.pages.some(
      (page: any) => page.url.toLowerCase().includes('register') ||
              page.url.toLowerCase().includes('signup') ||
              page.title.toLowerCase().includes('sign up') ||
              page.title.toLowerCase().includes('register')
    );

    return hasRegisterFlow || hasRegisterPage;
  }

  /**
   * Test registration flow with auto-generated data (legacy - kept for backward compatibility)
   */
  private async testRegistration(_appMap: ApplicationMap, _config: AutonomousTestingConfig): Promise<void> {
    console.log('📝 Testing Registration Flow...');
    
    // Import FakeDataGenerator
    const { FakeDataGenerator } = await import('../utils/FakeDataGenerator');
    
    // Find registration page
    const registerPages = _appMap.website!.pages.filter(
      (page: any) => page.url.toLowerCase().includes('register') ||
              page.url.toLowerCase().includes('signup') ||
              page.title.toLowerCase().includes('sign up') ||
              page.title.toLowerCase().includes('register')
    );

    if (registerPages.length === 0) {
      console.log('⚠️  No registration page found');
      return;
    }

    const registerPage = registerPages[0];
    console.log(`📄 Found registration page: ${registerPage.url}`);

    // Generate fake registration data
    const fakeData = FakeDataGenerator.generateRegistrationData();
    console.log('🎭 Generated fake user data:', {
      email: fakeData.email,
      username: fakeData.username,
      name: fakeData.fullName
    });

    this.updateProgress({
      phase: 'registration',
      progress: 30,
      message: 'Filling registration form with test data...',
      details: {
        email: fakeData.email,
        username: fakeData.username,
      },
    });

    try {
      // Create new page for registration test
      const page = await this.browser!.newPage();

      // Navigate to registration page
      console.log(`🌐 Navigating to: ${registerPage.url}`);
      await page.goto(registerPage.url, { waitUntil: 'networkidle', timeout: 30000 });

      this.updateProgress({
        phase: 'registration',
        progress: 50,
        message: 'Auto-filling registration form...',
      });

      // Find and fill all input fields
      const inputs = registerPage.elements.filter((el: any) => el.type === 'input');
      console.log(`📝 Found ${inputs.length} input fields`);

      for (const input of inputs) {
        try {
          const fieldName = input.name || input.id || input.placeholder || '';
          
          // Auto-generate appropriate data based on field name
          const value = FakeDataGenerator.autoFill(
            fieldName,
            input.placeholder,
            input.type
          );

          console.log(`  Filling ${fieldName}: ${value.substring(0, 20)}...`);
          
          // Try multiple locator strategies
          let filled = false;
          
          if (input.id) {
            try {
              await page.fill(`#${input.id}`, value, { timeout: 5000 });
              filled = true;
            } catch (e) {}
          }
          
          if (!filled && input.name) {
            try {
              await page.fill(`[name="${input.name}"]`, value, { timeout: 5000 });
              filled = true;
            } catch (e) {}
          }

          if (!filled && input.placeholder) {
            try {
              await page.fill(`[placeholder="${input.placeholder}"]`, value, { timeout: 5000 });
              filled = true;
            } catch (e) {}
          }

          if (filled) {
            console.log(`  ✅ Filled ${fieldName}`);
          } else {
            console.log(`  ⚠️  Could not fill ${fieldName}`);
          }

        } catch (error: any) {
          console.log(`  ❌ Error filling field: ${error.message}`);
        }
      }

      this.updateProgress({
        phase: 'registration',
        progress: 70,
        message: 'Submitting registration form...',
      });

      // Find and click submit button
      const buttons = registerPage.elements.filter((el: any) => el.type === 'button');
      const submitButton = buttons.find((btn: any) => 
        btn.text?.toLowerCase().includes('submit') ||
        btn.text?.toLowerCase().includes('register') ||
        btn.text?.toLowerCase().includes('sign up') ||
        btn.text?.toLowerCase().includes('create')
      );

      if (submitButton) {
        console.log(`🔘 Clicking submit button: ${submitButton.text}`);
        
        // Try multiple locator strategies for button
        let clicked = false;

        if (submitButton.id) {
          try {
            await page.click(`#${submitButton.id}`, { timeout: 5000 });
            clicked = true;
          } catch (e) {}
        }

        if (!clicked && submitButton.text) {
          try {
            await page.click(`button:has-text("${submitButton.text}")`, { timeout: 5000 });
            clicked = true;
          } catch (e) {}
        }

        if (!clicked) {
          try {
            await page.click('button[type="submit"]', { timeout: 5000 });
            clicked = true;
          } catch (e) {}
        }

        if (clicked) {
          console.log('✅ Submit button clicked');
          
          // Wait for navigation or response
          await Promise.race([
            page.waitForNavigation({ timeout: 10000 }),
            page.waitForTimeout(5000)
          ]).catch(() => {});

          console.log(`📍 Current URL after submit: ${page.url()}`);

          // Check if registration succeeded
          const pageContent = await page.content();
          const success = 
            page.url() !== registerPage.url || // URL changed
            pageContent.toLowerCase().includes('success') ||
            pageContent.toLowerCase().includes('welcome') ||
            pageContent.toLowerCase().includes('verify');

          if (success) {
            console.log('✅ Registration appears successful!');
            
            this.updateProgress({
              phase: 'registration',
              progress: 100,
              message: 'Registration test completed successfully!',
              details: {
                status: 'success',
                redirectUrl: page.url(),
              },
            });
          } else {
            console.log('⚠️  Registration result unclear');
            
            this.updateProgress({
              phase: 'registration',
              progress: 100,
              message: 'Registration test completed (result unclear)',
              details: {
                status: 'uncertain',
              },
            });
          }
        } else {
          console.log('⚠️  Could not click submit button');
        }
      } else {
        console.log('⚠️  No submit button found');
      }

      // Close page
      await page.close();

    } catch (error: any) {
      console.error('❌ Registration test failed:', error.message);
      
      this.updateProgress({
        phase: 'registration',
        progress: 100,
        message: `Registration test failed: ${error.message}`,
        details: {
          status: 'failed',
          error: error.message,
        },
      });
    }

    console.log('✅ Registration testing phase completed');
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
}

// ==================== Types ====================

export interface AutonomousTestingConfig {
  // Target URLs
  websiteUrl?: string;
  apiUrl?: string;

  // Discovery settings
  depth: 'shallow' | 'deep' | 'exhaustive';

  // Execution settings
  parallelWorkers?: number;
  enableHealing?: boolean;
  captureVideo?: boolean;
  captureScreenshots?: boolean;
  headless?: boolean;

  // Authentication settings
  authentication?: {
    username: string;
    password: string;
  };

  // Analysis settings
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
  type: 'button' | 'link' | 'form' | 'input' | 'select' | 'textarea';
  locator: string;
  text?: string;
  visible: boolean;
  name?: string;
  id?: string;
  placeholder?: string;
  inputType?: string;  // For input fields: text, email, password, etc.
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
  progress: number; // 0-100
  message: string;
  details?: any;
}
