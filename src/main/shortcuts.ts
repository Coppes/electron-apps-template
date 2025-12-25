import { globalShortcut } from 'electron';
import { logger } from './logger.ts';

/**
 * Global Shortcuts Manager
 * Manages application-wide keyboard shortcuts
 */
export class ShortcutManager {
  private shortcuts: Map<string, { handler: Function; description: string }>;
  private whitelist: string[];
  public reservedShortcuts: string[];

  constructor() {
    this.shortcuts = new Map();

    // Whitelist of allowed shortcuts for security
    this.whitelist = [
      'CommandOrControl+Shift+K',
      'CommandOrControl+Shift+P',
      'CommandOrControl+Shift+I',
      'CommandOrControl+Alt+N',
      'CommandOrControl+Alt+O',
      'F1',
      'F2',
      'F3',
      'F4',
      'F5',
      'F6',
      'F7',
      'F8',
      'F9',
      'F10',
      'F11',
      'F12',
    ];

    // Reserved shortcuts that should not be allowed
    this.reservedShortcuts = [
      'CommandOrControl+Q',
      'CommandOrControl+W',
      'Alt+F4',
      'Command+Q',
    ];
  }

  /**
   * Register a global shortcut
   * @param {string} accelerator - Keyboard accelerator (e.g., "CommandOrControl+Shift+K")
   * @param {Function} handler - Callback function when shortcut is triggered
   * @param {string} [description] - Shortcut description
   * @returns {boolean} Success status
   */
  /**
   * Register a global shortcut
   * @param {string} accelerator - Keyboard accelerator (e.g., "CommandOrControl+Shift+K")
   * @param {Function} handler - Callback function when shortcut is triggered
   * @param {string} [description] - Shortcut description
   * @returns {boolean} Success status
   */
  register(accelerator: string, handler: Function, description = '') {
    try {
      // Validate accelerator
      if (!this.isValidAccelerator(accelerator)) {
        logger.warn('Invalid accelerator format', { accelerator });
        return false;
      }

      // Check if reserved
      if (this.isReservedShortcut(accelerator)) {
        logger.warn('Cannot register reserved shortcut', { accelerator });
        return false;
      }

      // Check if already registered
      if (this.shortcuts.has(accelerator)) {
        logger.warn('Shortcut already registered', { accelerator });
        return false;
      }

      // Attempt to register with Electron
      const registered = globalShortcut.register(accelerator, () => {
        logger.debug('Global shortcut triggered', { accelerator, description });
        try {
          handler();
        } catch (error) {
          logger.error('Error in shortcut handler', { accelerator, error });
        }
      });

      if (!registered) {
        logger.warn('Failed to register shortcut (may be in use)', { accelerator });
        return false;
      }

      // Store in our registry
      this.shortcuts.set(accelerator, { handler, description });
      logger.info('Global shortcut registered', { accelerator, description });
      return true;
    } catch (error) {
      logger.error('Failed to register shortcut', { accelerator, error });
      return false;
    }
  }

  /**
   * Unregister a global shortcut
   * @param {string} accelerator - Keyboard accelerator
   * @returns {boolean} Success status
   */
  unregister(accelerator: string) {
    try {
      if (!this.shortcuts.has(accelerator)) {
        logger.warn('Shortcut not registered', { accelerator });
        return false;
      }

      globalShortcut.unregister(accelerator);
      this.shortcuts.delete(accelerator);
      logger.info('Global shortcut unregistered', { accelerator });
      return true;
    } catch (error) {
      logger.error('Failed to unregister shortcut', { accelerator, error });
      return false;
    }
  }

  /**
   * Unregister all shortcuts
   * @returns {boolean} Success status
   */
  unregisterAll() {
    try {
      globalShortcut.unregisterAll();
      this.shortcuts.clear();
      logger.info('All global shortcuts unregistered');
      return true;
    } catch (error) {
      logger.error('Failed to unregister all shortcuts', error);
      return false;
    }
  }

  /**
   * Check if a shortcut is registered
   * @param {string} accelerator - Keyboard accelerator
   * @returns {boolean}
   */
  isRegistered(accelerator: string) {
    return this.shortcuts.has(accelerator) && globalShortcut.isRegistered(accelerator);
  }

  /**
   * List all active shortcuts
   * @returns {import('../common/types.ts').ShortcutInfo[]}
   */
  listActive() {
    const shortcuts = [];
    for (const [accelerator, data] of this.shortcuts.entries()) {
      shortcuts.push({
        accelerator,
        description: data.description,
        registered: globalShortcut.isRegistered(accelerator),
      });
    }
    return shortcuts;
  }

  /**
   * Validate accelerator format
   * @param {string} accelerator - Accelerator string
   * @returns {boolean}
   */
  isValidAccelerator(accelerator: string) {
    if (!accelerator || typeof accelerator !== 'string') {
      return false;
    }

    // Basic format validation
    const validKeys = /^(CommandOrControl|CmdOrCtrl|Command|Cmd|Control|Ctrl|Alt|Option|AltGr|Shift|Super|Meta)\+/i;
    const hasFunctionKey = /^F[0-9]{1,2}$/i.test(accelerator);

    return validKeys.test(accelerator) || hasFunctionKey;
  }

  /**
   * Check if shortcut is in whitelist
   * @param {string} accelerator - Accelerator string
   * @returns {boolean}
   */
  isWhitelisted(accelerator: string) {
    return this.whitelist.includes(accelerator);
  }

  /**
   * Check if shortcut is reserved
   * @param {string} accelerator - Accelerator string
   * @returns {boolean}
   */
  isReservedShortcut(accelerator: string) {
    return this.reservedShortcuts.includes(accelerator);
  }

  /**
   * Add shortcut to whitelist
   * @param {string} accelerator - Accelerator to whitelist
   */
  addToWhitelist(accelerator: string) {
    if (!this.whitelist.includes(accelerator)) {
      this.whitelist.push(accelerator);
      logger.debug('Shortcut added to whitelist', { accelerator });
    }
  }

  /**
   * Cleanup all shortcuts (called on app quit)
   */
  cleanup() {
    this.unregisterAll();
    logger.debug('Shortcut manager cleaned up');
  }
}

// Export singleton instance
export const shortcutManager = new ShortcutManager();
