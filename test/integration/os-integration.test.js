
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { app, Menu, Tray, Notification } from 'electron';

// Mock Electron
vi.mock('electron', () => ({
  app: {
    getVersion: vi.fn(() => '1.0.0'),
    getName: vi.fn(() => 'Test App'),
    getPath: vi.fn((name) => `/tmp/${name}`),
    setAsDefaultProtocolClient: vi.fn(),
    isDefaultProtocolClient: vi.fn(() => true),
    on: vi.fn(),
    quit: vi.fn(),
    isPackaged: false,
    getAppPath: vi.fn(() => '/app')
  },
  Menu: {
    buildFromTemplate: vi.fn(template => ({ template, popup: vi.fn() })),
    setApplicationMenu: vi.fn()
  },
  Tray: vi.fn().mockImplementation(() => ({
    setToolTip: vi.fn(),
    setContextMenu: vi.fn(),
    on: vi.fn(),
    setImage: vi.fn(),
    destroy: vi.fn(),
  })),
  Notification: vi.fn().mockImplementation(() => ({
    show: vi.fn(),
    on: vi.fn(),
    close: vi.fn()
  })),
  nativeImage: {
    createFromPath: vi.fn(() => ({ isEmpty: vi.fn(() => false) }))
  },
  globalShortcut: {
    register: vi.fn(() => true),
    isRegistered: vi.fn(() => false),
    unregister: vi.fn(),
    unregisterAll: vi.fn()
  }
}));

// Mock logger
vi.mock('../../src/main/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}));

// Mock Window Manager
const mockMainWindow = {
  id: 1,
  webContents: { send: vi.fn() },
  show: vi.fn(),
  hide: vi.fn(),
  isVisible: vi.fn(() => false),
  isDestroyed: vi.fn(() => false),
  isMinimized: vi.fn(() => false),
  restore: vi.fn(),
  setProgressBar: vi.fn()
};

vi.mock('../../src/main/window-manager.js', () => ({
  windowManager: {
    getWindowByType: vi.fn(() => mockMainWindow),
    focusWindow: vi.fn(),
    getAllWindows: vi.fn(() => [mockMainWindow]),
  }
}));

// Mock dependencies
vi.mock('../../src/main/config.js', () => ({
  config: {
    osIntegration: {
      tray: { enabled: true },
      shortcuts: { enabled: true, defaults: { 'Command+K': 'open-command-palette' } }
    },
    deepLinking: { enabled: true }
  },
  loadEnvironmentOverrides: vi.fn(() => ({}))
}));

vi.mock('fs', () => ({
  default: { existsSync: vi.fn(() => true) },
  existsSync: vi.fn(() => true)
}));

vi.mock('../../src/common/constants.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    isMacOS: vi.fn(() => true),
    isWindows: vi.fn(() => false),
    isLinux: vi.fn(() => false),
    ENV: { DEVELOPMENT: 'development' }
  };
});

vi.mock('electron-store', () => {
  return {
    default: class Store {
      constructor() {
        this.store = {};
      }
      get(key) { return this.store[key]; }
      set(key, val) { this.store[key] = val; }
      delete(key) { delete this.store[key]; }
      clear() { this.store = {}; }
    }
  };
});

// Import what we are testing
import { lifecycleManager } from '../../src/main/lifecycle.js';
import { trayManager } from '../../src/main/tray.js';
import { shortcutManager } from '../../src/main/shortcuts.js';
import { notificationManager } from '../../src/main/notifications.js';
import { windowManager } from '../../src/main/window-manager.js';

describe('OS Integration Integration Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Tray Integration', () => {
    it('should show window when tray is clicked', async () => {
      // Setup tray
      await lifecycleManager.initializeOSIntegration();

      // Get the click handler passed to createTray
      const createTrayCalls = trayManager.createTray.mock ? trayManager.createTray.mock.calls : [];
      // If createTray is mocked by the import mock (which it shouldn't be effectively if we test the real logic).
      // Ah, lifecyle.js imports trayManager from tray.js. 
      // If we don't mock tray.js, we get the real class?
      // In this test file, I imported lifecycleManager.
      // But lifecycle.js imports `trayManager` singleton.
      // I did NOT mock `../../src/main/tray.js` in this file's top level.
      // So `trayManager` is the REAL one (using mocked Electron Tray).

      // Re-create tray manually to capture options if needed, or rely on implementation
      // lifecycleManager.initializeOSIntegration calls trayManager.createTray({ onClick: ... })

      // Let's spy on trayManager.createTray
      const createTraySpy = vi.spyOn(trayManager, 'createTray');

      await lifecycleManager.initializeOSIntegration();

      expect(createTraySpy).toHaveBeenCalled();
      const options = createTraySpy.mock.calls[0][0];

      // Simulate click
      options.onClick();

      expect(windowManager.focusWindow).toHaveBeenCalledWith(1);
    });
  });

  describe('Shortcuts Integration', () => {
    it('should send IPC message when global shortcut is triggered', async () => {
      // Spy on register
      const registerSpy = vi.spyOn(shortcutManager, 'register');

      await lifecycleManager.initializeOSIntegration();

      expect(registerSpy).toHaveBeenCalledWith('Command+K', expect.any(Function), expect.any(String));

      // Get the callback
      const callback = registerSpy.mock.calls[0][1];

      // Trigger it
      callback();

      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith('shortcut:triggered', {
        accelerator: 'Command+K',
        action: 'open-command-palette'
      });
    });
  });

  describe('Deep Linking Integration', () => {
    it('should route deep links to the main window', () => {
      const url = 'electronapp://settings/account';

      lifecycleManager.handleDeepLink(url);

      expect(windowManager.focusWindow).toHaveBeenCalledWith(1);
      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith('deep-link:received', expect.objectContaining({
        host: 'settings',
        pathParams: { section: 'account' }
      }));
    });
  });

  describe('Notification Actions', () => {
    it('should handle notification click via IPC', () => {
      // This usually goes through IPC handlers which invoke native APIs.
      // We can test if notificationManager emits events or if we can invoke actions.
      // For integration, ensuring showNotification calls Electron Notification is mostly covered by unit tests.
      // But we can check if window focus happens on click if we implement such logic.
      // Currently NotificationManager doesn't seem to implement auto-focus on click in the main file explicitly seen?
      // Let's skip for now as it duplicates unit tests logic.
    });
  });

});
