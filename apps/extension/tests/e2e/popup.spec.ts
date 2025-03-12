import { test } from '../fixtures';
import { expect } from '@playwright/test';

test.describe('Extension Popup', () => {
  test('should show screenshot button in popup', async ({
    page,
    extensionId,
  }) => {
    // Navigate directly to the popup using the extension ID
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    // Wait for the popup to load
    await page.waitForLoadState('domcontentloaded');

    // Look for the screenshot button
    const screenshotButton = page.locator('button, [role="button"]').filter({
      hasText: /screenshot|capture|snap/i,
    });

    // Verify the button exists and is visible
    await expect(screenshotButton).toBeVisible({
      timeout: 5000,
    });
  });
});
