/**
 * System Tray Manager
 * Manages system tray icon and context menu
 */
export declare class TrayManager {
    constructor();
    /**
     * Check if tray is created
     * @returns {boolean} True if created
     */
    isCreated(): boolean;
    /**
     * Create system tray icon
     * @param {Object} [options] - Tray creation options
     * @param {string} [options.tooltip] - Tooltip text
     * @param {Function} [options.onClick] - Click handler
     * @returns {boolean} Success status
     */
    createTray(options?: {}): boolean;
    /**
     * Get platform-specific tray icon path
     * @returns {string} Icon path
     */
    getTrayIconPath(): string;
    /**
     * Set tray icon (for dynamic updates)
     * @param {string} iconPath - Path to icon file
     * @returns {boolean} Success status
     */
    setIcon(iconPath: any): boolean;
    /**
     * Update tray icon based on status
     * @param {string} status - Status string (e.g. 'offline', 'error', 'sync')
     */
    updateStatus(status: any): boolean;
    /**
     * Set tray tooltip
     * @param {string} tooltip - Tooltip text
     * @returns {boolean} Success status
     */
    setTooltip(tooltip: any): boolean;
    /**
     * Set default tray context menu
     */
    setDefaultMenu(): void;
    /**
     * Set tray context menu
     * @param {import('../common/types.ts').TrayMenuItem[]} menuTemplate - Menu template
     * @returns {boolean} Success status
     */
    setContextMenu(menuTemplate: any): boolean;
    /**
     * Add menu item to tray
     * @param {import('../common/types.ts').TrayMenuItem} item - Menu item
     * @param {number} [position] - Insert position (default: append)
     * @returns {boolean} Success status
     */
    addMenuItem(item: any, position: any): boolean;
    /**
     * Update existing menu item
     * @param {string} id - Menu item ID
     * @param {Partial<import('../common/types.ts').TrayMenuItem>} updates - Updates
     * @returns {boolean} Success status
     */
    updateMenuItem(id: any, updates: any): boolean;
    /**
     * Find menu item by ID (recursive search for submenus)
     * @param {import('../common/types.ts').TrayMenuItem[]} items - Menu items
     * @param {string} id - Item ID to find
     * @returns {import('../common/types.ts').TrayMenuItem|null}
     */
    findMenuItem(items: any, id: any): any;
    /**
     * Show tray icon
     * @returns {boolean} Success status
     */
    show(): boolean;
    /**
     * Hide tray icon
     * @returns {boolean} Success status
     */
    hide(): boolean;
    /**
     * Check if tray is visible
     * @returns {boolean}
     */
    isVisible(): boolean;
    /**
     * Destroy tray icon
     */
    destroy(): void;
    /**
     * Emit tray event (placeholder for event handling)
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event: any, data: any): void;
}
export declare const trayManager: TrayManager;
