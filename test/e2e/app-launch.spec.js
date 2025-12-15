import { _electron as electron, test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { waitForMainWindow } from './helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Application Launch', () => {
  let app;
  let firstWindow;

  test.beforeEach(async () => {
    // Launch the app
    // We point to the root directory, allowing Electron to interpret package.json "main"
    app = await electron.launch({
      args: [path.join(__dirname, '../../out/main/index.js')],
      env: {
        NODE_ENV: 'test',
        E2E_TEST_BUILD: '1',
        ...process.env
      }
    });

    // Wait for the main window using helper
    firstWindow = await waitForMainWindow(app);
  });

  test.afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  test('should launch main window', async () => {
    // Check if window is visible
    const win = await app.browserWindow(firstWindow);
    await expect.poll(async () => {
      return await win.evaluate(browserWindow => browserWindow.isVisible());
    }).toBe(true);

    // Check title (might be default title if not set yet, or defined in HTML)
    const title = await firstWindow.title();
    console.log('Window title:', title);
    expect(title).toBeDefined();
  });

  test('should expose electronAPI in renderer', async () => {
    // Verify preload script execution
    const isDefined = await firstWindow.evaluate(() => typeof window.electronAPI !== 'undefined');
    expect(isDefined).toBe(true);
  });
});
