/**
 * Application Menu - Platform-specific menu creation and management
 */
/**
 * Create application menu template
 * @param {WindowManager} windowManager - Window manager instance
 * @returns {Array} Menu template
 */
export declare function createMenuTemplate(windowManager: any): ({
    label: string;
    submenu: ({
        label: string;
        accelerator: string;
        click: (_item: any, focusedWindow: any) => void;
        type?: undefined;
        role?: undefined;
        submenu?: undefined;
    } | {
        type: string;
        label?: undefined;
        accelerator?: undefined;
        click?: undefined;
        role?: undefined;
        submenu?: undefined;
    } | {
        label: string;
        click: (_item: any, focusedWindow: any) => void;
        accelerator?: undefined;
        type?: undefined;
        role?: undefined;
        submenu?: undefined;
    } | {
        label: string;
        role: string;
        submenu: {
            label: string;
            role: string;
        }[];
        accelerator?: undefined;
        click?: undefined;
        type?: undefined;
    } | {
        role: string;
        label?: undefined;
        accelerator?: undefined;
        click?: undefined;
        type?: undefined;
        submenu?: undefined;
    })[];
    role?: undefined;
} | {
    label: string;
    submenu: ({
        role: string;
        type?: undefined;
        label?: undefined;
        submenu?: undefined;
    } | {
        type: string;
        role?: undefined;
        label?: undefined;
        submenu?: undefined;
    } | {
        label: string;
        submenu: {
            role: string;
        }[];
        role?: undefined;
        type?: undefined;
    })[];
    role?: undefined;
} | {
    role: string;
    submenu: ({
        type: string;
        label?: undefined;
        click?: undefined;
    } | {
        label: string;
        click: (_item: any, focusedWindow: any) => void;
        type?: undefined;
    })[];
    label?: undefined;
})[];
/**
 * Setup application menu
 * @param {WindowManager} windowManager - Window manager instance
 */
export declare function setupMenu(windowManager: any): void;
/**
 * Add custom menu items to existing menu
 * @param {Array} _customItems - Custom menu items to add (reserved for future use)
 */
export declare function addCustomMenuItems(_customItems: any): void;
