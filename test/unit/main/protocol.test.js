
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { app } from 'electron';

// Mock dependencies
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/tmp'),
    getName: vi.fn(() => 'Test App'),
    getVersion: vi.fn(() => '1.0.0'),
    setAsDefaultProtocolClient: vi.fn(),
    isDefaultProtocolClient: vi.fn(() => false),
    on: vi.fn(),
    isPackaged: false
  }
}));

vi.mock('../../../src/main/logger.ts', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}));

vi.mock('../../../src/main/window-manager.ts', () => ({
  windowManager: {
    getWindowByType: vi.fn(),
    focusWindow: vi.fn()
  }
}));

// Mock other imports to avoid execution
vi.mock('../../../src/main/menu.ts', () => ({ setupMenu: vi.fn() }));
vi.mock('../../../src/main/ipc/bridge.ts', () => ({ registerHandlers: vi.fn() }));
vi.mock('../../../src/main/ipc/handlers/log.ts', () => ({ registerLogHandlers: vi.fn() }));
vi.mock('../../../src/main/ipc/schema.ts', () => ({ ipcSchema: {} }));
vi.mock('../../../src/main/splash.ts', () => ({ splashManager: {} }));
vi.mock('../../../src/main/data/connectivity-manager.ts', () => ({ default: { initialize: vi.fn(), cleanup: vi.fn() } }));
vi.mock('../../../src/main/data/sync-queue.ts', () => ({ default: { initialize: vi.fn() } }));
vi.mock('../../../src/main/data/file-watcher.ts', () => ({ default: { cleanup: vi.fn() } }));
vi.mock('../../../src/main/tray.ts', () => ({ trayManager: { destroy: vi.fn() } }));
vi.mock('../../../src/main/shortcuts.ts', () => ({ shortcutManager: { cleanup: vi.fn() } }));
vi.mock('../../../src/main/recent-docs.ts', () => ({ addRecentDocument: vi.fn() }));
vi.mock('../../../src/main/config.ts', () => ({
  config: { deepLinking: { enabled: true } },
  loadEnvironmentOverrides: vi.fn(() => ({}))
}));

// Mock handlers to verify their existence isn't checked
vi.mock('../../../src/main/ipc/handlers/window.ts', () => ({ createWindowHandlers: vi.fn(() => ({})) }));
vi.mock('../../../src/main/ipc/handlers/store.ts', () => ({ createStoreHandlers: vi.fn(() => ({})) }));
vi.mock('../../../src/main/ipc/handlers/dialog.ts', () => ({ createDialogHandlers: vi.fn(() => ({})) }));
vi.mock('../../../src/main/ipc/handlers/app.ts', () => ({ createAppHandlers: vi.fn(() => ({})) }));
vi.mock('../../../src/main/ipc/handlers/secure-store.ts', () => ({ secureStoreHandlers: {} }));
vi.mock('../../../src/main/ipc/handlers/files.ts', () => ({ fileHandlers: {} }));
vi.mock('../../../src/main/ipc/handlers/data.ts', () => ({ dataHandlers: {} }));
vi.mock('../../../src/main/ipc/handlers/tray.ts', () => ({ trayHandlers: {} }));
vi.mock('../../../src/main/ipc/handlers/shortcuts.ts', () => ({ shortcutHandlers: {} }));
vi.mock('../../../src/main/ipc/handlers/notifications.ts', () => ({ notificationHandlers: {} }));
vi.mock('../../../src/main/ipc/handlers/i18n.ts', () => ({ i18nHandlers: {} }));
vi.mock('../../../src/main/ipc/handlers/plugins.ts', () => ({ createPluginHandlers: vi.fn(() => ({})) }));
vi.mock('../../../src/main/notifications.ts', () => ({ notificationManager: {} }));

// Import AFTER mocks
import { LifecycleManager } from '../../../src/main/lifecycle.ts';
import { windowManager } from '../../../src/main/window-manager.ts';

describe('LifecycleManager Protocol Handling', () => {
  let lifecycleManager;
  let mockWindow;

  beforeEach(() => {
    vi.clearAllMocks();
    lifecycleManager = new LifecycleManager();

    // Updated mock matching lifecycle.ts expectation (BrowserWindow instance)
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
