import { IPC_CHANNELS } from '../../../common/constants.ts';
/**
 * Window management IPC handlers
 */
/**
 * Create window handler
 * @param {WindowManager} windowManager - Window manager instance
 */
export declare function createWindowHandler(windowManager: any): (event: any, { type, options }: {
    type: any;
    options?: {};
}) => Promise<{
    success: boolean;
}>;
/**
 * Close window handler
 * @param {WindowManager} windowManager - Window manager instance
 */
export declare function closeWindowHandler(windowManager: any): (event: any, { windowId }?: {}) => Promise<{
    success: boolean;
}>;
/**
 * Minimize window handler
 */
export declare function minimizeWindowHandler(): (event: any, { windowId }?: {}) => Promise<{
    success: boolean;
}>;
/**
 * Maximize/unmaximize window handler
 */
export declare function maximizeWindowHandler(): (event: any, { windowId }?: {}) => Promise<{
    success: boolean;
}>;
/**
 * Get window state handler
 * @param {WindowManager} windowManager - Window manager instance
 */
export declare function getWindowStateHandler(windowManager: any): (event: any, { windowId }?: {}) => Promise<{
    success: boolean;
}>;
/**
 * Get display info handler
 */
export declare function getDisplayHandler(): (event: any) => Promise<{
    success: boolean;
}>;
/**
 * Create all window handlers
 * @param {WindowManager} windowManager - Window manager instance
 * @returns {Object} Handlers keyed by channel
 */
export declare function createWindowHandlers(windowManager: any): {
    [IPC_CHANNELS.WINDOW_CREATE]: (event: any, { type, options }: {
        type: any;
        options?: {};
    }) => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.WINDOW_CLOSE]: (event: any, { windowId }?: {}) => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.WINDOW_MINIMIZE]: (event: any, { windowId }?: {}) => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.WINDOW_MAXIMIZE]: (event: any, { windowId }?: {}) => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.WINDOW_GET_STATE]: (event: any, { windowId }?: {}) => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.PROGRESS_SET]: (event: any, { value, windowId, state }: {
        value: any;
        windowId: any;
        state: any;
    }) => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.PROGRESS_CLEAR]: (event: any, { windowId }?: {}) => Promise<{
        success: boolean;
    }>;
    'window:get-display': (event: any) => Promise<{
        success: boolean;
    }>;
};
