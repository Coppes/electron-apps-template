import { Notification } from 'electron';
import { logger } from './logger.js';
import { windowManager } from './window-manager.js';
import { IPC_CHANNELS } from '../common/constants.js';
import { isPermissionAllowed } from './security/permissions.js';

/**
 * Native OS Notifications Manager
 */
export class NotificationManager {
  constructor() {
    /** @type {Map<string, {notification: Notification, options: Object}>} */
    this.activeNotifications = new Map();

    /** @type {import('../common/types.js').NotificationInfo[]} */
    this.history = [];

    this.maxHistorySize = 50;
    this.rateLimitWindow = 60000; // 1 minute
    this.maxNotificationsPerWindow = 10;
    this.notificationTimestamps = [];
  }

  /**
   * Show a native notification
   * @param {import('../common/types.js').NotificationOptions} options - Notification options
   * @returns {Promise<string>} Notification ID
   */
  async showNotification(options) {
    try {
      // Validate options
      if (!options.title || !options.body) {
        throw new Error('Title and body are required');
      }

      // Check permission
      if (!isPermissionAllowed('notifications')) {
        logger.warn('Notification denied by policy');
        throw new Error('Notification permission denied');
      }

      // Check rate limiting
      if (!this.checkRateLimit()) {
        logger.warn('Notification rate limit exceeded');
        throw new Error('Too many notifications');
      }

      // Sanitize content
      const sanitizedOptions = this.sanitizeOptions(options);

      // Create notification ID
      const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create native notification
      const notification = new Notification({
        title: sanitizedOptions.title,
        body: sanitizedOptions.body,
        icon: sanitizedOptions.icon,
        silent: sanitizedOptions.silent || false,
        urgency: sanitizedOptions.urgency || 'normal',
        timeoutType: sanitizedOptions.timeoutMs ? 'default' : 'never',
        actions: sanitizedOptions.actions || [],
      });

      // Set up event handlers
      notification.on('click', () => {
        this.handleNotificationClick(id, sanitizedOptions);
      });

      notification.on('action', (event, actionIndex) => {
        this.handleNotificationAction(id, actionIndex, sanitizedOptions);
      });

      notification.on('close', () => {
        this.handleNotificationClose(id);
      });

      // Show notification
      notification.show();

      // Store active notification
      this.activeNotifications.set(id, {
        notification,
        options: sanitizedOptions,
      });

      // Add to history
      this.addToHistory({
        id,
        title: sanitizedOptions.title,
        body: sanitizedOptions.body,
        timestamp: new Date().toISOString(),
        clicked: false,
      });

      // Auto-close if timeout specified
      if (sanitizedOptions.timeoutMs) {
        setTimeout(() => {
          this.closeNotification(id);
        }, sanitizedOptions.timeoutMs);
      }

      logger.info('Notification shown', { id, title: sanitizedOptions.title });
      return id;
    } catch (error) {
      logger.error('Failed to show notification', error);
      throw error;
    }
  }

  /**
   * Close a notification
   * @param {string} id - Notification ID
   * @returns {boolean} Success status
   */
  closeNotification(id) {
    try {
      const entry = this.activeNotifications.get(id);
      if (!entry) {
        return false;
      }

      entry.notification.close();
      this.activeNotifications.delete(id);
      logger.debug('Notification closed', { id });
      return true;
    } catch (error) {
      logger.error('Failed to close notification', { id, error });
      return false;
    }
  }

  /**
   * Get notification history
   * @param {number} [limit=50] - Maximum number of entries to return
   * @returns {import('../common/types.js').NotificationInfo[]}
   */
  getHistory(limit = 50) {
    return this.history.slice(-limit);
  }

  /**
   * Clear notification history
   */
  clearHistory() {
    this.history = [];
    logger.debug('Notification history cleared');
  }

  /**
   * Handle notification click
   * @param {string} id - Notification ID
   * @param {Object} options - Original notification options
   */
  handleNotificationClick(id, options) {
    logger.debug('Notification clicked', { id });

    // Update history
    const historyEntry = this.history.find(h => h.id === id);
    if (historyEntry) {
      historyEntry.clicked = true;
    }

    // Focus main window
    const mainWindow = windowManager.getWindowByType('main');
    if (mainWindow) {
      windowManager.focusWindow(mainWindow.id);
    }

    // Send event to renderer
    this.sendToRenderer(IPC_CHANNELS.NOTIFICATION_CLICKED, { id, options });

    // Remove from active notifications
    this.activeNotifications.delete(id);
  }

  /**
   * Handle notification action button click
   * @param {string} id - Notification ID
   * @param {number} actionIndex - Action button index
   * @param {Object} options - Original notification options
   */
  handleNotificationAction(id, actionIndex, options) {
    const action = options.actions?.[actionIndex];
    logger.debug('Notification action clicked', { id, actionIndex, action });

    // Send event to renderer
    this.sendToRenderer(IPC_CHANNELS.NOTIFICATION_ACTION_CLICKED, {
      id,
      actionIndex,
      action,
      options,
    });

    // Remove from active notifications
    this.activeNotifications.delete(id);
  }

  /**
   * Handle notification close
   * @param {string} id - Notification ID
   */
  handleNotificationClose(id) {
    logger.debug('Notification closed', { id });

    // Send event to renderer
    this.sendToRenderer(IPC_CHANNELS.NOTIFICATION_CLOSED, { id });

    // Remove from active notifications
    this.activeNotifications.delete(id);
  }

  /**
   * Send event to all renderer processes
   * @param {string} channel - IPC channel
   * @param {*} data - Event data
   */
  sendToRenderer(channel, data) {
    const windows = windowManager.getAllWindows();
    windows.forEach((win) => {
      if (win.window && !win.window.isDestroyed()) {
        win.window.webContents.send(channel, data);
      }
    });
  }

  /**
   * Sanitize notification options
   * @param {Object} options - Raw options
   * @returns {Object} Sanitized options
   */
  sanitizeOptions(options) {
    return {
      title: this.sanitizeText(options.title),
      body: this.sanitizeText(options.body),
      icon: options.icon, // Path validation should be done before
      silent: Boolean(options.silent),
      tag: options.tag ? this.sanitizeText(options.tag) : undefined,
      actions: options.actions || [],
      timeoutMs: options.timeoutMs || 0,
      urgency: options.urgency || 'normal',
    };
  }

  /**
   * Sanitize text content (prevent HTML injection)
   * @param {string} text - Text to sanitize
   * @returns {string} Sanitized text
   */
  sanitizeText(text) {
    if (typeof text !== 'string') {
      return String(text);
    }
    // Remove HTML tags and limit length
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .substring(0, 500);
  }

  /**
   * Check rate limiting
   * @returns {boolean} True if allowed
   */
  checkRateLimit() {
    const now = Date.now();

    // Remove old timestamps
    this.notificationTimestamps = this.notificationTimestamps.filter(
      ts => now - ts < this.rateLimitWindow
    );

    // Check limit
    if (this.notificationTimestamps.length >= this.maxNotificationsPerWindow) {
      return false;
    }

    // Add current timestamp
    this.notificationTimestamps.push(now);
    return true;
  }

  /**
   * Add notification to history
   * @param {import('../common/types.js').NotificationInfo} entry - History entry
   */
  addToHistory(entry) {
    this.history.push(entry);

    // Trim history if too large
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
  }

  /**
   * Cleanup all notifications
   */
  cleanup() {
    for (const [id] of this.activeNotifications) {
      this.closeNotification(id);
    }
    logger.debug('Notification manager cleaned up');
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();
