import { test, expect } from '../../fixtures/electron-test';

/**
 * Test Suite: Desktop App - Window Management
 * Similar to Katalon's Desktop application window tests
 */

test.describe('Window Management', () => {
  test('TC026 - Should launch Electron app successfully', async ({ electronApp }) => {
    expect(electronApp).toBeDefined();
    expect(electronApp.isConnected()).toBe(true);
  });

  test('TC027 - Should have correct window title', async ({ mainWindow }) => {
    const title = await mainWindow.title();
    expect(title).toContain('TestMaster');
  });

  test('TC028 - Should have correct window size', async ({ mainWindow }) => {
    const size = await mainWindow.evaluate(() => {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    });

    // Default window size from Electron config
    expect(size.width).toBeGreaterThanOrEqual(1024);
    expect(size.height).toBeGreaterThanOrEqual(768);
  });

  test('TC029 - Should be able to minimize and restore window', async ({ electronApp, mainWindow }) => {
    // Minimize window
    await mainWindow.evaluate(() => {
      // @ts-ignore
      window.electronAPI?.minimizeWindow();
    });

    // Wait a bit
    await mainWindow.waitForTimeout(500);

    // Restore window
    await mainWindow.evaluate(() => {
      // @ts-ignore
      window.electronAPI?.restoreWindow();
    });

    // Verify window is visible
    expect(await mainWindow.isVisible('body')).toBe(true);
  });

  test('TC030 - Should display main menu bar', async ({ mainWindow }) => {
    // Check if menu elements are present
    const hasMenu = await mainWindow.evaluate(() => {
      return document.querySelector('[role="menubar"]') !== null;
    });

    expect(hasMenu).toBe(true);
  });
});
