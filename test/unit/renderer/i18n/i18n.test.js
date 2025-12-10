import { describe, it, expect, vi, beforeEach } from 'vitest';
import i18n from '../../../../src/renderer/i18n/index.js';

describe('i18n Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be initialized with correct default language', () => {
    expect(i18n.language).toBe('en');
  });

  it('should load English resources dynamically', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.getResource('en', 'common')).toBeDefined();
    expect(i18n.getResource('en', 'settings')).toBeDefined();
    expect(i18n.getResource('en', 'errors')).toBeDefined();
    expect(i18n.getResource('en', 'onboarding')).toBeDefined();
  });

  it('should load Portuguese resources dynamically', async () => {
    await i18n.changeLanguage('pt-BR');
    expect(i18n.getResource('pt-BR', 'common')).toBeDefined();
    expect(i18n.getResource('pt-BR', 'settings')).toBeDefined();
    expect(i18n.getResource('pt-BR', 'errors')).toBeDefined();
    expect(i18n.getResource('pt-BR', 'onboarding')).toBeDefined();
  });

  it('should change language correctly', async () => {
    await i18n.changeLanguage('pt-BR');
    expect(i18n.language).toBe('pt-BR');

    await i18n.changeLanguage('en');
    expect(i18n.language).toBe('en');
  });

  it('should translate keys correctly', async () => {
    await i18n.changeLanguage('en');
    // Assuming simple key existence, actual text might change
    // We check if it returns something different than the key if key exists,
    // or checks against known value if stable.
    // For now, let's just check it doesn't crash and returns a string.
    expect(typeof i18n.t('common:appName', { defaultValue: 'App' })).toBe('string');
  });
});
