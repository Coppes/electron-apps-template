import { _electron as electron, test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { waitForMainWindow } from './helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Window Management', () => {
  let app;
  let firstWindow;

  test.beforeEach(async () => {
    app = await electron.launch({
      args: [path.join(__dirname, '../../out/main/index.js')],
      env: {
        NODE_ENV: 'test',
        E2E_TEST_BUILD: '1',
        ...process.env
      }
    });

    firstWindow = await waitForMainWindow(app);
  });

  test.afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  test('should minimize and restore window', async () => {
    const win = await app.browserWindow(firstWindow);
    // Check initial state
    const isMinimizedInitial = await win.evaluate(w => w.isMinimized());
    expect(isMinimizedInitial).toBe(false);

    // Minimize via Electron API (simulating native behavior or titlebar action)
    await win.evaluate(w => w.minimize());

    // Check minimized state
    await expect.poll(async () => {
      return await win.evaluate(w => w.isMinimized());
    }).toBe(true);

    // Restore
    await win.evaluate(w => w.restore());
    await expect.poll(async () => {
      return await win.evaluate(w => w.isMinimized());
    }).toBe(false);
  });

  test('should maximize and unmaximize window', async () => {
    const win = await app.browserWindow(firstWindow);
    // Determine if we can maximize (some environments might not support it headless or certain OS configs)
    // We assume it works in test environment

    // Maximize
    await win.evaluate(w => w.maximize());
    const isMaximized = await win.evaluate(w => w.isMaximized());
    expect(isMaximized).toBe(true);

    // Unmaximize
    await win.evaluate(w => w.unmaximize());
    const isMaximizedFinal = await win.evaluate(w => w.isMaximized());
    expect(isMaximizedFinal).toBe(false);
  });
});
