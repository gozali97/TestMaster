import { Page } from 'playwright';
import { PageInfo, ElementInfo } from './AutonomousTestingOrchestrator';

/**
 * Create Page Handler
 * 
 * Handles /create pages with smart auto-fill and submission
 */
export class CreatePageHandler {
  constructor(private page: Page) {}

  /**
   * Handle create page - fill and submit
   */
  async handleCreatePage(createPage: PageInfo): Promise<CreatePageResult> {
    console.log(`\n📝 Handling create page: ${createPage.url}`);

    try {
      // Navigate to create page
      await this.page.goto(createPage.url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      // Find all form fields
      const formFields = createPage.elements.filter(e => 
        e.type === 'input' || 
        e.type === 'textarea' || 
        e.type === 'select'
      );

      console.log(`   Found ${formFields.length} form fields to fill`);

      // Auto-fill each field
      let filledCount = 0;
      for (const field of formFields) {
        try {
          const value = await this.generateFieldValue(field);
          
          if (value) {
            await this.fillField(field, value);
            filledCount++;
            console.log(`   ✅ Filled: ${this.getFieldName(field)} = ${value.substring(0, 30)}`);
          }
        } catch (error: any) {
          console.log(`   ⚠️  Skipped: ${this.getFieldName(field)} - ${error.message}`);
        }
      }

      console.log(`   Filled ${filledCount}/${formFields.length} fields`);

      // Find and click submit button
      const submitButton = createPage.elements.find(e =>
        e.type === 'button' &&
        (e.text?.toLowerCase().includes('create') ||
         e.text?.toLowerCase().includes('submit') ||
         e.text?.toLowerCase().includes('save') ||
         e.text?.toLowerCase().includes('add'))
      );

      if (!submitButton) {
        console.log('   ⚠️  Submit button not found');
        return {
          success: false,
          message: 'Submit button not found'
        };
      }

      console.log(`   Clicking submit: ${submitButton.text}`);
      await this.clickButton(submitButton);

      // Wait for response
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await this.page.waitForTimeout(2000);

      // Verify success
      const verification = await this.verifyCreateSuccess();

      if (verification.success) {
        console.log(`   ✅ Create successful!`);
        console.log(`   Result URL: ${this.page.url()}`);

        return {
          success: true,
          createdItemUrl: this.page.url(),
          filledFields: filledCount,
          message: verification.reason || 'Create successful'
        };
      }

      console.log(`   ❌ Create failed: ${verification.reason}`);
      return {
        success: false,
        message: verification.reason || 'Create verification failed'
      };

    } catch (error: any) {
      console.error(`   ❌ Error handling create page:`, error.message);
      return {
        success: false,
        message: `Error: ${error.message}`
      };
    }
  }

  /**
   * Generate appropriate value for field based on its characteristics
   */
  private async generateFieldValue(field: ElementInfo): Promise<string> {
    const fieldName = this.getFieldName(field).toLowerCase();
    const type = (field.inputType || '').toLowerCase();

    // Skip certain field types
    if (type === 'hidden' || type === 'submit' || type === 'button') {
      return '';
    }

    // Email fields
    if (type === 'email' || fieldName.includes('email')) {
      return `test${Date.now()}@example.com`;
    }

    // Password fields (if any in create forms)
    if (type === 'password' || fieldName.includes('password')) {
      return 'TestPassword123!';
    }

    // URL fields
    if (type === 'url' || fieldName.includes('url') || fieldName.includes('website')) {
      return 'https://example.com';
    }

    // Tel/Phone fields
    if (type === 'tel' || fieldName.includes('phone') || fieldName.includes('tel')) {
      return '+1234567890';
    }

    // Number fields
    if (type === 'number' || fieldName.includes('age') || fieldName.includes('quantity')) {
      return '25';
    }

    // Date fields
    if (type === 'date' || fieldName.includes('date') || fieldName.includes('birth')) {
      return '2024-01-15';
    }

    // Time fields
    if (type === 'time' || fieldName.includes('time')) {
      return '14:30';
    }

    // Price/Amount fields
    if (fieldName.includes('price') || fieldName.includes('amount') || fieldName.includes('cost')) {
      return '99.99';
    }

    // Name fields
    if (fieldName.includes('firstname') || fieldName.includes('first_name') || fieldName.includes('fname')) {
      return 'John';
    }
    if (fieldName.includes('lastname') || fieldName.includes('last_name') || fieldName.includes('lname')) {
      return 'Doe';
    }
    if (fieldName.includes('name') && !fieldName.includes('user')) {
      return 'Test Item ' + Date.now();
    }

    // Title fields
    if (fieldName.includes('title') || fieldName.includes('heading')) {
      return 'Test Title ' + Date.now();
    }

    // Description/Content fields (textarea)
    if (field.type === 'textarea' || 
        fieldName.includes('description') || 
        fieldName.includes('content') || 
        fieldName.includes('message') ||
        fieldName.includes('body')) {
      return 'This is a test description created by automated testing. It contains sample content for testing purposes.';
    }

    // Address fields
    if (fieldName.includes('address')) {
      return '123 Test Street';
    }
    if (fieldName.includes('city')) {
      return 'Test City';
    }
    if (fieldName.includes('state') || fieldName.includes('province')) {
      return 'CA';
    }
    if (fieldName.includes('zip') || fieldName.includes('postal')) {
      return '12345';
    }
    if (fieldName.includes('country')) {
      return 'USA';
    }

    // Company/Organization
    if (fieldName.includes('company') || fieldName.includes('organization')) {
      return 'Test Company Inc';
    }

    // Category/Tag fields
    if (fieldName.includes('category') || fieldName.includes('tag')) {
      return 'general';
    }

    // Status/Priority fields
    if (fieldName.includes('status')) {
      return 'active';
    }
    if (fieldName.includes('priority')) {
      return 'normal';
    }

    // Default: generate generic text
    return 'Test ' + Date.now();
  }

  /**
   * Fill a form field
   */
  private async fillField(field: ElementInfo, value: string): Promise<void> {
    let filled = false;

    // Try multiple strategies
    const strategies = [
      { selector: field.id ? `#${field.id}` : null, name: 'ID' },
      { selector: field.name ? `[name="${field.name}"]` : null, name: 'name' },
      { selector: field.placeholder ? `[placeholder="${field.placeholder}"]` : null, name: 'placeholder' },
      { selector: field.locator, name: 'locator' }
    ];

    for (const strategy of strategies) {
      if (!strategy.selector || filled) continue;

      try {
        if (field.type === 'select') {
          await this.page.selectOption(strategy.selector, value, { timeout: 3000 });
        } else {
          await this.page.fill(strategy.selector, value, { timeout: 3000 });
        }
        filled = true;
        break;
      } catch (e) {}
    }

    if (!filled) {
      throw new Error(`Could not fill field`);
    }
  }

  /**
   * Click a button
   */
  private async clickButton(button: ElementInfo): Promise<void> {
    const strategies = [
      button.id ? `#${button.id}` : null,
      button.text ? `button:has-text("${button.text}")` : null,
      button.locator
    ];

    for (const selector of strategies) {
      if (!selector) continue;
      
      try {
        await this.page.click(selector, { timeout: 5000 });
        return;
      } catch (e) {}
    }

    throw new Error('Could not click button');
  }

  /**
   * Verify create operation was successful
   */
  private async verifyCreateSuccess(): Promise<{ success: boolean; reason?: string }> {
    const currentUrl = this.page.url();

    // Check 1: URL changed away from /create or /new
    if (!currentUrl.includes('/create') && !currentUrl.includes('/new')) {
      return { success: true, reason: 'Redirected away from create page' };
    }

    // Check 2: Look for success messages
    const successPatterns = ['success', 'created', 'added', 'saved'];
    for (const pattern of successPatterns) {
      try {
        const found = await this.page.locator(`text=${pattern}`).first().isVisible({ timeout: 2000 });
        if (found) {
          return { success: true, reason: `Success message found: ${pattern}` };
        }
      } catch (e) {}
    }

    // Check 3: Look for error messages
    const errorSelectors = ['.error', '.alert-danger', '[role="alert"]'];
    for (const selector of errorSelectors) {
      try {
        const hasError = await this.page.locator(selector).first().isVisible({ timeout: 1000 });
        if (hasError) {
          const errorText = await this.page.locator(selector).first().textContent();
          return { success: false, reason: `Error: ${errorText}` };
        }
      } catch (e) {}
    }

    // Check 4: Still on create page
    if (currentUrl.includes('/create') || currentUrl.includes('/new')) {
      return { success: false, reason: 'Still on create page, unclear status' };
    }

    // Default: assume success
    return { success: true, reason: 'No error indicators found' };
  }

  /**
   * Get field name for logging
   */
  private getFieldName(field: ElementInfo): string {
    return field.name || field.id || field.placeholder || field.locator || 'unknown';
  }
}

// Types
export interface CreatePageResult {
  success: boolean;
  createdItemUrl?: string;
  filledFields?: number;
  message: string;
}
