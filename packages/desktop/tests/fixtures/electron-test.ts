import { test as base, _electron as electron, ElectronApplication, Page } from '@playwright/test';
import * as path from 'path';

/**
 * Electron Test Fixture for TestMaster Desktop App
 * Similar to Katalon's Desktop application testing
 */

interface ElectronTestFixtures {
  electronApp: ElectronApplication;
  mainWindow: Page;
}

export const test = base.extend<ElectronTestFixtures>({
  // Launch Electron application
  electronApp: async ({}, use) => {
    // Path to main process file
    const electronPath = path.join(__dirname, '../../dist/main/index.js');
    
    // Launch Electron app
    const app = await electron.launch({
      args: [electronPath],
      // Enable debugging
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    });

    await use(app);

    // Cleanup: close the app
    await app.close();
  },

  // Get main window
  mainWindow: async ({ electronApp }, use) => {
    const window = await electronApp.firstWindow();
    await use(window);
  },
});

export { expect } from '@playwright/test';
