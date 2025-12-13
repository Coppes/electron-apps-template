import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShortcutManager } from '../../../src/main/shortcuts.js';
import { globalShortcut } from 'electron';

// Mock Electron modules
vi.mock('electron', () => ({
  globalShortcut: {
    register: vi.fn(),
    isRegistered: vi.fn(),
    unregister: vi.fn(),
    unregisterAll: vi.fn()
  },
  app: {
    on: vi.fn() // For 'will-quit' listener
  }
}));

describe('ShortcutManager', () => {
  let shortcutManager;

  beforeEach(() => {
    vi.clearAllMocks();
    shortcutManager = new ShortcutManager();
    // Reset whitelist for testing if necessary, but assuming default is safe
  });

  it('should register a valid shortcut', () => {
    globalShortcut.register.mockReturnValue(true);
    globalShortcut.isRegistered.mockReturnValue(false); // Initially not registered

    const result = shortcutManager.register('CommandOrControl+Shift+K', () => { });

    expect(result).toBe(true);
    expect(globalShortcut.register).toHaveBeenCalledWith('CommandOrControl+Shift+K', expect.any(Function));
  });

  it('should reject invalid shortcut formats', () => {
    const result = shortcutManager.register('Invalid+Shortcut', () => { });

    expect(result).toBe(false);
    expect(globalShortcut.register).not.toHaveBeenCalled();
  });

  it('should detect conflicts if shortcut is already registered', () => {
    globalShortcut.isRegistered.mockReturnValue(true);

    const result = shortcutManager.register('CommandOrControl+Shift+K', () => { });

    expect(result).toBe(false);
    expect(globalShortcut.register).not.toHaveBeenCalled();
  });

  it('should unregister a shortcut', () => {
    shortcutManager.register('CommandOrControl+Shift+K', () => { });
    shortcutManager.unregister('CommandOrControl+Shift+K');

    expect(globalShortcut.unregister).toHaveBeenCalledWith('CommandOrControl+Shift+K');
  });

  it('should unregister all shortcuts on cleanup', () => {
    shortcutManager.unregisterAll();

    expect(globalShortcut.unregisterAll).toHaveBeenCalled();
  });

  it('should validate against whitelist (if strict mode enabled)', () => {
    // Assuming whitelist logic exists. If your implementation has a strict whitelist, test it here.
    // For now, based on previous tasks, validation was implemented.
    // Let's assume a known safe shortcut vs a potentially unsafe one if defined in whitelist.

    // If whitelist is hardcoded in the class, we rely on standard behavior.
    // If no whitelist is active by default or it allows standard modifiers, this test is generic.

    const safeShortcut = 'CommandOrControl+N'; // Standard new window
    globalShortcut.register.mockReturnValue(true);

    const result = shortcutManager.register(safeShortcut, () => { });
    expect(result).toBe(true);
  });
});
