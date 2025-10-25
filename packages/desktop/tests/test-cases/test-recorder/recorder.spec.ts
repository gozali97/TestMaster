import { test, expect } from '../../fixtures/electron-test';

/**
 * Test Suite: Test Recorder Functionality
 * Similar to Katalon's Record & Playback feature tests
 */

test.describe('Test Recorder', () => {
  test('TC031 - Should display record button', async ({ mainWindow }) => {
    // Navigate to recorder view
    await mainWindow.click('[data-testid="recorder-tab"]');

    // Check if record button exists
    const recordButton = await mainWindow.locator('[data-testid="record-button"]');
    await expect(recordButton).toBeVisible();
  });

  test('TC032 - Should start recording session', async ({ mainWindow }) => {
    // Navigate to recorder view
    await mainWindow.click('[data-testid="recorder-tab"]');

    // Click record button
    await mainWindow.click('[data-testid="record-button"]');

    // Verify recording indicator is visible
    const recordingIndicator = await mainWindow.locator('[data-testid="recording-indicator"]');
    await expect(recordingIndicator).toBeVisible();
  });

  test('TC033 - Should stop recording session', async ({ mainWindow }) => {
    // Start recording
    await mainWindow.click('[data-testid="recorder-tab"]');
    await mainWindow.click('[data-testid="record-button"]');

    // Wait for recording to start
    await mainWindow.waitForTimeout(1000);

    // Stop recording
    await mainWindow.click('[data-testid="stop-button"]');

    // Verify recording stopped
    const recordingIndicator = await mainWindow.locator('[data-testid="recording-indicator"]');
    await expect(recordingIndicator).not.toBeVisible();
  });

  test('TC034 - Should select browser for recording', async ({ mainWindow }) => {
    await mainWindow.click('[data-testid="recorder-tab"]');

    // Open browser selector
    await mainWindow.click('[data-testid="browser-selector"]');

    // Check if browser options are available
    const chromiumOption = await mainWindow.locator('[data-value="chromium"]');
    await expect(chromiumOption).toBeVisible();

    const firefoxOption = await mainWindow.locator('[data-value="firefox"]');
    await expect(firefoxOption).toBeVisible();
  });

  test('TC035 - Should display recorded steps', async ({ mainWindow }) => {
    // Navigate to recorder
    await mainWindow.click('[data-testid="recorder-tab"]');

    // Check if steps list container exists
    const stepsList = await mainWindow.locator('[data-testid="recorded-steps-list"]');
    await expect(stepsList).toBeVisible();
  });

  test('TC036 - Should be able to pause recording', async ({ mainWindow }) => {
    // Start recording
    await mainWindow.click('[data-testid="recorder-tab"]');
    await mainWindow.click('[data-testid="record-button"]');

    // Pause recording
    await mainWindow.click('[data-testid="pause-button"]');

    // Verify pause state
    const pauseIndicator = await mainWindow.locator('[data-testid="pause-indicator"]');
    await expect(pauseIndicator).toBeVisible();
  });
});
