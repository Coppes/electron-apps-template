/**
 * Global Shortcuts Manager
 * Manages application-wide keyboard shortcuts
 */
export declare class ShortcutManager {
    constructor();
    /**
     * Register a global shortcut
     * @param {string} accelerator - Keyboard accelerator (e.g., "CommandOrControl+Shift+K")
     * @param {Function} handler - Callback function when shortcut is triggered
     * @param {string} [description] - Shortcut description
     * @returns {boolean} Success status
     */
    register(accelerator: any, handler: any, description?: string): boolean;
    /**
     * Unregister a global shortcut
     * @param {string} accelerator - Keyboard accelerator
     * @returns {boolean} Success status
     */
    unregister(accelerator: any): boolean;
    /**
     * Unregister all shortcuts
     * @returns {boolean} Success status
     */
    unregisterAll(): boolean;
    /**
     * Check if a shortcut is registered
     * @param {string} accelerator - Keyboard accelerator
     * @returns {boolean}
     */
    isRegistered(accelerator: any): boolean;
    /**
     * List all active shortcuts
     * @returns {import('../common/types.ts').ShortcutInfo[]}
     */
    listActive(): any[];
    /**
     * Validate accelerator format
     * @param {string} accelerator - Accelerator string
     * @returns {boolean}
     */
    isValidAccelerator(accelerator: any): boolean;
    /**
     * Check if shortcut is in whitelist
     * @param {string} accelerator - Accelerator string
     * @returns {boolean}
     */
    isWhitelisted(accelerator: any): any;
    /**
     * Check if shortcut is reserved
     * @param {string} accelerator - Accelerator string
     * @returns {boolean}
     */
    isReservedShortcut(accelerator: any): any;
    /**
     * Add shortcut to whitelist
     * @param {string} accelerator - Accelerator to whitelist
     */
    addToWhitelist(accelerator: any): void;
    /**
     * Cleanup all shortcuts (called on app quit)
     */
    cleanup(): void;
}
export declare const shortcutManager: ShortcutManager;
