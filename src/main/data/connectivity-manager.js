/**
 * Connectivity Manager
 * Monitors network connectivity and notifies renderer
 */

import { net } from 'electron';
import { BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../../common/constants.js';
import { logger } from '../logger.js';

/**
 * ConnectivityManager Class
 * Manages network connectivity detection and monitoring
 */
export class ConnectivityManager {
  constructor(options = {}) {
    this.isOnline = true;
    this.checkUrl = options.checkUrl || 'https://www.google.com';
    this.pollInterval = options.pollInterval || 30000; // 30 seconds
    this.pollTimer = null;
    this.listeners = new Set();
  }

  /**
   * Initialize connectivity monitoring
   */
  async initialize() {
    // Initial check
    await this.checkConnectivity();

    // Start polling
    this.startPolling();

    logger.info('Connectivity manager initialized', {
      isOnline: this.isOnline,
      checkUrl: this.checkUrl
    });
  }

  /**
   * Check network connectivity
   * @returns {Promise<boolean>} Connection status
   */
  async checkConnectivity() {
    try {
      // Try HTTP HEAD request to reliable endpoint
      const online = await this.performConnectivityCheck();
      
      // Only notify if status changed
      if (online !== this.isOnline) {
        const previousState = this.isOnline;
        this.isOnline = online;
        
        logger.info('Connectivity changed', {
          from: previousState ? 'online' : 'offline',
          to: online ? 'online' : 'offline'
        });

        // Notify all windows
        this.notifyConnectivityChange(online);
      }

      return online;
    } catch (error) {
      logger.error('Connectivity check failed:', error);
      return false;
    }
  }

  /**
   * Perform actual connectivity check
   */
  async performConnectivityCheck() {
    return new Promise((resolve) => {
      const request = net.request({
        method: 'HEAD',
        url: this.checkUrl
      });

      const timeout = setTimeout(() => {
        request.abort();
        resolve(false);
      }, 5000); // 5 second timeout

      request.on('response', (response) => {
        clearTimeout(timeout);
        resolve(response.statusCode >= 200 && response.statusCode < 300);
      });

      request.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });

      request.end();
    });
  }

  /**
   * Start periodic connectivity polling
   */
  startPolling() {
    if (this.pollTimer) {
      return;
    }

    this.pollTimer = setInterval(() => {
      this.checkConnectivity();
    }, this.pollInterval);

    logger.debug('Connectivity polling started', {
      interval: this.pollInterval
    });
  }

  /**
   * Stop connectivity polling
   */
  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
      logger.debug('Connectivity polling stopped');
    }
  }

  /**
   * Notify windows of connectivity change
   */
  notifyConnectivityChange(isOnline) {
    const windows = BrowserWindow.getAllWindows();

    for (const window of windows) {
      if (!window.isDestroyed()) {
        window.webContents.send(IPC_CHANNELS.CONNECTIVITY_STATUS, {
          online: isOnline,
          timestamp: Date.now()
        });
      }
    }

    // Notify registered listeners
    for (const listener of this.listeners) {
      try {
        listener(isOnline);
      } catch (error) {
        logger.error('Listener error:', error);
      }
    }
  }

  /**
   * Register connectivity change listener
   * @param {Function} listener - Callback function
   * @returns {Function} Cleanup function
   */
  addListener(listener) {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get current connectivity status
   * @returns {object} Status object
   */
  getStatus() {
    return {
      online: this.isOnline,
      checkUrl: this.checkUrl,
      lastCheck: Date.now()
    };
  }

  /**
   * Force connectivity check
   * @returns {Promise<object>} Status result
   */
  async forceCheck() {
    const online = await this.checkConnectivity();
    return {
      success: true,
      online,
      timestamp: Date.now()
    };
  }

  /**
   * Cleanup on app quit
   */
  cleanup() {
    this.stopPolling();
    this.listeners.clear();
    logger.info('Connectivity manager cleanup complete');
  }
}

// Create singleton instance
const connectivityManager = new ConnectivityManager();

export default connectivityManager;
