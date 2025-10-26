import { PageInfo, ElementInfo } from './AutonomousTestingOrchestrator';

/**
 * Smart Authentication Detector
 * 
 * Intelligently detects login and registration pages with high accuracy
 */
export class SmartAuthDetector {
  /**
   * Detect login page and form fields
   */
  detectLoginPage(pages: PageInfo[]): LoginDetectionResult {
    console.log('🔍 Detecting login page...');

    // Find login pages by URL and title
    const loginPages = pages.filter(p => {
      const url = p.url.toLowerCase();
      const title = p.title.toLowerCase();
      
      return url.includes('/login') ||
             url.includes('/signin') ||
             url.includes('/sign-in') ||
             title.includes('login') ||
             title.includes('sign in');
    });

    if (loginPages.length === 0) {
      console.log('⚠️  No login page found');
      return { hasLogin: false, loginMethod: 'none' };
    }

    const loginPage = loginPages[0];
    console.log(`✅ Found login page: ${loginPage.url}`);

    // Find input fields
    const inputs = loginPage.elements.filter(e => e.type === 'input');
    console.log(`   Found ${inputs.length} input fields`);

    // Identify username/email field
    const usernameField = inputs.find(i => {
      const name = (i.name || '').toLowerCase();
      const id = (i.id || '').toLowerCase();
      const placeholder = (i.placeholder || '').toLowerCase();
      const type = (i.inputType || '').toLowerCase();
      
      return type === 'email' ||
             name.includes('email') ||
             name.includes('username') ||
             name.includes('user') ||
             id.includes('email') ||
             id.includes('username') ||
             id.includes('user') ||
             placeholder.includes('email') ||
             placeholder.includes('username') ||
             placeholder.includes('user');
    });

    // Identify password field
    const passwordField = inputs.find(i => {
      const name = (i.name || '').toLowerCase();
      const id = (i.id || '').toLowerCase();
      const placeholder = (i.placeholder || '').toLowerCase();
      const type = (i.inputType || '').toLowerCase();
      
      return type === 'password' ||
             name.includes('password') ||
             name.includes('pass') ||
             id.includes('password') ||
             id.includes('pass') ||
             placeholder.includes('password') ||
             placeholder.includes('pass');
    });

    // Find submit button
    const submitButton = loginPage.elements.find(e => {
      const text = (e.text || '').toLowerCase();
      const isButton = e.type === 'button';
      
      return isButton && (
        text.includes('login') ||
        text.includes('sign in') ||
        text.includes('log in') ||
        text.includes('submit') ||
        text === 'ok'
      );
    });

    if (usernameField && passwordField) {
      console.log('✅ Login form detected:');
      console.log(`   - Username field: ${usernameField.name || usernameField.id || usernameField.placeholder}`);
      console.log(`   - Password field: ${passwordField.name || passwordField.id || passwordField.placeholder}`);
      console.log(`   - Submit button: ${submitButton?.text || 'not found (will press Enter)'}`);

      return {
        hasLogin: true,
        loginPage,
        loginForm: {
          usernameField,
          passwordField,
          submitButton: submitButton  // Can be undefined, will press Enter instead
        },
        loginMethod: 'form'
      };
    }

    console.log('⚠️  Login page found but form fields not detected');
    return { hasLogin: false, loginMethod: 'none' };
  }

  /**
   * Detect registration page and form fields
   */
  detectRegisterPage(pages: PageInfo[]): RegisterDetectionResult {
    console.log('🔍 Detecting registration page...');

    // Find register pages
    const registerPages = pages.filter(p => {
      const url = p.url.toLowerCase();
      const title = p.title.toLowerCase();
      
      return url.includes('/register') ||
             url.includes('/signup') ||
             url.includes('/sign-up') ||
             url.includes('/join') ||
             title.includes('register') ||
             title.includes('sign up') ||
             title.includes('signup') ||
             title.includes('join');
    });

    if (registerPages.length === 0) {
      console.log('⚠️  No registration page found');
      return { hasRegister: false };
    }

    const registerPage = registerPages[0];
    console.log(`✅ Found registration page: ${registerPage.url}`);

    // Find all form fields
    const formFields = registerPage.elements.filter(e => 
      e.type === 'input' || 
      e.type === 'textarea' || 
      e.type === 'select'
    );

    console.log(`   Found ${formFields.length} form fields`);

    // Find submit button
    const submitButton = registerPage.elements.find(e => {
      const text = (e.text || '').toLowerCase();
      const isButton = e.type === 'button';
      
      return isButton && (
        text.includes('register') ||
        text.includes('sign up') ||
        text.includes('signup') ||
        text.includes('join') ||
        text.includes('create account') ||
        text.includes('submit')
      );
    });

    if (formFields.length > 0) {
      return {
        hasRegister: true,
        registerPage,
        registerForm: {
          fields: formFields,
          submitButton: submitButton!
        }
      };
    }

    return { hasRegister: false };
  }

  /**
   * Detect which authentication strategy to use
   */
  determineAuthStrategy(
    loginDetection: LoginDetectionResult,
    registerDetection: RegisterDetectionResult,
    hasCredentials: boolean
  ): AuthStrategy {
    console.log('\n🧠 Determining authentication strategy...');
    console.log(`   Has login page: ${loginDetection.hasLogin}`);
    console.log(`   Has register page: ${registerDetection.hasRegister}`);
    console.log(`   Has credentials: ${hasCredentials}`);

    // Strategy 1: Login with provided credentials
    if (loginDetection.hasLogin && hasCredentials) {
      console.log('✅ Strategy: LOGIN with provided credentials');
      return {
        strategy: 'login',
        reason: 'Login page found and credentials provided'
      };
    }

    // Strategy 2: Register if no credentials but register page exists
    if (registerDetection.hasRegister && !hasCredentials) {
      console.log('✅ Strategy: REGISTER new account');
      return {
        strategy: 'register',
        reason: 'No credentials provided, will register new account'
      };
    }

    // Strategy 3: Register then login
    if (loginDetection.hasLogin && registerDetection.hasRegister && !hasCredentials) {
      console.log('✅ Strategy: REGISTER then LOGIN');
      return {
        strategy: 'register-then-login',
        reason: 'Will register and then login with created account'
      };
    }

    // Strategy 4: No authentication
    console.log('⚠️  Strategy: NONE (no auth detected or not possible)');
    return {
      strategy: 'none',
      reason: 'No authentication possible'
    };
  }
}

// Types
export interface LoginDetectionResult {
  hasLogin: boolean;
  loginPage?: PageInfo;
  loginForm?: {
    usernameField: ElementInfo;
    passwordField: ElementInfo;
    submitButton?: ElementInfo;  // Optional: can press Enter if not found
  };
  loginMethod: 'form' | 'oauth' | 'none';
}

export interface RegisterDetectionResult {
  hasRegister: boolean;
  registerPage?: PageInfo;
  registerForm?: {
    fields: ElementInfo[];
    submitButton: ElementInfo;
  };
}

export interface AuthStrategy {
  strategy: 'login' | 'register' | 'register-then-login' | 'none';
  reason: string;
}
