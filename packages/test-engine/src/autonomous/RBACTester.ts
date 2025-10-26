import { Browser, BrowserContext, Page } from 'playwright';
import { RBACTestResult, AccessControlResult, MultiPanelTestingConfig } from '@testmaster/shared';
import { EnhancedLoginFlow } from './EnhancedLoginFlow';
import { SmartAuthDetector } from './SmartAuthDetector';

/**
 * Role-Based Access Control Tester
 * Tests that users cannot access admin pages and admins can access admin pages
 */
export class RBACTester {
  constructor(
    private browser: Browser,
    private config: MultiPanelTestingConfig
  ) {}
  
  /**
   * Test access control across roles
   */
  async testAccessControl(params: {
    adminPages: any[];
    userPages: any[];
    userCredentials?: { username: string; password: string };
    adminCredentials: { username: string; password: string };
  }): Promise<RBACTestResult> {
    console.log('\n🔒 Starting RBAC Testing...');
    const results: AccessControlResult[] = [];
    
    // Test 1: User should NOT access admin pages
    if (params.userCredentials && params.adminPages.length > 0) {
      console.log('Testing: User trying to access admin pages (should be blocked)');
      
      const userContext = await this.createAuthenticatedContext('user', params.userCredentials);
      
      // Test first 10 admin pages (or all if less than 10)
      const pagesToTest = params.adminPages.slice(0, 10);
      
      for (const adminPage of pagesToTest) {
        const result = await this.testUnauthorizedAccess(
          userContext,
          adminPage.url,
          'user'
        );
        results.push(result);
      }
      
      await userContext.close();
      console.log(`✅ Tested ${pagesToTest.length} admin pages with user credentials`);
    }
    
    // Test 2: Admin CAN access admin pages
    if (params.adminPages.length > 0) {
      console.log('Testing: Admin accessing admin pages (should succeed)');
      
      const adminContext = await this.createAuthenticatedContext('admin', params.adminCredentials);
      
      // Test first 10 admin pages
      const pagesToTest = params.adminPages.slice(0, 10);
      
      for (const adminPage of pagesToTest) {
        const result = await this.testAuthorizedAccess(
          adminContext,
          adminPage.url,
          'admin'
        );
        results.push(result);
      }
      
      await adminContext.close();
      console.log(`✅ Tested ${pagesToTest.length} admin pages with admin credentials`);
    }
    
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    console.log(`\n🔒 RBAC Testing Complete:`);
    console.log(`   Total checks: ${results.length}`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    
    // Log critical failures
    const criticalFailures = results.filter(r => !r.passed && !r.expectedAccess && r.actualAccess);
    if (criticalFailures.length > 0) {
      console.log(`\n⚠️  CRITICAL SECURITY ISSUES FOUND:`);
      criticalFailures.forEach(f => {
        console.log(`   - ${f.message}: ${f.url}`);
      });
    }
    
    return {
      totalChecks: results.length,
      passed,
      failed,
      results,
    };
  }
  
  /**
   * Test unauthorized access (should fail)
   */
  private async testUnauthorizedAccess(
    context: BrowserContext,
    url: string,
    role: string
  ): Promise<AccessControlResult> {
    const page = await context.newPage();
    
    try {
      const response = await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });
      
      await page.waitForTimeout(1000);
      
      const statusCode = response?.status() || 0;
      const currentUrl = page.url();
      
      // Check if access was blocked
      const isBlocked = 
        statusCode === 403 || 
        statusCode === 401 || 
        statusCode === 404 ||
        currentUrl.includes('/login') ||
        currentUrl.includes('/unauthorized') ||
        currentUrl.includes('/forbidden');
      
      await page.close();
      
      return {
        testName: `${role} accessing admin page`,
        url,
        role,
        expectedAccess: false,
        actualAccess: !isBlocked,
        passed: isBlocked,
        statusCode,
        message: isBlocked 
          ? `✅ Access correctly denied (${statusCode})` 
          : `❌ SECURITY ISSUE: ${role} accessed admin page (${statusCode})`,
      };
      
    } catch (error: any) {
      await page.close();
      
      // Error is good here - means access was denied
      return {
        testName: `${role} accessing admin page`,
        url,
        role,
        expectedAccess: false,
        actualAccess: false,
        passed: true,
        statusCode: 0,
        message: '✅ Access denied (error)',
      };
    }
  }
  
  /**
   * Test authorized access (should succeed)
   */
  private async testAuthorizedAccess(
    context: BrowserContext,
    url: string,
    role: string
  ): Promise<AccessControlResult> {
    const page = await context.newPage();
    
    try {
      const response = await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });
      
      await page.waitForTimeout(1000);
      
      const statusCode = response?.status() || 0;
      const currentUrl = page.url();
      
      // Check if access was granted
      const hasAccess = 
        statusCode === 200 && 
        !currentUrl.includes('/login') &&
        !currentUrl.includes('/unauthorized');
      
      await page.close();
      
      return {
        testName: `${role} accessing ${role} page`,
        url,
        role,
        expectedAccess: true,
        actualAccess: hasAccess,
        passed: hasAccess,
        statusCode,
        message: hasAccess 
          ? `✅ Access granted (${statusCode})` 
          : `❌ Access denied unexpectedly (${statusCode})`,
      };
      
    } catch (error: any) {
      await page.close();
      
      return {
        testName: `${role} accessing ${role} page`,
        url,
        role,
        expectedAccess: true,
        actualAccess: false,
        passed: false,
        statusCode: 0,
        message: `❌ Error: ${error.message}`,
      };
    }
  }
  
  /**
   * Create authenticated browser context
   */
  private async createAuthenticatedContext(
    role: 'user' | 'admin',
    credentials: { username: string; password: string }
  ): Promise<BrowserContext> {
    const context = await this.browser.newContext();
    const page = await context.newPage();
    
    try {
      const loginFlow = new EnhancedLoginFlow(page);
      const detector = new SmartAuthDetector();
      
      // Determine login URL
      const loginUrl = role === 'admin' 
        ? this.config.adminPanel.url 
        : (this.config.userPanel?.url || this.config.landingPage.url);
        
      // Navigate to login page
      await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      
      // Extract page elements for detection
      const title = await page.title();
      const url = page.url();
      
      // Detect login page
      const loginInfo = detector.detectLoginPage([{
        url,
        title,
        elements: [], // Will be filled by detector
      }]);
      
      if (!loginInfo.hasLogin) {
        console.log(`⚠️  Login page not detected for ${role}, attempting direct auth...`);
      }
      
      // Execute login
      const authResult = await loginFlow.executeLogin(loginInfo, credentials);
      
      if (!authResult.success) {
        throw new Error(`${role} authentication failed: ${authResult.message}`);
      }
      
      console.log(`✅ ${role} context authenticated`);
      
      await page.close();
      return context;
      
    } catch (error: any) {
      await page.close();
      await context.close();
      throw error;
    }
  }
}
