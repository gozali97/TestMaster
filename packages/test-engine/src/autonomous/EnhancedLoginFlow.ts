import { Page } from 'playwright';
import { ElementInfo } from './AutonomousTestingOrchestrator';
import { LoginDetectionResult } from './SmartAuthDetector';

/**
 * Enhanced Login Flow
 * 
 * Handles login execution with verification and auth state management
 */
export class EnhancedLoginFlow {
  constructor(private page: Page) {}

  /**
   * Execute login with credentials
   */
  async executeLogin(
    loginInfo: LoginDetectionResult,
    credentials: { username: string; password: string }
  ): Promise<LoginResult> {
    console.log('\n🔐 Executing Login Flow...');
    console.log(`   Username: ${credentials.username}`);
    console.log(`   Password: ${'*'.repeat(credentials.password.length)}`);

    try {
      // Navigate to login page
      console.log(`   Navigating to: ${loginInfo.loginPage!.url}`);
      await this.page.goto(loginInfo.loginPage!.url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      // Fill username
      console.log('   Filling username...');
      await this.fillField(loginInfo.loginForm!.usernameField, credentials.username);

      // Fill password
      console.log('   Filling password...');
      await this.fillField(loginInfo.loginForm!.passwordField, credentials.password);

      // Wait a bit for any JavaScript validation
      await this.page.waitForTimeout(500);

      // Click submit
      console.log('   Clicking submit button...');
      await this.clickButton(loginInfo.loginForm!.submitButton);

      // Wait for navigation/response
      console.log('   Waiting for response...');
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await this.page.waitForTimeout(2000); // Extra wait for redirects

      // Verify login success
      console.log('   Verifying login success...');
      const verification = await this.verifyLoginSuccess();

      if (verification.success) {
        // Store auth state
        const cookies = await this.page.context().cookies();
        const localStorage = await this.page.evaluate(() => {
          const data: Record<string, string> = {};
          for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (key) {
              data[key] = window.localStorage.getItem(key) || '';
            }
          }
          return JSON.stringify(data);
        }).catch(() => '{}');

        console.log('✅ Login successful!');
        console.log(`   Redirect URL: ${this.page.url()}`);
        console.log(`   Cookies saved: ${cookies.length}`);

        return {
          success: true,
          redirectUrl: this.page.url(),
          cookies,
          localStorage,
          message: verification.reason || 'Login successful'
        };
      }

      console.log('❌ Login failed:', verification.reason);
      return {
        success: false,
        message: verification.reason || 'Login verification failed'
      };

    } catch (error: any) {
      console.error('❌ Login execution error:', error.message);
      return {
        success: false,
        message: `Login error: ${error.message}`
      };
    }
  }

  /**
   * Fill a form field with multiple locator strategies
   */
  private async fillField(field: ElementInfo, value: string): Promise<void> {
    let filled = false;

    // Strategy 1: By ID
    if (field.id && !filled) {
      try {
        await this.page.fill(`#${field.id}`, value, { timeout: 5000 });
        filled = true;
      } catch (e) {}
    }

    // Strategy 2: By name
    if (field.name && !filled) {
      try {
        await this.page.fill(`[name="${field.name}"]`, value, { timeout: 5000 });
        filled = true;
      } catch (e) {}
    }

    // Strategy 3: By placeholder
    if (field.placeholder && !filled) {
      try {
        await this.page.fill(`[placeholder="${field.placeholder}"]`, value, { timeout: 5000 });
        filled = true;
      } catch (e) {}
    }

    // Strategy 4: By locator (if exists)
    if (field.locator && !filled) {
      try {
        await this.page.fill(field.locator, value, { timeout: 5000 });
        filled = true;
      } catch (e) {}
    }

    if (!filled) {
      throw new Error(`Could not fill field: ${field.name || field.id || field.placeholder}`);
    }
  }

  /**
   * Click a button with multiple strategies
   */
  private async clickButton(button: ElementInfo): Promise<void> {
    let clicked = false;

    // Strategy 1: By ID
    if (button.id && !clicked) {
      try {
        await this.page.click(`#${button.id}`, { timeout: 5000 });
        clicked = true;
      } catch (e) {}
    }

    // Strategy 2: By text
    if (button.text && !clicked) {
      try {
        await this.page.click(`button:has-text("${button.text}")`, { timeout: 5000 });
        clicked = true;
      } catch (e) {}
    }

    // Strategy 3: By locator
    if (button.locator && !clicked) {
      try {
        await this.page.click(button.locator, { timeout: 5000 });
        clicked = true;
      } catch (e) {}
    }

    // Strategy 4: Submit form (last resort)
    if (!clicked) {
      try {
        await this.page.keyboard.press('Enter');
        clicked = true;
      } catch (e) {}
    }

    if (!clicked) {
      throw new Error(`Could not click button: ${button.text || button.id}`);
    }
  }

  /**
   * Verify login was successful
   */
  private async verifyLoginSuccess(): Promise<{ success: boolean; reason?: string }> {
    const currentUrl = this.page.url();

    // Check 1: URL changed away from login
    if (!currentUrl.includes('/login') && !currentUrl.includes('/signin')) {
      return { success: true, reason: 'Redirected away from login page' };
    }

    // Check 2: Look for success indicators
    const successIndicators = [
      'dashboard', 'profile', 'account', 'welcome',
      'logout', 'sign out', 'my account', 'settings'
    ];

    for (const indicator of successIndicators) {
      try {
        const found = await this.page.locator(`text=${indicator}`).first().isVisible({ timeout: 2000 });
        if (found) {
          return { success: true, reason: `Found success indicator: ${indicator}` };
        }
      } catch (e) {}
    }

    // Check 3: Look for error messages
    const errorSelectors = [
      '.error',
      '.alert-danger',
      '[role="alert"]',
      '.error-message',
      '.login-error'
    ];

    for (const selector of errorSelectors) {
      try {
        const hasError = await this.page.locator(selector).first().isVisible({ timeout: 1000 });
        if (hasError) {
          const errorText = await this.page.locator(selector).first().textContent();
          return { success: false, reason: `Error: ${errorText}` };
        }
      } catch (e) {}
    }

    // Check 4: Look for error text patterns
    const errorPatterns = ['invalid', 'incorrect', 'failed', 'error', 'wrong'];
    for (const pattern of errorPatterns) {
      try {
        const found = await this.page.locator(`text=${pattern}`).first().isVisible({ timeout: 1000 });
        if (found) {
          return { success: false, reason: `Error text found: ${pattern}` };
        }
      } catch (e) {}
    }

    // If still on login page without clear indicators
    if (currentUrl.includes('/login') || currentUrl.includes('/signin')) {
      return { success: false, reason: 'Still on login page, unclear status' };
    }

    // Default: assume success if no errors found
    return { success: true, reason: 'No error indicators found' };
  }

  /**
   * Restore authentication state to a new page
   */
  async restoreAuthState(authState: LoginResult): Promise<void> {
    console.log('🔐 Restoring authentication state...');

    // Restore cookies
    if (authState.cookies && authState.cookies.length > 0) {
      await this.page.context().addCookies(authState.cookies);
      console.log(`   Restored ${authState.cookies.length} cookies`);
    }

    // Restore localStorage
    if (authState.localStorage) {
      await this.page.evaluate((ls) => {
        try {
          const data = JSON.parse(ls);
          for (const [key, value] of Object.entries(data)) {
            window.localStorage.setItem(key, value as string);
          }
        } catch (e) {
          console.error('Failed to restore localStorage:', e);
        }
      }, authState.localStorage);
      console.log('   Restored localStorage');
    }
  }
}

// Types
export interface LoginResult {
  success: boolean;
  redirectUrl?: string;
  cookies?: any[];
  localStorage?: string;
  message: string;
  username?: string;  // For register-then-login flow
  password?: string;  // For register-then-login flow
}
