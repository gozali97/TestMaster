import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for TestMaster Desktop E2E Tests
 * Similar to Katalon Studio's execution profiles for desktop testing
 */
export default defineConfig({
  // Test directory
  testDir: './tests',
  
  // Maximum time one test can run
  timeout: 60 * 1000,
  
  // Test execution settings
  fullyParallel: false, // Desktop tests run sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1, // Single worker for Electron tests
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],
  
  // Shared settings
  use: {
    // Collect trace on failure
    trace: 'on-first-retry',
    
    // Screenshot settings (Katalon-style screenshot on failure)
    screenshot: 'only-on-failure',
    
    // Video recording
    video: 'retain-on-failure',
    
    // Action timeout
    actionTimeout: 10 * 1000,
  },

  // Configure projects for desktop app testing
  projects: [
    {
      name: 'electron',
      use: {
        // Electron-specific configuration
        viewport: { width: 1400, height: 900 },
      },
    },
  ],
});
