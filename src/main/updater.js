import { logger } from './logger.js';
import { config } from './config.js';

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

      // TODO: Notify renderer process
      // Send update-available event to all windows
    });

    this.autoUpdater.on('update-not-available', (info) => {
      logger.info('Update not available', {
        version: info.version,
      });
    });

    this.autoUpdater.on('error', (error) => {
      logger.error('Auto-updater error', error);
      
      // TODO: Notify renderer of error
    });

    this.autoUpdater.on('download-progress', (progress) => {
      logger.debug('Download progress', {
        percent: progress.percent.toFixed(2),
        transferred: progress.transferred,
        total: progress.total,
      });

      // TODO: Send progress to renderer
    });

    this.autoUpdater.on('update-downloaded', (info) => {
      logger.info('Update downloaded', {
        version: info.version,
        releaseDate: info.releaseDate,
      });

      // TODO: Notify renderer that update is ready to install
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
