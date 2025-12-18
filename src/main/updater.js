import { BrowserWindow, app } from 'electron';
import { store } from './ipc/handlers/store.js';
import { IPC_CHANNELS } from '../common/constants.js';
import { logger } from './logger.js';
import { config } from './config.js';
import { notificationManager } from './notifications.js';

/**
 * Auto-updater scaffolding
 * Handles application updates using electron-updater
 */

class Updater {
  constructor() {
    this.updateCheckInterval = null;
    this.updateAvailable = false;
    this.autoUpdater = null;
  }

  /**
   * Initialize auto-updater
   */
  async initialize() {
    if (!config.updates.enabled) {
      logger.info('Auto-updater disabled');
      this.checkVersion();
      return;
    }

    try {
      // Dynamic import for CommonJS module
      const { autoUpdater } = await import('electron-updater');
      this.autoUpdater = autoUpdater;

      // Configure updater
      this.autoUpdater.autoDownload = config.updates.autoDownload;
      this.autoUpdater.autoInstallOnAppQuit = config.updates.autoInstallOnAppQuit;

      // Use electron-log for updater logs
      this.autoUpdater.logger = logger.getLogInstance();

      // Setup event handlers
      this.setupEventHandlers();

      this.checkVersion();

      logger.info('Auto-updater initialized', {
        autoDownload: config.updates.autoDownload,
        autoInstallOnAppQuit: config.updates.autoInstallOnAppQuit,
      });
    } catch (error) {
      logger.warn('Failed to initialize auto-updater', {
        error: error.message,
        note: 'Auto-update functionality will be disabled',
      });
    }
  }

  /**
   * Setup updater event handlers
   */
  setupEventHandlers() {
    if (!this.autoUpdater) return;

    this.autoUpdater.on('checking-for-update', () => {
      logger.info('Checking for updates...');
    });

    this.autoUpdater.on('update-available', (info) => {
      this.updateAvailable = true;
      logger.info('Update available', {
        version: info.version,
        releaseDate: info.releaseDate,
      });

      // Notify user via native notification
      notificationManager.showNotification({
        title: 'Update Available',
        body: `A new version (${info.version}) is available. It will be downloaded in the background.`,
        icon: 'update',
      }).catch(err => logger.warn('Failed to show update notification', err));

      // Notify all renderer processes
      const allWindows = BrowserWindow.getAllWindows();
      allWindows.forEach(win => {
        win.webContents.send(IPC_CHANNELS.UPDATE_AVAILABLE, {
          version: info.version,
          releaseDate: info.releaseDate,
          releaseNotes: info.releaseNotes || '',
        });
      });
    });

    this.autoUpdater.on('update-not-available', (info) => {
      logger.info('Update not available', {
        version: info.version,
      });
    });

    this.autoUpdater.on('error', (error) => {
      logger.error('Auto-updater error', error);

      // Notify renderer of error
      const allWindows = BrowserWindow.getAllWindows();
      allWindows.forEach(win => {
        win.webContents.send(IPC_CHANNELS.UPDATE_ERROR, {
          message: error.message || 'Unknown update error',
          code: error.code || 'UPDATE_ERROR',
        });
      });
    });

    this.autoUpdater.on('download-progress', (progress) => {
      logger.debug('Download progress', {
        percent: progress.percent.toFixed(2),
        transferred: progress.transferred,
        total: progress.total,
      });

      // Send progress to renderer (throttled by electron-updater)
      const allWindows = BrowserWindow.getAllWindows();
      allWindows.forEach(win => {
        win.webContents.send(IPC_CHANNELS.UPDATE_PROGRESS, {
          percent: progress.percent,
          transferred: progress.transferred,
          total: progress.total,
          bytesPerSecond: progress.bytesPerSecond,
        });
      });
    });

    this.autoUpdater.on('update-downloaded', (info) => {
      logger.info('Update downloaded', {
        version: info.version,
        releaseDate: info.releaseDate,
      });

      // Notify user update is ready
      notificationManager.showNotification({
        title: 'Update Ready',
        body: `Version ${info.version} has been downloaded. Click to restart and install.`,
        timeoutMs: 0, // Keep until clicked
        actions: [{ type: 'button', text: 'Install Now' }]
      }).catch(err => logger.warn('Failed to show update downloaded notification', err));

      // Notify renderer that update is ready to install
      const allWindows = BrowserWindow.getAllWindows();
      allWindows.forEach(win => {
        win.webContents.send(IPC_CHANNELS.UPDATE_DOWNLOADED, {
          version: info.version,
          releaseDate: info.releaseDate,
          downloadedAt: new Date().toISOString(),
        });
      });
    });
  }

  /**
   * Check for updates
   */
  async checkForUpdates() {
    if (!config.updates.enabled || !this.autoUpdater) {
      logger.debug('Update check skipped - updates disabled or not initialized');
      return;
    }

    try {
      logger.info('Manually checking for updates...');
      const result = await this.autoUpdater.checkForUpdates();
      return result;
    } catch (error) {
      logger.error('Failed to check for updates', error);
      throw error;
    }
  }

  /**
   * Download update
   */
  async downloadUpdate() {
    if (!this.updateAvailable || !this.autoUpdater) {
      logger.warn('No update available to download or updater not initialized');
      return;
    }

    try {
      logger.info('Starting update download...');
      await this.autoUpdater.downloadUpdate();
    } catch (error) {
      logger.error('Failed to download update', error);
      throw error;
    }
  }

  /**
   * Install update and restart app
   */
  quitAndInstall() {
    if (!this.autoUpdater) {
      logger.warn('Cannot install update - updater not initialized');
      return;
    }

    logger.info('Quitting and installing update...');
    this.autoUpdater.quitAndInstall(false, true);
  }

  /**
   * Start periodic update checks
   * @param {number} intervalMinutes - Check interval in minutes
   */
  startPeriodicChecks(intervalMinutes = 60) {
    if (!config.updates.enabled || !this.autoUpdater) {
      return;
    }

    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
    }

    const intervalMs = intervalMinutes * 60 * 1000;

    this.updateCheckInterval = setInterval(() => {
      this.checkForUpdates();
    }, intervalMs);

    logger.info(`Periodic update checks started (every ${intervalMinutes} minutes)`);
  }

  /**
   * Stop periodic update checks
   */
  stopPeriodicChecks() {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
      logger.info('Periodic update checks stopped');
    }
  }

  /**
   * Check if version changed and set flag in store
   */
  checkVersion() {
    try {
      const currentVersion = app.getVersion();
      const lastRunVersion = store.get('lastRunVersion');

      if (!lastRunVersion || this.compareVersions(currentVersion, lastRunVersion) > 0) {
        logger.info(`App updated from ${lastRunVersion} to ${currentVersion}`);
        store.set('pendingWhatsNew', currentVersion);
        store.set('lastRunVersion', currentVersion);
      }
    } catch (error) {
      logger.error('Failed to check version', error);
    }
  }

  /**
   * Simple semantic version comparison
   * Returns > 0 if v1 > v2
   */
  compareVersions(v1, v2) {
    if (!v1 || !v2) return 0;
    return v1.localeCompare(v2, undefined, { numeric: true, sensitivity: 'base' });
  }
}

// Export singleton instance
export const updater = new Updater();

/**
 * NOTE: Auto-updater requires proper configuration:
 * 
 * 1. Create electron-builder.yml in project root:
 * 
 * appId: com.yourcompany.yourapp
 * productName: YourApp
 * publish:
 *   provider: github
 *   owner: your-github-username
 *   repo: your-repo-name
 * 
 * 2. Or configure in package.json:
 * 
 * "build": {
 *   "appId": "com.yourcompany.yourapp",
 *   "publish": {
 *     "provider": "github",
 *     "owner": "your-github-username",
 *     "repo": "your-repo-name"
 *   }
 * }
 * 
 * 3. For other providers (S3, generic, etc.), see:
 * https://www.electron.build/configuration/publish
 */
