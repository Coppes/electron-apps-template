/**
 * Common constants shared between main and renderer processes
 */
export declare const IPC_CHANNELS: {
    WINDOW_CREATE: string;
    WINDOW_CLOSE: string;
    WINDOW_MINIMIZE: string;
    WINDOW_MAXIMIZE: string;
    WINDOW_FOCUS: string;
    WINDOW_GET_STATE: string;
    STORE_GET: string;
    STORE_SET: string;
    STORE_DELETE: string;
    STORE_CLEAR: string;
    STORE_HAS: string;
    STORE_CHANGED: string;
    SECURE_STORE_SET: string;
    SECURE_STORE_GET: string;
    SECURE_STORE_DELETE: string;
    SECURE_STORE_HAS: string;
    SECURE_STORE_IS_AVAILABLE: string;
    FILE_DROP: string;
    FILE_DRAG_START: string;
    FILE_VALIDATE_PATH: string;
    DATA_CREATE_BACKUP: string;
    DATA_LIST_BACKUPS: string;
    DATA_RESTORE_BACKUP: string;
    DATA_DELETE_BACKUP: string;
    DATA_IMPORT: string;
    DATA_EXPORT: string;
    DATA_LIST_FORMATS: string;
    FILE_WATCH_START: string;
    FILE_WATCH_STOP: string;
    FILE_CHANGED: string;
    CONNECTIVITY_STATUS: string;
    SYNC_QUEUE_ADD: string;
    SYNC_QUEUE_PROCESS: string;
    SYNC_QUEUE_STATUS: string;
    SYNC_STATUS_CHANGED: string;
    DIALOG_OPEN_FILE: string;
    DIALOG_SAVE_FILE: string;
    DIALOG_MESSAGE: string;
    DIALOG_ERROR: string;
    APP_GET_VERSION: string;
    APP_GET_PATH: string;
    APP_QUIT: string;
    APP_RELAUNCH: string;
    APP_CHECK_FOR_UPDATES: string;
    APP_INSTALL_UPDATE: string;
    APP_WHATS_NEW: string;
    SYSTEM_GET_PLATFORM: string;
    COUNTER_UPDATED: string;
    UPDATE_AVAILABLE: string;
    UPDATE_DOWNLOADED: string;
    UPDATE_ERROR: string;
    UPDATE_PROGRESS: string;
    LOG_DEBUG: string;
    LOG_INFO: string;
    LOG_WARN: string;
    LOG_ERROR: string;
    TRAY_CREATE: string;
    TRAY_DESTROY: string;
    TRAY_CHECK_STATUS: string;
    TRAY_SHOW: string;
    TRAY_HIDE: string;
    TRAY_SET_ICON: string;
    TRAY_SET_TOOLTIP: string;
    TRAY_SET_MENU: string;
    TRAY_CLICKED: string;
    TRAY_MENU_ITEM_CLICKED: string;
    SHORTCUT_REGISTER: string;
    SHORTCUT_UNREGISTER: string;
    SHORTCUT_UNREGISTER_ALL: string;
    SHORTCUT_IS_REGISTERED: string;
    SHORTCUT_LIST_ACTIVE: string;
    SHORTCUT_TRIGGERED: string;
    PROGRESS_SET: string;
    PROGRESS_CLEAR: string;
    RECENT_DOCS_ADD: string;
    RECENT_DOCS_CLEAR: string;
    NOTIFICATION_SHOW: string;
    NOTIFICATION_CLOSE: string;
    NOTIFICATION_GET_HISTORY: string;
    NOTIFICATION_CLICKED: string;
    NOTIFICATION_ACTION_CLICKED: string;
    NOTIFICATION_ACTIONS: string;
    NOTIFICATION_CHECK_PERMISSION: string;
    NOTIFICATION_REQUEST_PERMISSION: string;
    I18N_SET_LANGUAGE: string;
    I18N_GET_LANGUAGE: string;
    DEEP_LINK_RECEIVED: string;
    PLUGINS_GET_ALL: string;
};
export declare const WINDOW_TYPES: {
    MAIN: string;
    SETTINGS: string;
    ABOUT: string;
    SPLASH: string;
    AUXILIARY: string;
};
export declare const DEFAULT_WINDOW_CONFIG: {
    [WINDOW_TYPES.MAIN]: {
        width: number;
        height: number;
        minWidth: number;
        minHeight: number;
        title: string;
        titleBarStyle: string;
        trafficLightPosition: {
            x: number;
            y: number;
        };
    };
    [WINDOW_TYPES.SETTINGS]: {
        width: number;
        height: number;
        minWidth: number;
        minHeight: number;
        title: string;
        resizable: boolean;
    };
    [WINDOW_TYPES.ABOUT]: {
        width: number;
        height: number;
        minWidth: number;
        minHeight: number;
        maxWidth: number;
        maxHeight: number;
        title: string;
        resizable: boolean;
    };
    [WINDOW_TYPES.SPLASH]: {
        width: number;
        height: number;
        minWidth: number;
        minHeight: number;
        frame: boolean;
        transparent: boolean;
        resizable: boolean;
        movable: boolean;
        minimizable: boolean;
        maximizable: boolean;
        alwaysOnTop: boolean;
        center: boolean;
        title: string;
        skipTaskbar: boolean;
    };
    [WINDOW_TYPES.AUXILIARY]: {
        width: number;
        height: number;
        minWidth: number;
        minHeight: number;
        title: string;
        titleBarStyle: string;
        trafficLightPosition: {
            x: number;
            y: number;
        };
    };
};
export declare const LOG_LEVELS: {
    DEBUG: string;
    INFO: string;
    WARN: string;
    ERROR: string;
};
export declare const ENV: {
    DEVELOPMENT: string;
    PRODUCTION: string;
    TEST: string;
};
export declare const APP_PROTOCOL = "electronapp";
export declare const PATHS: {
    USER_DATA: string;
    APP_DATA: string;
    TEMP: string;
    LOGS: string;
};
export declare const TEST_MODE: {
    ENABLED: string;
};
export declare const PROGRESS_STATE: {
    NORMAL: string;
    PAUSED: string;
    ERROR: string;
    INDETERMINATE: string;
};
export declare const PLATFORM: {
    MACOS: string;
    WINDOWS: string;
    LINUX: string;
};
/**
 * Check if running on macOS
 * @returns {boolean}
 */
export declare function isMacOS(): boolean;
/**
 * Check if running on Windows
 * @returns {boolean}
 */
export declare function isWindows(): boolean;
/**
 * Check if running on Linux
 * @returns {boolean}
 */
export declare function isLinux(): boolean;
