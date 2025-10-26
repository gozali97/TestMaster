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
      // Validate loginInfo has required fields
      if (!loginInfo.loginForm) {
        throw new Error('Login form information is missing');
      }
      
      if (!loginInfo.loginForm.usernameField || !loginInfo.loginForm.passwordField) {
        throw new Error('Login form fields are incomplete');
      }
      
      // Note: submitButton is optional, we can press Enter if not found
      
      // Navigate to login page (only if loginPage is provided, otherwise assume we're already there)
      if (loginInfo.loginPage && loginInfo.loginPage.url) {
        console.log(`   Navigating to: ${loginInfo.loginPage.url}`);
        await this.page.goto(loginInfo.loginPage.url, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });
        await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      } else {
        console.log(`   Skipping navigation (already on login page)`);
      }

      // Fill username
      console.log('   Filling username...');
      await this.fillField(loginInfo.loginForm.usernameField, credentials.username);

      // Fill password
      console.log('   Filling password...');
      await this.fillField(loginInfo.loginForm.passwordField, credentials.password);

      // Wait a bit for any JavaScript validation
      await this.page.waitForTimeout(500);

      // Submit form (click button or press Enter)
      if (loginInfo.loginForm.submitButton) {
        console.log('   Clicking submit button...');
        await this.clickButton(loginInfo.loginForm.submitButton);
      } else {
        console.log('   No submit button found, pressing Enter on password field...');
        // Try to find password field and press Enter
        const passwordField = loginInfo.loginForm.passwordField;
        if (passwordField.id) {
          await this.page.press(`#${passwordField.id}`, 'Enter');
        } else if (passwordField.name) {
          await this.page.press(`[name="${passwordField.name}"]`, 'Enter');
        } else if (passwordField.locator) {
          await this.page.press(passwordField.locator, 'Enter');
        } else {
          // Fallback: press Enter on any password field
          await this.page.press('input[type="password"]', 'Enter');
        }
      }

      // Wait for navigation/response
      console.log('   Waiting for response...');
      
      // Wait for navigation with longer timeout
      try {
        await Promise.race([
          this.page.waitForNavigation({ timeout: 10000 }),
          this.page.waitForLoadState('networkidle', { timeout: 15000 })
        ]);
      } catch (e) {
        console.log('   Navigation/network idle timeout (this is normal for some sites)');
      }
      
      // Extra wait for SPA redirects and JavaScript
      await this.page.waitForTimeout(3000);
      
      console.log(`   Current URL after submit: ${this.page.url()}`);

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
  private async fillField(field: ElementInfo | undefined, value: string): Promise<void> {
    if (!field) {
      throw new Error('Field is undefined');
    }
    
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
      throw new Error(`Could not fill field: ${field.name || field.id || field.placeholder || 'unknown'}`);
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
    console.log(`   [VERIFY] Current URL: ${currentUrl}`);

    // Check 1: URL changed away from login
    if (!currentUrl.includes('/login') && 
        !currentUrl.includes('/signin') && 
        !currentUrl.includes('/sign-in') &&
        !currentUrl.includes('/masuk')) {
      console.log(`   [VERIFY] ✅ URL changed away from login page`);
      return { success: true, reason: 'Redirected away from login page' };
    }

    // Check 2: Look for error messages FIRST (if error found, login definitely failed)
    console.log(`   [VERIFY] Checking for error messages...`);
    const errorSelectors = [
      'text=/incorrect|invalid|wrong|error|gagal|salah/i',
      '.error',
      '.alert-danger',
      '[role="alert"]',
      '.error-message',
      '.login-error',
      '.alert-error'
    ];

    for (const selector of errorSelectors) {
      try {
        const errorElement = await this.page.locator(selector).first().isVisible({ timeout: 1000 });
        if (errorElement) {
          const errorText = await this.page.locator(selector).first().textContent();
          console.log(`   [VERIFY] ❌ Found error: ${errorText}`);
          return { success: false, reason: `Login error found: ${errorText}` };
        }
      } catch (e) {}
    }

    // Check 3: Look for success indicators
    console.log(`   [VERIFY] Checking for success indicators...`);
    const successIndicators = [
      'dashboard', 'admin', 'profile', 'account', 'welcome',
      'logout', 'sign out', 'keluar', 'my account', 'settings',
      'beranda', 'dasbor'
    ];

    for (const indicator of successIndicators) {
      try {
        const found = await this.page.locator(`text=/${indicator}/i`).first().isVisible({ timeout: 1000 });
        if (found) {
          console.log(`   [VERIFY] ✅ Found success indicator: ${indicator}`);
          return { success: true, reason: `Found success indicator: ${indicator}` };
        }
      } catch (e) {}
    }

    // Check 4: Check if login form still visible (strong indicator of failure)
    console.log(`   [VERIFY] Checking if login form still visible...`);
    try {
      const passwordFieldStillVisible = await this.page.locator('input[type="password"]').first().isVisible({ timeout: 1000 });
      if (passwordFieldStillVisible) {
        console.log(`   [VERIFY] ⚠️ Login form still visible`);
        // But this doesn't mean failure - maybe it's a different page with password field
        // So we don't return false here, continue checking
      }
    } catch (e) {}

    // If still on login page without clear indicators, it's likely a failure
    if (currentUrl.includes('/login') || currentUrl.includes('/signin') || currentUrl.includes('/sign-in') || currentUrl.includes('/masuk')) {
      console.log(`   [VERIFY] ⚠️ Still on login page (${currentUrl}), checking credentials...`);
      
      // Last attempt: wait a bit more and check again
      console.log(`   [VERIFY] Waiting 2 more seconds for any late redirects...`);
      await this.page.waitForTimeout(2000);
      
      const finalUrl = this.page.url();
      console.log(`   [VERIFY] Final URL after extra wait: ${finalUrl}`);
      
      if (finalUrl !== currentUrl) {
        console.log(`   [VERIFY] ✅ URL changed after extra wait!`);
        return { success: true, reason: 'URL changed after extra wait' };
      }
      
      console.log(`   [VERIFY] ❌ Still on login page after all checks`);
      return { success: false, reason: 'Still on login page - credentials may be incorrect or site requires captcha/2FA' };
    }

    // Default: assume success if no errors found and not on login page
    console.log(`   [VERIFY] ✅ No errors found, assuming success`);
    return { success: true, reason: 'No error indicators found, assuming login successful' };
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
