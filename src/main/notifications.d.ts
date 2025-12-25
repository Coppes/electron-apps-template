/**
 * Native OS Notifications Manager
 */
export declare class NotificationManager {
    constructor();
    /**
     * Check if notifications are allowed
     * @returns {boolean} True if allowed
     */
    checkPermission(): boolean;
    /**
     * Request notification permission
     * @returns {Promise<boolean>} True if granted
     */
    requestPermission(): Promise<boolean>;
    /**
     * Show a native notification
     * @param {import('../common/types.ts').NotificationOptions} options - Notification options
     * @returns {Promise<string>} Notification ID
     */
    showNotification(options: any): Promise<string>;
    /**
     * Close a notification
     * @param {string} id - Notification ID
     * @returns {boolean} Success status
     */
    closeNotification(id: any): boolean;
    /**
     * Get notification history
     * @param {number} [limit=50] - Maximum number of entries to return
     * @returns {import('../common/types.ts').NotificationInfo[]}
     */
    getHistory(limit?: number): any;
    /**
     * Clear notification history
     */
    clearHistory(): void;
    /**
     * Handle notification click
     * @param {string} id - Notification ID
     * @param {Object} options - Original notification options
     */
    handleNotificationClick(id: any, options: any): void;
    /**
     * Handle notification action button click
     * @param {string} id - Notification ID
     * @param {number} actionIndex - Action button index
     * @param {Object} options - Original notification options
     */
    handleNotificationAction(id: any, actionIndex: any, options: any): void;
    /**
     * Handle notification close
     * @param {string} id - Notification ID
     */
    handleNotificationClose(id: any): void;
    /**
     * Send event to all renderer processes
     * @param {string} channel - IPC channel
     * @param {*} data - Event data
     */
    sendToRenderer(channel: any, data: any): void;
    /**
     * Sanitize notification options
     * @param {Object} options - Raw options
     * @returns {Object} Sanitized options
     */
    sanitizeOptions(options: any): {
        title: string;
        body: string;
        icon: any;
        silent: boolean;
        tag: string;
        actions: any;
        timeoutMs: any;
        urgency: any;
    };
    /**
     * Sanitize text content (prevent HTML injection)
     * @param {string} text - Text to sanitize
     * @returns {string} Sanitized text
     */
    sanitizeText(text: any): string;
    /**
     * Check rate limiting
     * @returns {boolean} True if allowed
     */
    checkRateLimit(): boolean;
    /**
     * Add notification to history
     * @param {import('../common/types.ts').NotificationInfo} entry - History entry
     */
    addToHistory(entry: any): void;
    /**
     * Cleanup all notifications
     */
    cleanup(): void;
}
export declare const notificationManager: NotificationManager;
