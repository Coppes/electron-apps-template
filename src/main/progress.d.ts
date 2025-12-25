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
export declare function setProgress(value: any, options?: {}): boolean;
/**
 * Clear progress for a window
 * @param {number} [windowId] - Window ID (defaults to main window)
 * @returns {boolean} Success status
 */
export declare function clearProgress(windowId: any): boolean;
/**
 * Set progress with automatic throttling
 * Useful for high-frequency updates
 */
declare class ThrottledProgress {
    constructor();
    /**
     * Set progress with throttling
     * @param {number} value - Progress value
     * @param {Object} [options] - Progress options
     */
    set(value: any, options?: {}): void;
    /**
     * Clear progress
     * @param {number} [windowId] - Window ID
     */
    clear(windowId: any): void;
}
export declare const throttledProgress: ThrottledProgress;
export {};
