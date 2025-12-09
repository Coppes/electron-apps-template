/**
 * Unit tests for common/constants.js
 */
import { describe, it, expect } from 'vitest';
import {
  IPC_CHANNELS,
  WINDOW_TYPES,
  DEFAULT_WINDOW_CONFIG,
  LOG_LEVELS,
  ENV,
  TEST_MODE,
} from '../../../src/common/constants.js';

describe('Constants Module', () => {
  describe('IPC_CHANNELS', () => {
    it('should define all required window management channels', () => {
      expect(IPC_CHANNELS.WINDOW_CREATE).toBe('window:create');
      expect(IPC_CHANNELS.WINDOW_CLOSE).toBe('window:close');
      expect(IPC_CHANNELS.WINDOW_MINIMIZE).toBe('window:minimize');
      expect(IPC_CHANNELS.WINDOW_MAXIMIZE).toBe('window:maximize');
      expect(IPC_CHANNELS.WINDOW_FOCUS).toBe('window:focus');
      expect(IPC_CHANNELS.WINDOW_GET_STATE).toBe('window:get-state');
    });

    it('should define all required store channels', () => {
      expect(IPC_CHANNELS.STORE_GET).toBe('store:get');
      expect(IPC_CHANNELS.STORE_SET).toBe('store:set');
      expect(IPC_CHANNELS.STORE_DELETE).toBe('store:delete');
      expect(IPC_CHANNELS.STORE_CLEAR).toBe('store:clear');
      expect(IPC_CHANNELS.STORE_HAS).toBe('store:has');
    });

    it('should define all required dialog channels', () => {
      expect(IPC_CHANNELS.DIALOG_OPEN_FILE).toBe('dialog:open-file');
      expect(IPC_CHANNELS.DIALOG_SAVE_FILE).toBe('dialog:save-file');
      expect(IPC_CHANNELS.DIALOG_MESSAGE).toBe('dialog:message');
      expect(IPC_CHANNELS.DIALOG_ERROR).toBe('dialog:error');
    });

    it('should define all required app channels', () => {
      expect(IPC_CHANNELS.APP_GET_VERSION).toBe('app:get-version');
      expect(IPC_CHANNELS.APP_GET_PATH).toBe('app:get-path');
      expect(IPC_CHANNELS.APP_QUIT).toBe('app:quit');
      expect(IPC_CHANNELS.APP_RELAUNCH).toBe('app:relaunch');
      expect(IPC_CHANNELS.APP_CHECK_FOR_UPDATES).toBe('app:check-for-updates');
      expect(IPC_CHANNELS.APP_INSTALL_UPDATE).toBe('app:install-update');
    });

    it('should define event channels', () => {
      expect(IPC_CHANNELS.COUNTER_UPDATED).toBe('counter:updated');
      expect(IPC_CHANNELS.UPDATE_AVAILABLE).toBe('update:available');
      expect(IPC_CHANNELS.UPDATE_DOWNLOADED).toBe('update:downloaded');
      expect(IPC_CHANNELS.UPDATE_ERROR).toBe('update:error');
      expect(IPC_CHANNELS.UPDATE_PROGRESS).toBe('update:progress');
    });

    it('should define logging channels', () => {
      expect(IPC_CHANNELS.LOG_DEBUG).toBe('log:debug');
      expect(IPC_CHANNELS.LOG_INFO).toBe('log:info');
      expect(IPC_CHANNELS.LOG_WARN).toBe('log:warn');
      expect(IPC_CHANNELS.LOG_ERROR).toBe('log:error');
    });

    it('should not have duplicate channel names', () => {
      const values = Object.values(IPC_CHANNELS);
      const uniqueValues = new Set(values);
      expect(values.length).toBe(uniqueValues.size);
    });

    it('should use consistent naming convention (namespace:action)', () => {
      const values = Object.values(IPC_CHANNELS);
      values.forEach(channel => {
        expect(channel).toMatch(/^[a-z0-9-]+:[a-z0-9-]+$/);
      });
    });
  });

  describe('WINDOW_TYPES', () => {
    it('should define all window types', () => {
      expect(WINDOW_TYPES.MAIN).toBe('main');
      expect(WINDOW_TYPES.SETTINGS).toBe('settings');
      expect(WINDOW_TYPES.ABOUT).toBe('about');
    });

    it('should not have duplicate window types', () => {
      const values = Object.values(WINDOW_TYPES);
      const uniqueValues = new Set(values);
      expect(values.length).toBe(uniqueValues.size);
    });
  });

  describe('DEFAULT_WINDOW_CONFIG', () => {
    it('should have config for all window types', () => {
      expect(DEFAULT_WINDOW_CONFIG[WINDOW_TYPES.MAIN]).toBeDefined();
      expect(DEFAULT_WINDOW_CONFIG[WINDOW_TYPES.SETTINGS]).toBeDefined();
      expect(DEFAULT_WINDOW_CONFIG[WINDOW_TYPES.ABOUT]).toBeDefined();
    });

    it('should have valid dimensions for main window', () => {
      const mainConfig = DEFAULT_WINDOW_CONFIG[WINDOW_TYPES.MAIN];
      expect(mainConfig.width).toBeGreaterThan(0);
      expect(mainConfig.height).toBeGreaterThan(0);
      expect(mainConfig.minWidth).toBeLessThanOrEqual(mainConfig.width);
      expect(mainConfig.minHeight).toBeLessThanOrEqual(mainConfig.height);
      expect(mainConfig.title).toBeTruthy();
    });

    it('should have valid dimensions for settings window', () => {
      const settingsConfig = DEFAULT_WINDOW_CONFIG[WINDOW_TYPES.SETTINGS];
      expect(settingsConfig.width).toBeGreaterThan(0);
      expect(settingsConfig.height).toBeGreaterThan(0);
      expect(settingsConfig.minWidth).toBeLessThanOrEqual(settingsConfig.width);
      expect(settingsConfig.minHeight).toBeLessThanOrEqual(settingsConfig.height);
      expect(settingsConfig.resizable).toBe(true);
    });

    it('should have fixed dimensions for about window', () => {
      const aboutConfig = DEFAULT_WINDOW_CONFIG[WINDOW_TYPES.ABOUT];
      expect(aboutConfig.width).toBe(aboutConfig.maxWidth);
      expect(aboutConfig.height).toBe(aboutConfig.maxHeight);
      expect(aboutConfig.minWidth).toBe(aboutConfig.width);
      expect(aboutConfig.minHeight).toBe(aboutConfig.height);
      expect(aboutConfig.resizable).toBe(false);
    });

    it('should ensure minimum dimensions are reasonable', () => {
      Object.values(DEFAULT_WINDOW_CONFIG).forEach(config => {
        expect(config.minWidth).toBeGreaterThanOrEqual(300);
        expect(config.minHeight).toBeGreaterThanOrEqual(200);
      });
    });
  });

  describe('LOG_LEVELS', () => {
    it('should define all log levels', () => {
      expect(LOG_LEVELS.DEBUG).toBe('debug');
      expect(LOG_LEVELS.INFO).toBe('info');
      expect(LOG_LEVELS.WARN).toBe('warn');
      expect(LOG_LEVELS.ERROR).toBe('error');
    });

    it('should have valid log level order', () => {
      const levels = ['debug', 'info', 'warn', 'error'];
      const definedLevels = Object.values(LOG_LEVELS);
      expect(definedLevels.sort()).toEqual(levels.sort());
    });
  });

  describe('ENV', () => {
    it('should define environment constants', () => {
      expect(ENV.DEVELOPMENT).toBe('development');
      expect(ENV.PRODUCTION).toBe('production');
    });
  });

  describe('TEST_MODE', () => {
    it('should define test mode constant', () => {
      expect(TEST_MODE.ENABLED).toBe('test');
    });
  });

  describe('Constants Integrity', () => {
    it('should freeze IPC_CHANNELS to prevent modification', () => {
      expect(Object.isFrozen(IPC_CHANNELS)).toBe(true);
    });

    it('should freeze WINDOW_TYPES to prevent modification', () => {
      expect(Object.isFrozen(WINDOW_TYPES)).toBe(true);
    });

    it('should freeze DEFAULT_WINDOW_CONFIG to prevent modification', () => {
      expect(Object.isFrozen(DEFAULT_WINDOW_CONFIG)).toBe(true);
    });

    it('should have all constants as immutable', () => {
      // Attempt to modify should fail silently or throw in strict mode
      const originalValue = IPC_CHANNELS.WINDOW_CREATE;
      try {
        IPC_CHANNELS.WINDOW_CREATE = 'modified';
      } catch (e) {
        // Expected in strict mode
      }
      expect(IPC_CHANNELS.WINDOW_CREATE).toBe(originalValue);
    });
  });
});
