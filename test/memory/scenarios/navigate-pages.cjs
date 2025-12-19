/**
 * Hybrid Memory Scenario: Navigate Pages
 */
module.exports = {
  name: () => 'NavigatePages',
  url: () => `http://localhost:5173?t=${Date.now()}`,

  action: async (page) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    // Dismiss any modals
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const btn = page.locator('button[data-testid="nav-data-management"]');
    await btn.waitFor({ state: 'visible', timeout: 30000 });
    await btn.click();

    // Wait for page transition
    await page.waitForTimeout(1000);
  },

  back: async (page) => {
    const home = page.locator('button[data-testid="nav-home"]');
    await home.waitFor({ state: 'visible', timeout: 10000 });
    await home.click();

    // Wait for page transition
    await page.waitForTimeout(1000);
  }
};
