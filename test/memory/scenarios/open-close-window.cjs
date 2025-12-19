/**
 * Hybrid Memory Scenario: Open and Close Window
 */
module.exports = {
  name: () => 'OpenCloseWindow',
  url: () => `http://localhost:5173?t=${Date.now()}`,

  action: async (page) => {
    // Note: Viewport is set in runner or default, but explicit setting is fine
    await page.setViewportSize({ width: 1280, height: 720 });

    // Dismiss any modals (What's New, Tour, etc.)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Check if Settings button exists
    const settingsBtn = page.locator('button[data-tour="settings-link"]');
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      await page.waitForSelector('.border-b-primary', { state: 'visible', timeout: 5000 });
    } else {
      throw new Error('Settings button not found');
    }

    // Wait a bit for potential leaks to manifest or stabilizers
    await page.waitForTimeout(500);
  },

  back: async (page) => {
    // Find active tab and close it
    const activeTab = page.locator('.border-b-primary');
    if (await activeTab.isVisible()) {
      const closeBtn = activeTab.locator('button');
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    }
    await page.waitForTimeout(500);
  }
};
