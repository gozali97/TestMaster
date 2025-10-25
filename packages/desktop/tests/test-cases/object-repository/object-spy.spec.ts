import { test, expect } from '../../fixtures/electron-test';

/**
 * Test Suite: Object Repository - Object Spy
 * Similar to Katalon's Object Spy feature
 */

test.describe('Object Spy', () => {
  test('TC037 - Should open Object Spy tool', async ({ mainWindow }) => {
    // Click on Object Spy menu
    await mainWindow.click('[data-testid="object-spy-button"]');

    // Verify Object Spy window/panel opens
    const objectSpyPanel = await mainWindow.locator('[data-testid="object-spy-panel"]');
    await expect(objectSpyPanel).toBeVisible();
  });

  test('TC038 - Should display element properties', async ({ mainWindow }) => {
    // Open Object Spy
    await mainWindow.click('[data-testid="object-spy-button"]');

    // Check if properties panel exists
    const propertiesPanel = await mainWindow.locator('[data-testid="element-properties"]');
    await expect(propertiesPanel).toBeVisible();
  });

  test('TC039 - Should show multiple locator strategies', async ({ mainWindow }) => {
    // Open Object Spy
    await mainWindow.click('[data-testid="object-spy-button"]');

    // Check if locator strategies section exists
    const locatorsSection = await mainWindow.locator('[data-testid="locator-strategies"]');
    await expect(locatorsSection).toBeVisible();

    // Verify common locator types are shown
    const xpathLocator = await mainWindow.locator('[data-locator-type="xpath"]');
    await expect(xpathLocator).toBeVisible();

    const cssLocator = await mainWindow.locator('[data-locator-type="css"]');
    await expect(cssLocator).toBeVisible();
  });

  test('TC040 - Should be able to save object to repository', async ({ mainWindow }) => {
    // Open Object Spy
    await mainWindow.click('[data-testid="object-spy-button"]');

    // Click save to repository button
    const saveButton = await mainWindow.locator('[data-testid="save-to-repository"]');
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();
  });

  test('TC041 - Should validate locator uniqueness', async ({ mainWindow }) => {
    // Open Object Spy
    await mainWindow.click('[data-testid="object-spy-button"]');

    // Check if validation indicator exists
    const validationIndicator = await mainWindow.locator('[data-testid="locator-validation"]');
    await expect(validationIndicator).toBeVisible();
  });
});
