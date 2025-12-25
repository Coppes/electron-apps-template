import { IPC_CHANNELS } from '../../../common/constants.ts';
/**
 * System Tray IPC Handlers
 */
/**
 * Create tray IPC handlers
 * @returns {Object} Handler map
 */
export declare function createTrayHandlers(): {
    [IPC_CHANNELS.TRAY_CREATE]: () => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.TRAY_DESTROY]: () => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.TRAY_CHECK_STATUS]: () => Promise<{
        created: boolean;
    }>;
    [IPC_CHANNELS.TRAY_SHOW]: () => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.TRAY_HIDE]: () => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.TRAY_SET_ICON]: (_: any, { iconPath }: {
        iconPath: any;
    }) => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.TRAY_SET_TOOLTIP]: (_: any, { tooltip }: {
        tooltip: any;
    }) => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.TRAY_SET_MENU]: (_: any, { menuTemplate }: {
        menuTemplate: any;
    }) => Promise<{
        success: boolean;
    }>;
};
export declare const trayHandlers: {
    [IPC_CHANNELS.TRAY_CREATE]: () => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.TRAY_DESTROY]: () => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.TRAY_CHECK_STATUS]: () => Promise<{
        created: boolean;
    }>;
    [IPC_CHANNELS.TRAY_SHOW]: () => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.TRAY_HIDE]: () => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.TRAY_SET_ICON]: (_: any, { iconPath }: {
        iconPath: any;
    }) => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.TRAY_SET_TOOLTIP]: (_: any, { tooltip }: {
        tooltip: any;
    }) => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.TRAY_SET_MENU]: (_: any, { menuTemplate }: {
        menuTemplate: any;
    }) => Promise<{
        success: boolean;
    }>;
};
