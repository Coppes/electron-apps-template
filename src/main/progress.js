import { logger } from './logger.js';
import { windowManager } from './window-manager.js';
import { PROGRESS_STATE } from '../common/constants.js';

/**
 * Progress Indicator Utilities
 * Manages taskbar/dock progress indicators
 */

/**
 * Set progress for a window
 * @param {number} value - Progress value (0.0-1.0, or -1 for indeterminate)
 * @param {Object} [options] - Progress options
 * @param {number} [options.windowId] - Window ID (defaults to main window)
 * @param {'normal'|'paused'|'error'|'indeterminate'} [options.state] - Progress state (Windows only)
 * @returns {boolean} Success status
 */
export function setProgress(value, options = {}) {
  try {
    // Validate progress value
    if (typeof value !== 'number' || (value < -1 || value > 1)) {
      logger.warn('Invalid progress value', { value });
      return false;
    }

    // Get target window
    let targetWindow;
    if (options.windowId) {
      const win = windowManager.getWindow(options.windowId);
      targetWindow = win?.window;
    } else {
      const mainWin = windowManager.getWindowByType('main');
      targetWindow = mainWin?.window;
    }

    if (!targetWindow || targetWindow.isDestroyed()) {
      logger.warn('Target window not found or destroyed', { windowId: options.windowId });
      return false;
    }

    // Normalize value for indeterminate mode
    const progressValue = value === -1 ? 2 : value; // Electron uses 2 for indeterminate

    // Set progress
    targetWindow.setProgressBar(progressValue, {
      mode: options.state || PROGRESS_STATE.NORMAL,
    });

    logger.debug('Progress set', { 
      value, 
      state: options.state, 
      windowId: options.windowId 
    });
    return true;
  } catch (error) {
    logger.error('Failed to set progress', error);
    return false;
  }
}

/**
 * Clear progress for a window
 * @param {number} [windowId] - Window ID (defaults to main window)
 * @returns {boolean} Success status
 */
export function clearProgress(windowId) {
  try {
    // Get target window
    let targetWindow;
    if (windowId) {
      const win = windowManager.getWindow(windowId);
      targetWindow = win?.window;
    } else {
      const mainWin = windowManager.getWindowByType('main');
      targetWindow = mainWin?.window;
    }

    if (!targetWindow || targetWindow.isDestroyed()) {
      logger.warn('Target window not found or destroyed', { windowId });
      return false;
    }

    // Clear progress
    targetWindow.setProgressBar(-1);
    logger.debug('Progress cleared', { windowId });
    return true;
  } catch (error) {
    logger.error('Failed to clear progress', error);
    return false;
  }
}

/**
 * Set progress with automatic throttling
 * Useful for high-frequency updates
 */
class ThrottledProgress {
  constructor() {
    this.lastUpdate = 0;
    this.minInterval = 100; // 10 updates per second max
    this.pendingUpdate = null;
  }

  /**
   * Set progress with throttling
   * @param {number} value - Progress value
   * @param {Object} [options] - Progress options
   */
  set(value, options = {}) {
    const now = Date.now();
    const timeSinceLastUpdate = now - this.lastUpdate;

    if (timeSinceLastUpdate >= this.minInterval) {
      // Update immediately
      setProgress(value, options);
      this.lastUpdate = now;
      this.pendingUpdate = null;
    } else {
      // Schedule update
      if (this.pendingUpdate) {
        clearTimeout(this.pendingUpdate);
      }

      this.pendingUpdate = setTimeout(() => {
        setProgress(value, options);
        this.lastUpdate = Date.now();
        this.pendingUpdate = null;
      }, this.minInterval - timeSinceLastUpdate);
    }
  }

  /**
   * Clear progress
   * @param {number} [windowId] - Window ID
   */
  clear(windowId) {
    if (this.pendingUpdate) {
      clearTimeout(this.pendingUpdate);
      this.pendingUpdate = null;
    }
    clearProgress(windowId);
  }
}

// Export singleton for throttled updates
export const throttledProgress = new ThrottledProgress();
