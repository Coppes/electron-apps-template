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
import { config, loadEnvironmentOverrides } from './config.js';

/**
 * Application Lifecycle Manager
 * Handles ordered initialization, graceful shutdown, single instance lock, and crash recovery
 */

class LifecycleManager {
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

      // Step 5: Setup application menu
      setupMenu(windowManager);
      logger.info('Application menu initialized');

      // Step 6: Create main window
      const mainWindow = windowManager.createWindow('main');
      logger.info('Main window created', { windowId: mainWindow.id });

      // Step 7: Remove crash marker after successful startup
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
    };

    registerHandlers(ipcSchema, handlers);
    logger.info('IPC handlers registered');
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
      // Step 1: Save all window states
      windowManager.saveAllStates();
      logger.debug('Window states saved');

      // Step 2: Close all windows
      windowManager.closeAllWindows();
      logger.debug('All windows closed');

      // Step 3: Flush logs
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
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      logger.info('Second instance attempt detected', {
        commandLine,
        workingDirectory,
      });

      // Focus the main window
      const mainWindow = windowManager.getWindowByType('main');
      if (mainWindow) {
        windowManager.focusWindow(mainWindow.id);
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
      const parsedUrl = new URL(url);
      logger.info('Processing deep link', {
        protocol: parsedUrl.protocol,
        host: parsedUrl.host,
        pathname: parsedUrl.pathname,
        search: parsedUrl.search,
      });

      // TODO: Route to appropriate view in renderer
      // For now, just focus the main window
      const mainWindow = windowManager.getWindowByType('main');
      if (mainWindow) {
        windowManager.focusWindow(mainWindow.id);
      }
    } catch (error) {
      logger.error('Failed to parse deep link', { url, error: error.message });
    }
  }
}

// Export singleton instance
export const lifecycleManager = new LifecycleManager();
