import { test, expect, _electron as electron } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

test.describe('Logging System', () => {
  let app;
  let logPath;

  test.beforeEach(async () => {
    // Start app
    app = await electron.launch({
      args: ['.'],
      env: { ...process.env, NODE_ENV: 'test' }
    });

    // Determine log path (mock/test path or actual userdata)
    const userDataPath = await app.evaluate(({ app }) => {
      return app.getPath('userData');
    });
    logPath = path.join(userDataPath, 'logs', 'main.log');

    // Clear log if exists
    if (fs.existsSync(logPath)) {
      fs.unlinkSync(logPath);
    }
  });

  test.afterEach(async () => {
    if (app) await app.close();
  });

  test('renderer can write to main log file', async () => {
    const page = await app.firstWindow();
    await page.waitForLoadState('domcontentloaded');

    const testMessage = `Test Log Entry ${Date.now()}`;

    // Execute log command in renderer
    await page.evaluate(async (msg) => {
      await window.electronAPI.log.info(msg);
    }, testMessage);

    // Wait for file write (fs operation)
    await page.waitForTimeout(1000);

    // Verify file content
    expect(fs.existsSync(logPath)).toBe(true);
    const logContent = fs.readFileSync(logPath, 'utf8');
    expect(logContent).toContain(testMessage);
    expect(logContent).toContain('[Renderer:');
  });
});
