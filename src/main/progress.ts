import { logger } from './logger.ts';
import { windowManager } from './window-manager.ts';
import { ProgressOptions } from '../common/types.ts';
import { PROGRESS_STATE } from '../common/constants.ts';

/**
 * Progress Indicator Utilities
 * Manages taskbar/dock progress indicators
 */

/**
 * Set progress for a window
 * @param {number} value - Progress value (0.0-1.0, or -1 for indeterminate)
 * @param {ProgressOptions} [options] - Progress options
 * @returns {boolean} Success status
 */
export function setProgress(value: number, options: ProgressOptions = { value: 0 }) {
  try {
    // Validate progress value
    if (typeof value !== 'number' || (value < -1 || value > 1)) {
      logger.warn('Invalid progress value', { value });
      return false;
    }

    // Get target window
    let targetWindow: Electron.BrowserWindow | null | undefined;
    if (options.windowId) {
      targetWindow = windowManager.getWindow(options.windowId);
    } else {
      const mainWin = windowManager.getWindowByType('main');
      targetWindow = mainWin;
    }

    if (!targetWindow || targetWindow.isDestroyed()) {
      logger.warn('Target window not found or destroyed', { windowId: options.windowId });
      return false;
    }

    // Normalize value for indeterminate mode
    const progressValue = value === -1 ? 2 : value; // Electron uses 2 for indeterminate

    // Set progress
    targetWindow.setProgressBar(progressValue, {
      mode: (options.state || PROGRESS_STATE.NORMAL) as Electron.ProgressBarOptions['mode'],
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
export function clearProgress(windowId?: number) {
  try {
    // Get target window
    let targetWindow: Electron.BrowserWindow | null | undefined;
    if (windowId) {
      targetWindow = windowManager.getWindow(windowId);
    } else {
      const mainWin = windowManager.getWindowByType('main');
      targetWindow = mainWin;
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
  private lastUpdate: number;
  private minInterval: number;
  private pendingUpdate: NodeJS.Timeout | null;

  constructor() {
    this.lastUpdate = 0;
    this.minInterval = 100; // 10 updates per second max
    this.pendingUpdate = null;
  }

  /**
   * Set progress with throttling
   * @param {number} value - Progress value
   * @param {ProgressOptions} [options] - Progress options
   */
  set(value: number, options: ProgressOptions = { value: 0 }) {
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
  clear(windowId?: number) {
    if (this.pendingUpdate) {
      clearTimeout(this.pendingUpdate);
      this.pendingUpdate = null;
    }
    clearProgress(windowId);
  }
}

// Export singleton for throttled updates
export const throttledProgress = new ThrottledProgress();
