import { BrowserWindow } from 'electron';
/**
 * Window Manager - Centralized window lifecycle and state management
 */
export declare class WindowManager {
    constructor();
    /**
     * Create a new window with specified type and options
     * @param {string} type - Window type (main, settings, about)
     * @param {Object} [customOptions] - Custom window options
     * @returns {BrowserWindow} Created window instance
     */
    createWindow(type?: string, customOptions?: {}): BrowserWindow;
    /**
     * Get preload script path
     * @returns {string} Preload script path
     */
    getPreloadPath(): string;
    /**
     * Load content into window based on type
     * @param {BrowserWindow} window - Window instance
     * @param {string} _type - Window type (unused, reserved for future use)
     */
    loadContent(window: any, type: any, route: any): void;
    /**
     * Setup event handlers for window lifecycle
     * @param {number} windowId - Window ID
     */
    setupWindowHandlers(windowId: any): void;
    /**
     * Save window state to persistent storage
     * @param {number} windowId - Window ID
     */
    saveState(windowId: any): void;
    /**
     * Restore window state from persistent storage
     * @param {string} type - Window type
     * @returns {Object|null} Restored state or null
     */
    restoreState(type: any): any;
    /**
     * Check if window bounds are visible on any display
     * @param {Object} bounds - Window bounds {x, y, width, height}
     * @returns {boolean} True if visible on at least one display
     */
    isVisibleOnDisplay(bounds: any): boolean;
    /**
     * Validate window bounds
     * @param {Object} options - Window options
     * @throws {Error} If bounds are invalid
     */
    validateBounds(options: any): void;
    /**
     * Get window by ID
     * @param {number} windowId - Window ID
     * @returns {BrowserWindow|null} Window instance or null
     */
    getWindow(windowId: any): any;
    /**
     * Get all windows
     * @returns {Array<{id: number, window: BrowserWindow, type: string}>}
     */
    getAllWindows(): any[];
    /**
     * Close window by ID
     * @param {number} windowId - Window ID
     * @returns {boolean} True if window was closed
     */
    closeWindow(windowId: any): boolean;
    /**
     * Close all windows
     */
    closeAllWindows(): void;
    /**
     * Save state for all windows
     */
    saveAllStates(): void;
    /**
     * Focus window by ID
     * @param {number} windowId - Window ID
     */
    focusWindow(windowId: any): void;
    /**
     * Get window by type (returns first match)
     * @param {string} type - Window type
     * @returns {BrowserWindow|null}
     */
    getWindowByType(type: any): any;
    /**
     * Create an auxiliary window
     * @param {string} route - Route to load (e.g., '/popout/123')
     * @returns {BrowserWindow} Created window instance
     */
    createAuxiliaryWindow(route: any): BrowserWindow;
}
export declare const windowManager: WindowManager;
