import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initializeCrashReporting, reportError, sanitizeEvent } from '../../../src/main/crash-reporter.js';

vi.mock('@sentry/electron/main', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
}));

import * as Sentry from '@sentry/electron/main';

describe('Crash Reporter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SENTRY_DSN = 'https://example@sentry.io/123';
  });

  afterEach(() => {
    delete process.env.SENTRY_DSN;
  });

  it('should initialize Sentry when enabled in config', () => {
    const config = { crashReporting: { enabled: true, dsn: 'test-dsn' } };
    initializeCrashReporting(config);
    expect(Sentry.init).toHaveBeenCalledWith(expect.objectContaining({
      dsn: 'test-dsn',
    }));
  });

  it('should NOT initialize Sentry when disabled in config', () => {
    const config = { crashReporting: { enabled: false } };
    initializeCrashReporting(config);
    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it('should sanitize PII from file paths', () => {
    const event = {
      message: 'Error in /Users/yuricoppe/project/file.js',
      breadcrumbs: [
        { message: 'Loaded /Users/yuricoppe/docs/secret.txt' }
      ]
    };

    // Assuming sanitizeEvent is exposed or used in beforeSend
    // If not directly exposed, we might need to test the beforeSend callback
    // But since reportError uses it or Sentry config uses it... 
    // Let's assume we can test logic directly if exported, or via Sentry mock calls if not.

    const sanitized = sanitizeEvent(event);
    expect(sanitized.message).not.toContain('yuricoppe');
    expect(sanitized.message).toContain('[user]');
    expect(sanitized.breadcrumbs[0].message).toContain('[user]');
  });

  it('should redact sensitive environment variables', () => {
    const event = {
      extra: {
        API_KEY: '12345-secret',
        PUBLIC_ID: 'visible'
      }
    };
    const sanitized = sanitizeEvent(event);
    expect(sanitized.extra.API_KEY).toBe('[REDACTED]');
    expect(sanitized.extra.PUBLIC_ID).toBe('visible');
  });
});
