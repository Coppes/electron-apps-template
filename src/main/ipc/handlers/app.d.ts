import { IPC_CHANNELS } from '../../../common/constants.ts';
/**
 * App and system info IPC handlers
 */
/**
 * Get app and runtime versions
 */
export declare function getVersionHandler(): () => Promise<{
    success: boolean;
    error: any;
    code: string;
} | {
    electron: string;
    chrome: string;
    node: string;
    v8: string;
    app: string;
}>;
/**
 * Get app path
 */
export declare function getPathHandler(): (event: any, { name }: {
    name: any;
}) => Promise<{
    success: boolean;
    error: any;
    code: string;
} | {
    path: string;
}>;
/**
 * Quit application
 */
export declare function quitHandler(): () => Promise<{
    success: boolean;
}>;
/**
 * Relaunch application
 */
export declare function relaunchHandler(): () => Promise<{
    success: boolean;
}>;
/**
 * Get system platform info
 */
export declare function getPlatformHandler(): () => Promise<{
    success: boolean;
    error: any;
    code: string;
} | {
    platform: NodeJS.Platform;
    arch: NodeJS.Architecture;
}>;
/**
 * Check for updates
 */
export declare function checkForUpdatesHandler(): () => Promise<{
    success: boolean;
    error: any;
    code: string;
} | {
    available: boolean;
    version: any;
} | {
    available: boolean;
    version?: undefined;
}>;
/**
 * Install update and restart
 */
export declare function installUpdateHandler(): () => Promise<{
    success: boolean;
}>;
/**
 * Check if app is packaged
 */
export declare function isPackagedHandler(): () => Promise<{
    success: boolean;
    error: any;
    code: string;
} | {
    isPackaged: boolean;
}>;
/**
 * Create all app and system handlers
 * @returns {Object} Handlers keyed by channel
 */
export declare function createAppHandlers(): {
    [IPC_CHANNELS.APP_GET_VERSION]: () => Promise<{
        success: boolean;
        error: any;
        code: string;
    } | {
        electron: string;
        chrome: string;
        node: string;
        v8: string;
        app: string;
    }>;
    [IPC_CHANNELS.APP_GET_PATH]: (event: any, { name }: {
        name: any;
    }) => Promise<{
        success: boolean;
        error: any;
        code: string;
    } | {
        path: string;
    }>;
    [IPC_CHANNELS.APP_QUIT]: () => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.APP_RELAUNCH]: () => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.SYSTEM_GET_PLATFORM]: () => Promise<{
        success: boolean;
        error: any;
        code: string;
    } | {
        platform: NodeJS.Platform;
        arch: NodeJS.Architecture;
    }>;
    [IPC_CHANNELS.APP_CHECK_FOR_UPDATES]: () => Promise<{
        success: boolean;
        error: any;
        code: string;
    } | {
        available: boolean;
        version: any;
    } | {
        available: boolean;
        version?: undefined;
    }>;
    [IPC_CHANNELS.APP_INSTALL_UPDATE]: () => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.RECENT_DOCS_ADD]: (event: any, { filePath }: {
        filePath: any;
    }) => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.RECENT_DOCS_CLEAR]: () => Promise<{
        success: boolean;
    }>;
    'app:is-packaged': () => Promise<{
        success: boolean;
        error: any;
        code: string;
    } | {
        isPackaged: boolean;
    }>;
};
