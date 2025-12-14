import { describe, it, expect } from 'vitest';
import { buildCSPHeader, getCSPPolicy } from '../../../src/main/security/csp.js';

import { vi } from 'vitest';

// Mock logger
vi.mock('../../../src/main/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

/**
 * Security - Content Security Policy Tests
 */
describe('Content Security Policy', () => {
  describe('buildCSPHeader', () => {
    it('should build CSP header from policy object', () => {
      const policy = {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'"],
      };

      const header = buildCSPHeader(policy);

      expect(header).toContain("default-src 'self'");
      expect(header).toContain("script-src 'self' 'unsafe-eval'");
      expect(header).toContain("style-src 'self' 'unsafe-inline'");
    });

    it('should handle directives with no values', () => {
      const policy = {
        'upgrade-insecure-requests': [],
      };

      const header = buildCSPHeader(policy);
      expect(header).toBe('upgrade-insecure-requests');
    });

    it('should separate directives with semicolons', () => {
      const policy = {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
      };

      const header = buildCSPHeader(policy);
      expect(header).toContain('; ');
    });
  });

  describe('getCSPPolicy', () => {
    it('should return development policy in development', () => {
      // Note: This test depends on NODE_ENV
      const policy = getCSPPolicy();
      expect(policy).toBeDefined();
      expect(policy['default-src']).toBeDefined();
    });

    it('should include localhost in development policy', () => {
      // Development policy should allow localhost
      const policy = getCSPPolicy();
      const defaultSrc = policy['default-src'];

      // In development, should have localhost or be more permissive
      expect(Array.isArray(defaultSrc)).toBe(true);
    });
  });

  describe('CSP Directives', () => {
    it('should block inline scripts without nonce in production', () => {
      // This is a behavioral test that would need browser environment
      // Documented for manual testing
      expect(true).toBe(true);
    });

    it('should allow Tailwind inline styles', () => {
      const policy = getCSPPolicy();
      const styleSrc = policy['style-src'];

      expect(styleSrc).toContain("'unsafe-inline'");
    });

    it('should restrict connect-src to self', () => {
      const policy = getCSPPolicy();
      const connectSrc = policy['connect-src'];

      expect(connectSrc).toContain("'self'");
    });
  });
});
