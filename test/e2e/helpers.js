import { expect } from '@playwright/test';

export async function waitForMainWindow(app) {
  // Poll for the main window
  // We need to be careful not to pick up transient windows or splash screen

  const startTime = Date.now();
  while (Date.now() - startTime < 15000) {
    const windows = await app.windows();

    for (const page of windows) {
      try {
        if (page.isClosed()) continue;

        const url = page.url();
        // Check for main window indicators
        // In dev: localhost:5173
        // In build: .../index.html
        // Explicitly exclude splash

        if (url && !url.includes('splash.html') && (url.includes('localhost') || url.includes('index.html'))) {
          // Found potential main window.
          // Wait for it to be stable?
          await page.waitForLoadState('domcontentloaded');

          // Verify it's still open
          if (!page.isClosed()) {
            return page;
          }
        }
      } catch (e) {
        // Ignore errors accessing properties of closing windows
        console.log('Error checking window:', e.message);
      }
    }

    await new Promise(r => setTimeout(r, 500));
  }

  throw new Error('Main window not found within timeout');
}
