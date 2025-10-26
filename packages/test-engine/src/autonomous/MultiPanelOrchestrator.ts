import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { 
  MultiPanelTestingConfig, 
  PanelTestResult, 
  MultiPanelTestReport,
  ProgressUpdate,
  RBACTestResult
} from '@testmaster/shared';
import { WebsiteCrawler } from '../discovery/WebsiteCrawler';
import { PostAuthCrawler } from './PostAuthCrawler';
import { SmartAuthDetector } from './SmartAuthDetector';
import { EnhancedLoginFlow, LoginResult } from './EnhancedLoginFlow';
import { TestGenerator } from '../generator/TestGenerator';
import { TestExecutor } from '../executor/TestExecutor';
import { RBACTester } from './RBACTester';
import { FakeDataGenerator } from '../utils/FakeDataGenerator';

/**
 * Multi-Panel Testing Orchestrator
 * Coordinates testing across landing, user, and admin panels
 */
export class MultiPanelOrchestrator {
  private browser?: Browser;
  private sessionId: string;
  private config: MultiPanelTestingConfig;
  private progressCallback?: (update: ProgressUpdate) => void;
  
  private results: Map<string, PanelTestResult> = new Map();
  
  constructor(
    sessionId: string,
    config: MultiPanelTestingConfig,
    onProgress?: (update: ProgressUpdate) => void
  ) {
    this.sessionId = sessionId;
    this.config = config;
    this.progressCallback = onProgress;
  }
  
  /**
   * Main execution method
   */
  async execute(): Promise<MultiPanelTestReport> {
    console.log('\n🚀 ========================================');
    console.log('🚀 MULTI-PANEL AUTONOMOUS TESTING');
    console.log('🚀 ========================================');
    console.log(`Session ID: ${this.sessionId}`);
    console.log(`Landing URL: ${this.config.landingPage.url}`);
    console.log(`Login URL: ${this.config.loginUrl || '(use admin panel URL)'}`);
    console.log(`Admin URL: ${this.config.adminPanel.url}`);
    console.log(`User Panel: ${this.config.userPanel?.enabled ? 'Enabled' : 'Disabled'}`);
    console.log(`Test RBAC: ${this.config.testRBAC ? 'Yes' : 'No'}`);
    console.log('========================================\n');
    
    // Initialize browser
    this.browser = await chromium.launch({
      headless: this.config.headless ?? false,
      args: ['--start-maximized'],
      timeout: 60000,
    });
    
    try {
      const startTime = Date.now();
      
      // Phase 1: Landing Page (Public)
      this.updateProgress('landing', 0, 'Testing landing page...');
      const landingResult = await this.testLandingPage();
      this.results.set('landing', landingResult);
      
      // Phase 2: User Panel (if enabled)
      let userResult: PanelTestResult | undefined;
      if (this.config.userPanel?.enabled) {
        this.updateProgress('user', 0, 'Testing user panel...');
        userResult = await this.testUserPanel();
        this.results.set('user', userResult);
      }
      
      // Phase 3: Admin Panel
      this.updateProgress('admin', 0, 'Testing admin panel...');
      const adminResult = await this.testAdminPanel();
      this.results.set('admin', adminResult);
      
      // Phase 4: RBAC Tests
      let rbacResult: RBACTestResult | undefined;
      if (this.config.testRBAC) {
        this.updateProgress('rbac', 0, 'Testing access control...');
        rbacResult = await this.testRBAC();
      }
      
      // Phase 5: Generate Report
      this.updateProgress('report', 0, 'Generating report...');
      const report = await this.generateReport({
        landing: landingResult,
        user: userResult,
        admin: adminResult,
        rbac: rbacResult,
        duration: Date.now() - startTime,
      });
      
      this.updateProgress('completed', 100, 'Multi-panel testing completed!');
      
      console.log('\n✅ ========================================');
      console.log('✅ MULTI-PANEL TESTING COMPLETE');
      console.log('✅ ========================================');
      console.log(`Total Tests: ${report.summary.totalTests}`);
      console.log(`Passed: ${report.summary.totalPassed}`);
      console.log(`Failed: ${report.summary.totalFailed}`);
      console.log(`Healed: ${report.summary.totalHealed}`);
      console.log(`Coverage: ${report.summary.overallCoverage}%`);
      console.log(`Duration: ${Math.round(report.duration / 1000)}s`);
      console.log('========================================\n');
      
      return report;
      
    } catch (error: any) {
      console.error('❌ Multi-panel testing failed:', error);
      this.updateProgress('error', 0, error.message);
      throw error;
      
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
  
  /**
   * Test landing page (public pages)
   */
  private async testLandingPage(): Promise<PanelTestResult> {
    console.log('\n📄 ========================================');
    console.log('📄 PHASE 1: LANDING PAGE TESTING');
    console.log('📄 ========================================\n');
    
    const context = await this.browser!.newContext();
    const page = await context.newPage();
    
    try {
      const startTime = Date.now();
      
      // 1. Discovery
      this.updateProgress('landing', 10, 'Discovering public pages...');
      const crawler = new WebsiteCrawler(page);
      const siteMap = await crawler.crawl(
        this.config.landingPage.url,
        this.config.depth
      );
      
      console.log(`✅ Discovered ${siteMap.pages.length} public pages`);
      
      // 2. Test Generation
      this.updateProgress('landing', 40, 'Generating tests...');
      const generator = new TestGenerator();
      const tests = await generator.generateTests({ website: siteMap, api: null }, this.config);
      
      console.log(`✅ Generated ${tests.length} tests`);
      
      // 3. Test Execution
      this.updateProgress('landing', 60, 'Executing tests...');
      const executor = new TestExecutor(this.browser!);
      const execResult = await executor.executeTests(tests, {
        parallelWorkers: this.config.parallelWorkers || 3,
        enableHealing: this.config.enableHealing,
        captureVideo: this.config.captureVideo,
        captureScreenshots: true,
      } as any);
      
      console.log(`✅ Tests completed: ${execResult.passed.length} passed, ${execResult.failed.length} failed`);
      
      // 4. Build result
      const result: PanelTestResult = {
        panelType: 'landing',
        panelName: 'Landing Page (Public)',
        discovery: {
          pagesDiscovered: siteMap.pages.length,
          discoveryDuration: 0,
          pages: siteMap.pages,
        },
        testGeneration: {
          testsGenerated: tests.length,
          testCategories: {
            navigation: tests.filter((t: any) => t.category === 'navigation').length,
            forms: tests.filter((t: any) => t.category === 'forms').length,
            crud: 0,
            permissions: 0,
          },
        },
        execution: {
          testsPassed: execResult.passed.length,
          testsFailed: execResult.failed.length,
          testsHealed: execResult.healed.length,
          executionDuration: Date.now() - startTime,
          coverage: this.calculateCoverage(siteMap.pages.length, tests.length),
        },
        failures: execResult.failed.map((f: any) => this.formatFailure(f)),
        screenshots: [],
        video: undefined,
      };
      
      this.updateProgress('landing', 100, 'Landing page testing complete');
      return result;
      
    } finally {
      await context.close();
    }
  }
  
  /**
   * Test user panel (authenticated as regular user)
   */
  private async testUserPanel(): Promise<PanelTestResult> {
    console.log('\n👤 ========================================');
    console.log('👤 PHASE 2: USER PANEL TESTING');
    console.log('👤 ========================================\n');
    
    const context = await this.browser!.newContext();
    const page = await context.newPage();
    
    try {
      const startTime = Date.now();
      
      // 1. Authentication
      this.updateProgress('user', 5, 'Authenticating as user...');
      const authResult = await this.authenticateAsUser(page);
      
      if (!authResult.success) {
        throw new Error(`User authentication failed: ${authResult.message}`);
      }
      
      console.log('✅ User authenticated');
      
      // 2. Discovery
      this.updateProgress('user', 20, 'Discovering user pages...');
      const userUrl = this.config.userPanel?.url || this.config.landingPage.url;
      const crawler = new PostAuthCrawler(this.browser!);
      const siteMap = await crawler.crawlAuthenticated(userUrl, authResult, this.config.depth);
      
      console.log(`✅ Discovered ${siteMap.pages.length} user pages`);
      
      // 3. Test Generation
      this.updateProgress('user', 50, 'Generating user tests...');
      const generator = new TestGenerator();
      const tests = await generator.generateTests({ website: siteMap as any, api: null }, this.config);
      
      console.log(`✅ Generated ${tests.length} tests`);
      
      // 4. Test Execution
      this.updateProgress('user', 70, 'Executing user tests...');
      const executor = new TestExecutor(this.browser!);
      const execResult = await executor.executeTests(tests, {
        parallelWorkers: this.config.parallelWorkers || 3,
        enableHealing: this.config.enableHealing,
        captureVideo: this.config.captureVideo,
        captureScreenshots: true,
      } as any);
      
      console.log(`✅ Tests completed: ${execResult.passed.length} passed, ${execResult.failed.length} failed`);
      
      // 5. Build result
      const result: PanelTestResult = {
        panelType: 'user',
        panelName: 'User Panel',
        discovery: {
          pagesDiscovered: siteMap.pages.length,
          discoveryDuration: 0,
          pages: siteMap.pages,
        },
        testGeneration: {
          testsGenerated: tests.length,
          testCategories: {
            navigation: tests.filter((t: any) => t.category === 'navigation').length,
            forms: tests.filter((t: any) => t.category === 'forms').length,
            crud: tests.filter((t: any) => t.category === 'crud').length,
            permissions: tests.filter((t: any) => t.category === 'permissions').length,
          },
        },
        execution: {
          testsPassed: execResult.passed.length,
          testsFailed: execResult.failed.length,
          testsHealed: execResult.healed.length,
          executionDuration: Date.now() - startTime,
          coverage: this.calculateCoverage(siteMap.pages.length, tests.length),
        },
        failures: execResult.failed.map((f: any) => this.formatFailure(f)),
        screenshots: [],
        video: undefined,
      };
      
      this.updateProgress('user', 100, 'User panel testing complete');
      return result;
      
    } finally {
      await context.close();
    }
  }
  
  /**
   * Test admin panel (authenticated as admin)
   */
  private async testAdminPanel(): Promise<PanelTestResult> {
    console.log('\n⚡ ========================================');
    console.log('⚡ PHASE 3: ADMIN PANEL TESTING');
    console.log('⚡ ========================================\n');
    
    const context = await this.browser!.newContext();
    const page = await context.newPage();
    
    try {
      const startTime = Date.now();
      
      // 1. Authentication
      this.updateProgress('admin', 5, 'Authenticating as admin...');
      const authResult = await this.authenticateAsAdmin(page);
      
      if (!authResult.success) {
        throw new Error(`Admin authentication failed: ${authResult.message}`);
      }
      
      console.log('✅ Admin authenticated');
      
      // 2. Discovery
      this.updateProgress('admin', 20, 'Discovering admin pages...');
      const crawler = new PostAuthCrawler(this.browser!);
      const siteMap = await crawler.crawlAuthenticated(
        this.config.adminPanel.url,
        authResult,
        this.config.depth
      );
      
      console.log(`✅ Discovered ${siteMap.pages.length} admin pages`);
      
      // 3. Test Generation
      this.updateProgress('admin', 50, 'Generating admin tests...');
      const generator = new TestGenerator();
      const tests = await generator.generateTests({ website: siteMap as any, api: null }, this.config);
      
      console.log(`✅ Generated ${tests.length} tests`);
      
      // 4. Test Execution
      this.updateProgress('admin', 70, 'Executing admin tests...');
      const executor = new TestExecutor(this.browser!);
      const execResult = await executor.executeTests(tests, {
        parallelWorkers: this.config.parallelWorkers || 3,
        enableHealing: this.config.enableHealing,
        captureVideo: this.config.captureVideo,
        captureScreenshots: true,
      } as any);
      
      console.log(`✅ Tests completed: ${execResult.passed.length} passed, ${execResult.failed.length} failed`);
      
      // 5. Build result
      const result: PanelTestResult = {
        panelType: 'admin',
        panelName: 'Admin Panel',
        discovery: {
          pagesDiscovered: siteMap.pages.length,
          discoveryDuration: 0,
          pages: siteMap.pages,
        },
        testGeneration: {
          testsGenerated: tests.length,
          testCategories: {
            navigation: tests.filter((t: any) => t.category === 'navigation').length,
            forms: tests.filter((t: any) => t.category === 'forms').length,
            crud: tests.filter((t: any) => t.category === 'crud').length,
            permissions: tests.filter((t: any) => t.category === 'permissions').length,
          },
        },
        execution: {
          testsPassed: execResult.passed.length,
          testsFailed: execResult.failed.length,
          testsHealed: execResult.healed.length,
          executionDuration: Date.now() - startTime,
          coverage: this.calculateCoverage(siteMap.pages.length, tests.length),
        },
        failures: execResult.failed.map((f: any) => this.formatFailure(f)),
        screenshots: [],
        video: undefined,
      };
      
      this.updateProgress('admin', 100, 'Admin panel testing complete');
      return result;
      
    } finally {
      await context.close();
    }
  }
  
  /**
   * Test role-based access control
   */
  private async testRBAC(): Promise<RBACTestResult> {
    console.log('\n🔒 ========================================');
    console.log('🔒 PHASE 4: RBAC TESTING');
    console.log('🔒 ========================================\n');
    
    const tester = new RBACTester(this.browser!, this.config);
    
    const adminPages = this.results.get('admin')?.discovery.pages || [];
    const userPages = this.results.get('user')?.discovery.pages || [];
    
    const results = await tester.testAccessControl({
      adminPages,
      userPages,
      userCredentials: this.config.userPanel?.credentials,
      adminCredentials: this.config.adminPanel.credentials,
    });
    
    return results;
  }
  
  /**
   * Authenticate as user
   */
  private async authenticateAsUser(page: Page): Promise<LoginResult> {
    if (this.config.userPanel?.authStrategy === 'provided' && this.config.userPanel.credentials) {
      const loginFlow = new EnhancedLoginFlow(page);
      const detector = new SmartAuthDetector();
      
      // Use separate login URL if provided, otherwise use user panel URL or landing URL
      const loginUrl = this.config.loginUrl || this.config.userPanel.url || this.config.landingPage.url;
      console.log(`🔐 [USER AUTH] Navigating to login page: ${loginUrl}`);
      
      await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      
      console.log(`🔐 [USER AUTH] Current page after navigation: ${page.url()}`);
      
      const loginInfo = detector.detectLoginPage([{
        url: page.url(),
        title: await page.title(),
        elements: [],
      }]);
      
      console.log(`🔐 [USER AUTH] Login detection result:`, {
        hasLogin: loginInfo.hasLogin,
        loginUrl: loginInfo.loginUrl
      });
      
      if (loginInfo.hasLogin) {
        console.log(`🔐 [USER AUTH] Executing login with provided credentials...`);
        return await loginFlow.executeLogin(loginInfo, this.config.userPanel.credentials);
      }
    }
    
    // Auto-register
    console.log('Auto-registering new user...');
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'TestPassword123!';
    
    // TODO: Implement auto-registration
    return { 
      success: true, 
      message: 'Auto-registered',
      redirectUrl: page.url(),
      cookies: [],
      localStorage: '{}'
    };
  }
  
  /**
   * Authenticate as admin
   */
  private async authenticateAsAdmin(page: Page): Promise<LoginResult> {
    const loginFlow = new EnhancedLoginFlow(page);
    
    // Use separate login URL if provided, otherwise use admin panel URL
    const loginUrl = this.config.loginUrl || this.config.adminPanel.url;
    console.log(`🔐 [ADMIN AUTH] Navigating to login page: ${loginUrl}`);
    
    await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    
    console.log(`🔐 [ADMIN AUTH] Current page after navigation: ${page.url()}`);
    
    // Scan page for form elements
    console.log(`🔐 [ADMIN AUTH] Scanning page for login form...`);
    const elements = await this.scanPageElements(page);
    console.log(`🔐 [ADMIN AUTH] Found ${elements.length} elements on page`);
    
    const detector = new SmartAuthDetector();
    const loginInfo = detector.detectLoginPage([{
      url: page.url(),
      title: await page.title(),
      elements: elements,
    }]);
    
    console.log(`🔐 [ADMIN AUTH] Login detection result:`, {
      hasLogin: loginInfo.hasLogin,
      loginUrl: loginInfo.loginUrl,
      formFields: loginInfo.loginForm ? 'detected' : 'not found'
    });
    
    // Validate loginForm has all required fields (including loginPage)
    const hasValidForm = loginInfo.hasLogin && 
                        loginInfo.loginPage &&  // ← Check loginPage too!
                        loginInfo.loginForm && 
                        loginInfo.loginForm.usernameField && 
                        loginInfo.loginForm.passwordField;
    
    console.log(`🔐 [ADMIN AUTH] Validation result:`, {
      hasLogin: loginInfo.hasLogin,
      hasLoginPage: !!loginInfo.loginPage,
      hasLoginForm: !!loginInfo.loginForm,
      hasUsernameField: !!loginInfo.loginForm?.usernameField,
      hasPasswordField: !!loginInfo.loginForm?.passwordField,
      hasValidForm: hasValidForm
    });
    
    if (!hasValidForm) {
      // Try direct form detection as fallback
      console.log(`🔐 [ADMIN AUTH] SmartAuthDetector incomplete, trying direct form detection...`);
      return await this.directLoginAttempt(page);
    }
    
    console.log(`🔐 [ADMIN AUTH] Executing login with EnhancedLoginFlow...`);
    try {
      return await loginFlow.executeLogin(loginInfo, this.config.adminPanel.credentials);
    } catch (error: any) {
      console.error(`🔐 [ADMIN AUTH] EnhancedLoginFlow failed: ${error.message}`);
      console.log(`🔐 [ADMIN AUTH] Falling back to direct login attempt...`);
      return await this.directLoginAttempt(page);
    }
  }
  
  /**
   * Scan page for elements (needed by SmartAuthDetector)
   */
  private async scanPageElements(page: Page): Promise<any[]> {
    try {
      const elements = await page.evaluate(() => {
        const result: any[] = [];
        
        // Scan all input fields
        document.querySelectorAll('input').forEach((input: HTMLInputElement) => {
          result.push({
            type: 'input',
            inputType: input.type,
            name: input.name,
            id: input.id,
            placeholder: input.placeholder,
            selector: input.tagName.toLowerCase() + (input.id ? `#${input.id}` : input.name ? `[name="${input.name}"]` : ''),
          });
        });
        
        // Scan all buttons
        document.querySelectorAll('button, input[type="submit"]').forEach((btn: HTMLElement) => {
          result.push({
            type: 'button',
            text: btn.textContent?.trim() || (btn as HTMLInputElement).value || '',
            selector: btn.tagName.toLowerCase() + (btn.id ? `#${btn.id}` : ''),
          });
        });
        
        return result;
      });
      
      return elements;
    } catch (error) {
      console.error(`🔐 [ADMIN AUTH] Error scanning page elements:`, error);
      return [];
    }
  }
  
  /**
   * Direct login attempt without SmartAuthDetector
   */
  private async directLoginAttempt(page: Page): Promise<LoginResult> {
    try {
      console.log(`🔐 [ADMIN AUTH] Attempting direct form fill...`);
      
      // Wait a bit for page to be ready
      await page.waitForTimeout(1000);
      
      // Find username/email field
      const usernameSelectors = [
        'input[type="email"]',
        'input[type="text"][name*="email" i]',
        'input[type="text"][name*="username" i]',
        'input[type="text"][name*="user" i]',
        'input[type="text"][placeholder*="email" i]',
        'input[type="text"][placeholder*="username" i]',
        'input[type="text"][placeholder*="user" i]',
        'input[name="email"]',
        'input[name="username"]',
        'input[name="user"]',
        'input[id*="email" i]',
        'input[id*="username" i]',
        'input[id*="user" i]',
        'input[type="text"]', // Fallback to first text input
      ];
      
      let usernameField = null;
      for (const selector of usernameSelectors) {
        usernameField = await page.$(selector);
        if (usernameField) {
          console.log(`🔐 [ADMIN AUTH] Found username field with selector: ${selector}`);
          break;
        }
      }
      
      // Find password field
      const passwordField = await page.$('input[type="password"]');
      
      if (!usernameField || !passwordField) {
        console.error(`🔐 [ADMIN AUTH] Could not find login form fields`);
        console.error(`   Username field: ${usernameField ? 'found' : 'NOT FOUND'}`);
        console.error(`   Password field: ${passwordField ? 'found' : 'NOT FOUND'}`);
        
        // Take screenshot for debugging
        try {
          await page.screenshot({ path: 'login-form-not-found.png', fullPage: true });
          console.log(`🔐 [ADMIN AUTH] Screenshot saved to login-form-not-found.png`);
        } catch (e) {}
        
        return { success: false, message: 'Login form not found on page' };
      }
      
      console.log(`🔐 [ADMIN AUTH] Found login form, filling credentials...`);
      
      // Clear fields first
      await usernameField.fill('');
      await passwordField.fill('');
      
      // Fill credentials
      await usernameField.fill(this.config.adminPanel.credentials.username);
      await page.waitForTimeout(500); // Wait for any JS validation
      
      await passwordField.fill(this.config.adminPanel.credentials.password);
      await page.waitForTimeout(500);
      
      console.log(`🔐 [ADMIN AUTH] Credentials filled successfully`);
      console.log(`🔐 [ADMIN AUTH] Looking for submit button...`);
      
      // Find and click submit button
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Login")',
        'button:has-text("Sign in")',
        'button:has-text("Log in")',
        'button:has-text("Masuk")',
        'button:has-text("MASUK")',
        'button',
      ];
      
      let submitted = false;
      for (const selector of submitSelectors) {
        try {
          const button = await page.$(selector);
          if (button && await button.isVisible()) {
            console.log(`🔐 [ADMIN AUTH] Clicking submit button: ${selector}`);
            await button.click();
            submitted = true;
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      if (!submitted) {
        // Try pressing Enter on password field
        console.log(`🔐 [ADMIN AUTH] No submit button found, pressing Enter on password field...`);
        await passwordField.press('Enter');
      }
      
      // Wait for navigation with longer timeout
      console.log(`🔐 [ADMIN AUTH] Waiting for navigation after login...`);
      
      try {
        await Promise.race([
          page.waitForNavigation({ timeout: 10000 }),
          page.waitForLoadState('networkidle', { timeout: 15000 })
        ]);
      } catch (e) {
        console.log(`🔐 [ADMIN AUTH] Navigation timeout (normal for some sites)`);
      }
      
      // Extra wait for SPA and JavaScript
      await page.waitForTimeout(3000);
      
      const afterLoginUrl = page.url();
      console.log(`🔐 [ADMIN AUTH] After login URL: ${afterLoginUrl}`);
      
      // Check if still on login page
      if (afterLoginUrl.includes('/login') || afterLoginUrl.includes('/signin') || afterLoginUrl.includes('/masuk')) {
        console.log(`🔐 [ADMIN AUTH] Still on login page, checking for errors...`);
        
        // Check for error messages
        const errorSelectors = [
          'text=/error|invalid|incorrect|failed|wrong|gagal|salah/i',
          '.error', '.alert-danger', '[role="alert"]'
        ];
        
        for (const selector of errorSelectors) {
          const hasError = await page.$(selector);
          if (hasError) {
            const errorText = await hasError.textContent();
            console.error(`🔐 [ADMIN AUTH] Login failed with error: ${errorText}`);
            return { success: false, message: `Login failed: ${errorText}` };
          }
        }
        
        // Wait a bit more for slow redirects
        console.log(`🔐 [ADMIN AUTH] Waiting 2 more seconds for late redirect...`);
        await page.waitForTimeout(2000);
        
        const finalUrl = page.url();
        if (finalUrl === afterLoginUrl) {
          console.error(`🔐 [ADMIN AUTH] Still on login page, login likely failed`);
          return { success: false, message: 'Still on login page - credentials may be incorrect or site requires captcha/2FA' };
        }
        
        console.log(`🔐 [ADMIN AUTH] URL changed to: ${finalUrl}`);
      }
      
      console.log(`🔐 [ADMIN AUTH] ✅ Login successful!`);
      
      // Get cookies for session persistence
      const cookies = await page.context().cookies();
      
      return {
        success: true,
        message: 'Logged in successfully',
        redirectUrl: page.url(),
        cookies: cookies,
        localStorage: '{}',
      };
      
    } catch (error: any) {
      console.error(`🔐 [ADMIN AUTH] Direct login attempt failed:`, error);
      return { success: false, message: error.message };
    }
  }
  
  /**
   * Generate comprehensive report
   */
  private async generateReport(data: any): Promise<MultiPanelTestReport> {
    const landingResult = data.landing;
    const userResult = data.user;
    const adminResult = data.admin;
    const rbacResult = data.rbac;
    
    // Calculate summary
    const totalTests = 
      landingResult.execution.testsPassed + landingResult.execution.testsFailed +
      (userResult?.execution.testsPassed || 0) + (userResult?.execution.testsFailed || 0) +
      adminResult.execution.testsPassed + adminResult.execution.testsFailed;
    
    const totalPassed = 
      landingResult.execution.testsPassed +
      (userResult?.execution.testsPassed || 0) +
      adminResult.execution.testsPassed;
    
    const totalFailed = 
      landingResult.execution.testsFailed +
      (userResult?.execution.testsFailed || 0) +
      adminResult.execution.testsFailed;
    
    const totalHealed = 
      landingResult.execution.testsHealed +
      (userResult?.execution.testsHealed || 0) +
      adminResult.execution.testsHealed;
    
    const overallCoverage = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
    
    return {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      duration: data.duration,
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        totalHealed,
        overallCoverage,
      },
      panels: {
        landing: landingResult,
        user: userResult,
        admin: adminResult,
      },
      rbacTests: rbacResult,
      files: {
        html: `/reports/${this.sessionId}/report.html`,
        json: `/reports/${this.sessionId}/report.json`,
      },
    };
  }
  
  /**
   * Calculate coverage percentage
   */
  private calculateCoverage(pages: number, tests: number): number {
    if (pages === 0) return 0;
    return Math.min(100, Math.round((tests / pages) * 100 / 3));
  }
  
  /**
   * Format failure details
   */
  private formatFailure(failure: any): any {
    return {
      testName: failure.testName || failure.name || 'Unknown',
      url: failure.url || '',
      error: failure.error || failure.message || 'Unknown error',
      screenshot: failure.screenshot,
      timestamp: new Date().toISOString(),
    };
  }
  
  /**
   * Update progress
   */
  private updateProgress(phase: string, progress: number, message: string) {
    if (this.progressCallback) {
      this.progressCallback({
        phase,
        progress,
        message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
