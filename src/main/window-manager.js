import { BrowserWindow, screen, app } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Store from 'electron-store';
import { WINDOW_TYPES, DEFAULT_WINDOW_CONFIG } from '../common/constants.js';
import { logger } from './logger.js';
import { isDevelopment } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Window Manager - Centralized window lifecycle and state management
 */
export class WindowManager {
  constructor() {
    this.windows = new Map();
    this.store = new Store({
      name: 'window-state',
    });
    logger.debug('WindowManager initialized');
  }

  /**
   * Create a new window with specified type and options
   * @param {string} type - Window type (main, settings, about)
   * @param {Object} [customOptions] - Custom window options
   * @returns {BrowserWindow} Created window instance
   */
  createWindow(type = WINDOW_TYPES.MAIN, customOptions = {}) {
    const { route, ...browserWindowOptions } = customOptions;
    logger.info(`Creating window of type: ${type}${route ? ` with route: ${route}` : ''}`);

    // Validate window type
    if (!Object.values(WINDOW_TYPES).includes(type)) {
      throw new Error(`Invalid window type: ${type}`);
    }

    // Get default config for window type
    const defaultConfig = DEFAULT_WINDOW_CONFIG[type] || DEFAULT_WINDOW_CONFIG[WINDOW_TYPES.MAIN];

    // Restore saved state if available
    const savedState = this.restoreState(type);

    // Merge configurations
    const windowOptions = {
      ...defaultConfig,
      ...savedState,
      ...savedState,
      ...customOptions,
      // Custom Title Bar: Remove frame on Windows/Linux (macOS uses titleBarStyle: hidden from config)
      frame: process.platform === 'darwin' ? true : false,
      titleBarOverlay: process.platform === 'win32' ? false : undefined, // We are building a custom React titlebar, so disable native overlay
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        enableRemoteModule: false,
        sandbox: true,
        preload: this.getPreloadPath(),
        ...browserWindowOptions.webPreferences,
      },
    };

    // Validate window bounds
    this.validateBounds(windowOptions);

    // Create window
    const window = new BrowserWindow(windowOptions);
    const windowId = window.id;

    // Track window
    this.windows.set(windowId, { window, type });
    logger.debug(`Window created with ID: ${windowId}`);

    // Restore maximized state
    if (savedState?.isMaximized) {
      window.maximize();
    }

    // Setup window event handlers
    this.setupWindowHandlers(windowId);

    // Load content
    this.loadContent(window, type, route);

    return window;
  }

  /**
   * Get preload script path
   * @returns {string} Preload script path
   */
  getPreloadPath() {
    if (app.isPackaged || process.env.E2E_TEST_BUILD) {
      return join(__dirname, '../preload/index.cjs');
    } else {
      return join(process.cwd(), 'out/preload/index.cjs');
    }
  }

  /**
   * Load content into window based on type
   * @param {BrowserWindow} window - Window instance
   * @param {string} _type - Window type (unused, reserved for future use)
   */
  loadContent(window, type, route) {
    if (type === WINDOW_TYPES.SPLASH) {
      if (isDevelopment() && !process.env.E2E_TEST_BUILD) {
        const url = 'http://localhost:5173/static/splash.html';
        window.loadURL(url);
        logger.debug(`Splash window loaded URL: ${url}`);
      } else {
        const splashPath = join(__dirname, '../renderer/static/splash.html');
        // When running from out/main/index.js in E2E, __dirname is .../out/main
        // We need .../out/renderer/static/splash.html
        // ../renderer points to .../out/renderer. Correct!
        window.loadFile(splashPath);
        logger.debug(`Splash window loaded file: ${splashPath}`);
      }
      return;
    }

    const devMode = isDevelopment();

    if (devMode && !process.env.E2E_TEST_BUILD) {
      const url = `http://localhost:5173${route ? '/#' + route : ''}`;
      window.loadURL(url);
      logger.debug(`Window loaded URL: ${url}`);
    } else {
      const filePath = join(__dirname, '../renderer/index.html');
      if (route) {
        window.loadFile(filePath, { hash: route });
      } else {
        window.loadFile(filePath);
      }
      logger.debug(`Window loaded file: ${filePath}${route ? '#' + route : ''}`);
    }
  }

  /**
   * Setup event handlers for window lifecycle
   * @param {number} windowId - Window ID
   */
  setupWindowHandlers(windowId) {
    const windowInfo = this.windows.get(windowId);
    if (!windowInfo) return;

    const { window, type } = windowInfo;

    // Save state on close
    window.on('close', () => {
      this.saveState(windowId);
      logger.debug(`Window ${windowId} (${type}) closing, state saved`);
    });

    // Remove from tracking when closed
    window.on('closed', () => {
      this.windows.delete(windowId);
      logger.debug(`Window ${windowId} closed and removed from tracking`);
    });

    // Log focus events
    window.on('focus', () => {
      logger.debug(`Window ${windowId} focused`);
    });

    // Log blur events
    window.on('blur', () => {
      logger.debug(`Window ${windowId} blurred`);
    });
  }

  /**
   * Save window state to persistent storage
   * @param {number} windowId - Window ID
   */
  saveState(windowId) {
    const windowInfo = this.windows.get(windowId);
    if (!windowInfo) return;

    const { window, type } = windowInfo;

    if (window.isDestroyed()) return;

    const bounds = window.getBounds();
    const state = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized: window.isMaximized(),
      isFullScreen: window.isFullScreen(),
    };

    this.store.set(`windowState.${type}`, state);
    logger.debug(`Window state saved for type: ${type}`, state);
  }

  /**
   * Restore window state from persistent storage
   * @param {string} type - Window type
   * @returns {Object|null} Restored state or null
   */
  restoreState(type) {
    const state = this.store.get(`windowState.${type}`);

    if (!state) {
      logger.debug(`No saved state found for window type: ${type}`);
      return null;
    }

    // Ensure window is visible on at least one display
    const visible = this.isVisibleOnDisplay(state);
    if (!visible) {
      logger.warn(`Saved window state is off-screen for type: ${type}, using defaults`);
      return null;
    }

    logger.debug(`Window state restored for type: ${type}`, state);
    return state;
  }

  /**
   * Check if window bounds are visible on any display
   * @param {Object} bounds - Window bounds {x, y, width, height}
   * @returns {boolean} True if visible on at least one display
   */
  isVisibleOnDisplay(bounds) {
    const displays = screen.getAllDisplays();

    return displays.some(display => {
      const displayBounds = display.bounds;
      // Check if window is at least partially visible on this display
      return (
        bounds.x + bounds.width > displayBounds.x &&
        bounds.x < displayBounds.x + displayBounds.width &&
        bounds.y + bounds.height > displayBounds.y &&
        bounds.y < displayBounds.y + displayBounds.height
      );
    });
  }

  /**
   * Validate window bounds
   * @param {Object} options - Window options
   * @throws {Error} If bounds are invalid
   */
  validateBounds(options) {
    if (options.width && options.width < 0) {
      throw new Error('Window width cannot be negative');
    }
    if (options.height && options.height < 0) {
      throw new Error('Window height cannot be negative');
    }
    if (options.minWidth && options.width && options.width < options.minWidth) {
      throw new Error('Window width cannot be less than minWidth');
    }
    if (options.minHeight && options.height && options.height < options.minHeight) {
      throw new Error('Window height cannot be less than minHeight');
    }
  }

  /**
   * Get window by ID
   * @param {number} windowId - Window ID
   * @returns {BrowserWindow|null} Window instance or null
   */
  getWindow(windowId) {
    const windowInfo = this.windows.get(windowId);
    return windowInfo ? windowInfo.window : null;
  }

  /**
   * Get all windows
   * @returns {Array<{id: number, window: BrowserWindow, type: string}>}
   */
  getAllWindows() {
    return Array.from(this.windows.entries()).map(([id, info]) => ({
      id,
      ...info,
    }));
  }

  /**
   * Close window by ID
   * @param {number} windowId - Window ID
   * @returns {boolean} True if window was closed
   */
  closeWindow(windowId) {
    const windowInfo = this.windows.get(windowId);
    if (!windowInfo) {
      logger.warn(`Cannot close window: Window ${windowId} not found`);
      return false;
    }

    const { window } = windowInfo;
    if (!window.isDestroyed()) {
      window.close();
      logger.info(`Window ${windowId} closed`);
      return true;
    }

    return false;
  }

  /**
   * Close all windows
   */
  closeAllWindows() {
    logger.info('Closing all windows');
    const windowIds = Array.from(this.windows.keys());

    windowIds.forEach(windowId => {
      this.closeWindow(windowId);
    });
  }

  /**
   * Save state for all windows
   */
  saveAllStates() {
    logger.info('Saving state for all windows');
    const windowIds = Array.from(this.windows.keys());

    windowIds.forEach(windowId => {
      this.saveState(windowId);
    });
  }

  /**
   * Focus window by ID
   * @param {number} windowId - Window ID
   */
  focusWindow(windowId) {
    const window = this.getWindow(windowId);
    if (window && !window.isDestroyed()) {
      if (window.isMinimized()) {
        window.restore();
      }
      window.focus();
      logger.debug(`Window ${windowId} focused`);
    }
  }

  /**
   * Get window by type (returns first match)
   * @param {string} type - Window type
   * @returns {BrowserWindow|null}
   */
  getWindowByType(type) {
    for (const [, info] of this.windows.entries()) {
      if (info.type === type) {
        return info.window;
      }
    }
    return null;
  }
  /**
   * Create an auxiliary window
   * @param {string} route - Route to load (e.g., '/popout/123')
   * @returns {BrowserWindow} Created window instance
   */
  createAuxiliaryWindow(route) {
    return this.createWindow(WINDOW_TYPES.AUXILIARY, { route });
  }
}

// Export singleton instance
export const windowManager = new WindowManager();
