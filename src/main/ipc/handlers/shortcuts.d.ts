import { IPC_CHANNELS } from '../../../common/constants.ts';
/**
 * Global Shortcuts IPC Handlers
 */
/**
 * Create shortcut IPC handlers
 * @returns {Object} Handler map
 */
export declare function createShortcutHandlers(): {
    [IPC_CHANNELS.SHORTCUT_REGISTER]: ({ accelerator, description }: {
        accelerator: any;
        description: any;
    }) => Promise<{
        success: boolean;
        accelerator: string;
    }>;
    [IPC_CHANNELS.SHORTCUT_UNREGISTER]: ({ accelerator }: {
        accelerator: any;
    }) => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.SHORTCUT_UNREGISTER_ALL]: () => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.SHORTCUT_IS_REGISTERED]: ({ accelerator }: {
        accelerator: any;
    }) => Promise<{
        registered: boolean;
    }>;
    [IPC_CHANNELS.SHORTCUT_LIST_ACTIVE]: () => Promise<{
        shortcuts: any[];
    }>;
};
export declare const shortcutHandlers: {
    [IPC_CHANNELS.SHORTCUT_REGISTER]: ({ accelerator, description }: {
        accelerator: any;
        description: any;
    }) => Promise<{
        success: boolean;
        accelerator: string;
    }>;
    [IPC_CHANNELS.SHORTCUT_UNREGISTER]: ({ accelerator }: {
        accelerator: any;
    }) => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.SHORTCUT_UNREGISTER_ALL]: () => Promise<{
        success: boolean;
    }>;
    [IPC_CHANNELS.SHORTCUT_IS_REGISTERED]: ({ accelerator }: {
        accelerator: any;
    }) => Promise<{
        registered: boolean;
    }>;
    [IPC_CHANNELS.SHORTCUT_LIST_ACTIVE]: () => Promise<{
        shortcuts: any[];
    }>;
};
