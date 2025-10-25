import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for TestMaster API E2E Tests
 * Similar to Katalon Studio's execution profiles
 */
export default defineConfig({
  // Test directory
  testDir: './tests',
  
  // Maximum time one test can run
  timeout: 30 * 1000,
  
  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration (similar to Katalon's reporting)
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for API tests
    baseURL: process.env.API_BASE_URL || 'http://localhost:3001',
    
    // Collect trace on failure (similar to Katalon's screenshot on failure)
    trace: 'on-first-retry',
    
    // Screenshot settings
    screenshot: 'only-on-failure',
    
    // Video recording
    video: 'retain-on-failure',
    
    // API testing specific
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
  },

  // Configure projects for different browsers (Katalon-style execution profiles)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Web server configuration (start API server before tests)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
