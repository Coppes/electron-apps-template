import { app } from 'electron';
import { join } from 'path';
import fs from 'fs/promises';
import { logger } from './logger.js';
import { windowManager } from './window-manager.js';
import { setupMenu } from './menu.js';
import { registerHandlers } from './ipc/bridge.js';
import { registerLogHandlers } from './ipc/handlers/log.js';
import { ipcSchema } from './ipc/schema.js';
import { createWindowHandlers } from './ipc/handlers/window.js';
import { createStoreHandlers } from './ipc/handlers/store.js';
import { createDialogHandlers } from './ipc/handlers/dialog.js';
import { createAppHandlers } from './ipc/handlers/app.js';
import { secureStoreHandlers } from './ipc/handlers/secure-store.js';
import { fileHandlers } from './ipc/handlers/files.js';
import { dataHandlers } from './ipc/handlers/data.js';
import { trayHandlers } from './ipc/handlers/tray.js';
import { shortcutHandlers } from './ipc/handlers/shortcuts.js';
import { notificationHandlers } from './ipc/handlers/notifications.js';
import { i18nHandlers } from './ipc/handlers/i18n.js';
import { trayManager } from './tray.js';
import { shortcutManager } from './shortcuts.js';
import connectivityManager from './data/connectivity-manager.js';
import syncQueue from './data/sync-queue.js';
import fileWatcher from './data/file-watcher.js';
import { splashManager } from './splash.js';
import { notificationManager } from './notifications.js';
import { addRecentDocument } from './recent-docs.js';
import { config, loadEnvironmentOverrides } from './config.js';

/**
 * Application Lifecycle Manager
 * Handles ordered initialization, graceful shutdown, single instance lock, and crash recovery
 */

export class LifecycleManager {
  constructor() {
    this.isShuttingDown = false;
    this.crashMarkerPath = join(app.getPath('userData'), '.crash-marker');
  }

  /**
   * Initialize application in correct order
   */
  async startup() {
    logger.info('Application startup initiated', {
      version: app.getVersion(),
      environment: config.env,
    });

    const startTime = Date.now();

    try {
      // Step 0: Create and show splash screen
      splashManager.show();
      logger.info('Splash screen shown');

      // Step 1: Load environment overrides
      const overrides = loadEnvironmentOverrides();
      if (Object.keys(overrides).length > 0) {
        logger.info('Environment overrides applied', overrides);
      }

      // Step 2: Check for crash marker
      await this.checkCrashRecovery();

      // Step 3: Create crash marker
      await this.createCrashMarker();

      // Step 4: Register IPC handlers
      await this.registerIPC();

      // Step 5: Initialize connectivity and sync managers
      await connectivityManager.initialize();
      await syncQueue.initialize();
      logger.info('Data management services initialized');

      // Step 6: Setup application menu
      setupMenu(windowManager);
      logger.info('Application menu initialized');

      // Step 7: Create main window (hidden initially)
      const mainWindow = windowManager.createWindow('main', { show: false });
      logger.info('Main window created', { windowId: mainWindow.id });

      // Wait for main window to load with timeout
      await Promise.race([
        new Promise((resolve) => {
          if (mainWindow.webContents.isLoading()) {
            mainWindow.webContents.once('did-finish-load', resolve);
          } else {
            resolve();
          }
        }),
        new Promise(resolve => setTimeout(resolve, 10000)) // 10s safety timeout
      ]);

      // Ensure minimum splash time
      const elapsed = Date.now() - startTime;
      const MIN_SPLASH_TIME = 1500;
      if (elapsed < MIN_SPLASH_TIME) {
        await new Promise(r => setTimeout(r, MIN_SPLASH_TIME - elapsed));
      }

      // Show main window and close splash
      mainWindow.show();
      await splashManager.fadeOut();

      // Step 8: Initialize OS integration features
      await this.initializeOSIntegration();

      // Step 9: Remove crash marker after successful startup
      await this.removeCrashMarker();

      const duration = Date.now() - startTime;
      logger.info(`Application startup completed in ${duration}ms`);
    } catch (error) {
      logger.error('Application startup failed', error);
      throw error;
    }
  }

  /**
   * Register all IPC handlers
   */
  async registerIPC() {
    // Register log handlers (don't need schema validation)
    registerLogHandlers();

    const handlers = {
      ...createWindowHandlers(windowManager),
      ...createStoreHandlers(),
      ...createDialogHandlers(),
      ...createAppHandlers(),
      ...secureStoreHandlers,
      ...fileHandlers,
      ...dataHandlers,
      ...trayHandlers,
      ...shortcutHandlers,
      ...shortcutHandlers,
      ...notificationHandlers,
      ...i18nHandlers,
    };

    registerHandlers(ipcSchema, handlers);
    logger.info('IPC handlers registered');
  }

  /**
   * Initialize OS integration features
   */
  async initializeOSIntegration() {
    try {
      // Initialize system tray
      if (config.osIntegration?.tray?.enabled) {
        const trayCreated = trayManager.createTray({
          tooltip: app.getName(),
          onClick: () => {
            const mainWindow = windowManager.getWindowByType('main');
            if (mainWindow && !mainWindow.isDestroyed()) {
              if (mainWindow.isVisible()) {
                mainWindow.hide();
              } else {
                windowManager.focusWindow(mainWindow.id);
              }
            }
          },
        });

        if (trayCreated) {
          logger.info('System tray initialized');
        }
      }

      // Register default global shortcuts
      if (config.osIntegration?.shortcuts?.enabled) {
        const defaults = config.osIntegration.shortcuts.defaults || {};
        for (const [accelerator, action] of Object.entries(defaults)) {
          const registered = shortcutManager.register(
            accelerator,
            () => {
              logger.debug('Default shortcut triggered', { accelerator, action });
              const mainWindow = windowManager.getWindowByType('main');
              if (mainWindow) {
                mainWindow.webContents.send('shortcut:triggered', {
                  accelerator,
                  action,
                });
              }
            },
            action
          );

          if (registered) {
            logger.info('Default shortcut registered', { accelerator, action });
          }
        }
      }

      logger.info('OS integration initialized');

      // Setup file handling (open-file)
      this.setupFileHandling();
    } catch (error) {
      logger.error('Failed to initialize OS integration', error);
    }
  }

  /**
   * Graceful shutdown sequence
   */
  async shutdown() {
    if (this.isShuttingDown) {
      logger.warn('Shutdown already in progress');
      return;
    }

    this.isShuttingDown = true;
    logger.info('Application shutdown initiated');

    try {
      // Step 1: Cleanup OS integration
      shortcutManager.cleanup();
      trayManager.destroy();
      logger.debug('OS integration cleaned up');

      // Step 2: Cleanup data management services
      connectivityManager.cleanup();
      await fileWatcher.cleanup();
      logger.debug('Data management services cleaned up');

      // Step 3: Save all window states
      windowManager.saveAllStates();
      logger.debug('Window states saved');

      // Step 4: Close all windows
      windowManager.closeAllWindows();
      logger.debug('All windows closed');

      // Step 5: Flush logs
      await this.flushLogs();

      logger.info('Application shutdown completed gracefully');
    } catch (error) {
      logger.error('Error during shutdown', error);
    }
  }

  /**
   * Flush log buffers
   */
  async flushLogs() {
    // electron-log automatically flushes, but we can force it
    return new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  }

  /**
   * Setup single instance lock
   * @returns {boolean} True if this is the first instance
   */
  setupSingleInstance() {
    if (!config.singleInstance.enabled) {
      logger.info('Single instance mode disabled');
      return true;
    }

    const gotLock = app.requestSingleInstanceLock();

    if (!gotLock) {
      logger.warn('Another instance is already running, exiting');
      return false;
    }

    // Handle second instance attempt
    // Handle second instance attempt
    app.on('second-instance', async (event, commandLine, workingDirectory) => {
      logger.info('Second instance attempt detected', {
        commandLine,
        workingDirectory,
      });

      // Focus the main window
      const mainWindow = windowManager.getWindowByType('main');
      if (mainWindow) {
        if (mainWindow.window.isMinimized()) mainWindow.window.restore();
        windowManager.focusWindow(mainWindow.id);

        // Check for file path in args (simple heuristic)
        // Skip first arg (executable) and flags
        const possibleFile = commandLine.slice(1).find(arg =>
          arg && !arg.startsWith('-') && !arg.startsWith('electronapp://')
        );

        if (possibleFile) {
          // Read and send file
          try {
            const exists = await fs.access(possibleFile).then(() => true).catch(() => false);
            if (exists) {
              const content = await fs.readFile(possibleFile, 'utf-8');
              mainWindow.webContents.send('file:opened', {
                filePath: possibleFile,
                content
              });
              addRecentDocument(possibleFile);
              logger.info('Opened file from second instance', { filePath: possibleFile });
            }
          } catch (error) {
            logger.error('Failed to open file from second instance', error);
          }
        }
      }
    });

    logger.info('Single instance lock acquired');
    return true;
  }

  /**
   * Create crash marker file
   */
  async createCrashMarker() {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        version: app.getVersion(),
        platform: process.platform,
      };
      await fs.writeFile(this.crashMarkerPath, JSON.stringify(data, null, 2));
      logger.debug('Crash marker created');
    } catch (error) {
      logger.error('Failed to create crash marker', error);
    }
  }

  /**
   * Remove crash marker file
   */
  async removeCrashMarker() {
    try {
      await fs.unlink(this.crashMarkerPath);
      logger.debug('Crash marker removed');
    } catch (error) {
      // Ignore if file doesn't exist
      if (error.code !== 'ENOENT') {
        logger.error('Failed to remove crash marker', error);
      }
    }
  }

  /**
   * Check for crash marker and handle recovery
   */
  async checkCrashRecovery() {
    try {
      const exists = await fs.access(this.crashMarkerPath).then(() => true).catch(() => false);

      if (exists) {
        const data = await fs.readFile(this.crashMarkerPath, 'utf-8');
        const crashInfo = JSON.parse(data);

        logger.warn('Previous session crashed', crashInfo);

        // TODO: Show recovery dialog to user
        // Show recovery notification
        notificationManager.showNotification({
          title: 'App Recovered',
          body: 'The application has recovered from an unexpected shutdown.',
          urgency: 'critical',
          timeoutMs: 0,
        }).catch(err => logger.warn('Failed to show recovery notification', err));

        // For now, just log and continue

        // Remove the crash marker
        await this.removeCrashMarker();
      }
    } catch (error) {
      logger.error('Failed to check crash recovery', error);
    }
  }

  /**
   * Setup deep linking protocol
   */
  setupDeepLinking() {
    if (!config.deepLinking.enabled) {
      logger.info('Deep linking disabled');
      return;
    }

    const protocol = 'electronapp';

    // Set as default protocol client
    if (!app.isDefaultProtocolClient(protocol)) {
      app.setAsDefaultProtocolClient(protocol);
      logger.info(`Registered protocol: ${protocol}://`);
    }

    // Handle deep links on macOS
    app.on('open-url', (event, url) => {
      event.preventDefault();
      logger.info('Deep link opened', { url });
      this.handleDeepLink(url);
    });

    // Handle deep links on Windows/Linux via command line
    if (process.platform === 'win32' || process.platform === 'linux') {
      const url = process.argv.find(arg => arg.startsWith(`${protocol}://`));
      if (url) {
        logger.info('Deep link from command line', { url });
        this.handleDeepLink(url);
      }
    }
  }

  /**
   * Handle deep link URL
   * @param {string} url - Deep link URL
   */
  handleDeepLink(url) {
    try {
      // Validate URL length
      if (url.length > 2048) {
        logger.warn('Deep link URL too long', { length: url.length });
        return;
      }

      const parsedUrl = new URL(url);

      // Parse query parameters
      const params = {};
      parsedUrl.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      // Parse path segments
      const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);

      // Create deep link data
      /** @type {import('../common/types.js').DeepLinkData} */
      const deepLinkData = {
        url,
        protocol: parsedUrl.protocol.replace(':', ''),
        host: parsedUrl.host,
        path: parsedUrl.pathname,
        params,
        pathParams: {},
      };

      // Route based on host/action
      const route = this.matchRoute(parsedUrl.host, pathSegments, deepLinkData);

      logger.info('Processing deep link', {
        host: deepLinkData.host,
        path: deepLinkData.path,
        route,
      });

      // Focus main window
      const mainWindow = windowManager.getWindowByType('main');
      if (mainWindow) {
        windowManager.focusWindow(mainWindow.id);

        // Send deep link data to renderer
        mainWindow.window.webContents.send('deep-link:received', deepLinkData);
      }
    } catch (error) {
      logger.error('Failed to parse deep link', { url, error: error.message });
    }
  }

  /**
   * Setup file handling (macOS open-file, etc.)
   */
  setupFileHandling() {
    app.on('open-file', async (event, path) => {
      event.preventDefault();
      logger.info('Opening file from OS', { path });

      const mainWindow = windowManager.getWindowByType('main');
      if (mainWindow) {
        if (mainWindow.window.isMinimized()) mainWindow.window.restore();
        windowManager.focusWindow(mainWindow.id);

        try {
          const content = await fs.readFile(path, 'utf-8');
          mainWindow.webContents.send('file:opened', { filePath: path, content });
          addRecentDocument(path);
        } catch (error) {
          logger.error('Failed to read opened file', { path, error });
        }
      } else {
        // Store for when window is ready? 
        // For now, simplify. If no window, we might need to handle on ready.
        // But mostly open-file happens when app is running or launching.
        // If launching, window creation will follow.
        // TODO: Handle startup file open
      }
    });
  }

  /**
   * Match deep link to a route
   * @param {string} host - URL host/action
   * @param {string[]} pathSegments - Path segments
   * @param {Object} deepLinkData - Deep link data object
   * @returns {string|null} Matched route
   */
  matchRoute(host, pathSegments, deepLinkData) {
    // Define route patterns
    const routes = {
      'open': () => {
        // electronapp://open?file=/path/to/file
        if (deepLinkData.params.file) {
          return 'open-file';
        }
        return 'unknown';
      },
      'settings': () => {
        // electronapp://settings or electronapp://settings/account
        if (pathSegments.length > 0) {
          deepLinkData.pathParams.section = pathSegments[0];
          return 'settings-section';
        }
        return 'settings';
      },
      'new': () => {
        // electronapp://new or electronapp://new/document
        if (pathSegments.length > 0) {
          deepLinkData.pathParams.type = pathSegments[0];
          return 'new-item';
        }
        return 'new';
      },
      'view': () => {
        // electronapp://view/:id
        if (pathSegments.length > 0) {
          deepLinkData.pathParams.id = pathSegments[0];
          return 'view-item';
        }
        return 'unknown';
      },
    };

    const routeHandler = routes[host];
    if (routeHandler) {
      return routeHandler();
    }

    return 'unknown';
  }
}

// Export singleton instance
export const lifecycleManager = new LifecycleManager();
