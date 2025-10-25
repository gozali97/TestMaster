import { test as base } from '@playwright/test';

/**
 * Base Test Fixture for TestMaster API Tests
 * Similar to Katalon's Custom Keywords and Test Listeners
 */

interface TestFixtures {
  apiContext: {
    baseURL: string;
    headers: Record<string, string>;
  };
  authToken: string;
}

export const test = base.extend<TestFixtures>({
  // API context fixture
  apiContext: async ({}, use) => {
    const context = {
      baseURL: process.env.API_BASE_URL || 'http://localhost:3001',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };
    await use(context);
  },

  // Auth token fixture (for authenticated tests)
  authToken: async ({ request, apiContext }, use) => {
    // TODO: Implement actual login logic when API is ready
    // For now, return empty token
    const token = '';
    await use(token);
  },
});

export { expect } from '@playwright/test';
