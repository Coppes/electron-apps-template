import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  timeout: 30000,
  retries: 1,
  workers: 1, // Electron tests must run sequentially usually
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
  },
});
