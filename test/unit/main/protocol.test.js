
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LifecycleManager } from '../../../src/main/lifecycle.js';
import { app } from 'electron';

// Mock dependencies
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/tmp'),
    getVersion: vi.fn(() => '1.0.0'),
    setAsDefaultProtocolClient: vi.fn(),
    isDefaultProtocolClient: vi.fn(() => false),
    on: vi.fn()
  }
}));

vi.mock('../../../src/main/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}));

vi.mock('../../../src/main/window-manager.js', () => ({
  windowManager: {
    getWindowByType: vi.fn(),
    focusWindow: vi.fn()
  }
}));

// Mock other imports to avoid execution
vi.mock('../../../src/main/menu.js', () => ({ setupMenu: vi.fn() }));
vi.mock('../../../src/main/ipc/bridge.js', () => ({ registerHandlers: vi.fn() }));
vi.mock('../../../src/main/ipc/handlers/log.js', () => ({ registerLogHandlers: vi.fn() }));
vi.mock('../../../src/main/ipc/schema.js', () => ({ ipcSchema: {} }));
vi.mock('../../../src/main/splash.js', () => ({ splashManager: {} }));
vi.mock('../../../src/main/data/connectivity-manager.js', () => ({ default: { initialize: vi.fn(), cleanup: vi.fn() } }));
vi.mock('../../../src/main/data/sync-queue.js', () => ({ default: { initialize: vi.fn() } }));
vi.mock('../../../src/main/data/file-watcher.js', () => ({ default: { cleanup: vi.fn() } }));
vi.mock('../../../src/main/tray.js', () => ({ trayManager: { destroy: vi.fn() } }));
vi.mock('../../../src/main/shortcuts.js', () => ({ shortcutManager: { cleanup: vi.fn() } }));
vi.mock('../../../src/main/recent-docs.js', () => ({ addRecentDocument: vi.fn() }));
vi.mock('../../../src/main/config.js', () => ({
  config: { deepLinking: { enabled: true } },
  loadEnvironmentOverrides: vi.fn(() => ({}))
}));

// Mock handlers to verify their existence isn't checked
vi.mock('../../../src/main/ipc/handlers/window.js', () => ({ createWindowHandlers: vi.fn(() => ({})) }));
vi.mock('../../../src/main/ipc/handlers/store.js', () => ({ createStoreHandlers: vi.fn(() => ({})) }));
vi.mock('../../../src/main/ipc/handlers/dialog.js', () => ({ createDialogHandlers: vi.fn(() => ({})) }));
vi.mock('../../../src/main/ipc/handlers/app.js', () => ({ createAppHandlers: vi.fn(() => ({})) }));
vi.mock('../../../src/main/ipc/handlers/secure-store.js', () => ({ secureStoreHandlers: {} }));
vi.mock('../../../src/main/ipc/handlers/files.js', () => ({ fileHandlers: {} }));
vi.mock('../../../src/main/ipc/handlers/data.js', () => ({ dataHandlers: {} }));
vi.mock('../../../src/main/ipc/handlers/tray.js', () => ({ trayHandlers: {} }));
vi.mock('../../../src/main/ipc/handlers/shortcuts.js', () => ({ shortcutHandlers: {} }));
vi.mock('../../../src/main/ipc/handlers/notifications.js', () => ({ notificationHandlers: {} }));
vi.mock('../../../src/main/ipc/handlers/i18n.js', () => ({ i18nHandlers: {} }));
vi.mock('../../../src/main/ipc/handlers/plugins.js', () => ({ createPluginHandlers: vi.fn(() => ({})) }));
vi.mock('../../../src/main/notifications.js', () => ({ notificationManager: {} }));

import { windowManager } from '../../../src/main/window-manager.js';

describe('LifecycleManager Protocol Handling', () => {
  let lifecycleManager;
  let mockWindow;

  beforeEach(() => {
    vi.clearAllMocks();
    lifecycleManager = new LifecycleManager();

    // Updated mock matching lifecycle.js expectation (BrowserWindow instance)
    mockWindow = {
      id: 1,
      webContents: {
        send: vi.fn()
      }
    };

    windowManager.getWindowByType.mockReturnValue(mockWindow);
  });

  describe('handleDeepLink', () => {
    it('should parse simple URL and route correctly', () => {
      const url = 'electronapp://settings';
      lifecycleManager.handleDeepLink(url);

      expect(windowManager.getWindowByType).toHaveBeenCalledWith('main');
      expect(mockWindow.webContents.send).toHaveBeenCalledWith('deep-link:received', expect.objectContaining({
        protocol: 'electronapp',
        host: 'settings',
        path: '',
        params: {}
      }));
    });

    it('should parse URL with query parameters', () => {
      const url = 'electronapp://open?file=doc.txt&mode=read';
      lifecycleManager.handleDeepLink(url);

      expect(mockWindow.webContents.send).toHaveBeenCalledWith('deep-link:received', expect.objectContaining({
        host: 'open',
        params: { file: 'doc.txt', mode: 'read' }
      }));
    });

    it('should parse URL with path segments and route parameters', () => {
      const url = 'electronapp://view/12345';
      lifecycleManager.handleDeepLink(url);

      expect(mockWindow.webContents.send).toHaveBeenCalledWith('deep-link:received', expect.objectContaining({
        host: 'view',
        path: '/12345',
        pathParams: { id: '12345' }
      }));
    });

    it('should handle settings sub-sections', () => {
      const url = 'electronapp://settings/security';
      lifecycleManager.handleDeepLink(url);

      expect(mockWindow.webContents.send).toHaveBeenCalledWith('deep-link:received', expect.objectContaining({
        host: 'settings',
        pathParams: { section: 'security' }
      }));
    });

    it('should reject URLs exceeding max length', () => {
      const longUrl = 'electronapp://' + 'a'.repeat(2050);
      lifecycleManager.handleDeepLink(longUrl);

      expect(windowManager.getWindowByType).not.toHaveBeenCalled();
    });

    it('should handle invalid URLs gracefully', () => {
      const invalidUrl = 'not-a-url';
      lifecycleManager.handleDeepLink(invalidUrl);

      expect(windowManager.getWindowByType).not.toHaveBeenCalled();
      // Should log error
    });
  });
});
