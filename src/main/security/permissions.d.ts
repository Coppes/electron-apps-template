/**
 * Check if permission type is allowed by configuration
 * @param {string} permission - Permission type
 * @returns {boolean}
 */
export declare function isPermissionAllowed(permission: any): boolean;
/**
 * Setup permission request handler for session
 * @param {Electron.Session} session - Session to setup handler for
 */
export declare function setupPermissionHandler(session: any): void;
/**
 * Setup permission check handler for session
 * @param {Electron.Session} session - Session to setup handler for
 */
export declare function setupPermissionCheckHandler(session: any): void;
/**
 * Setup device permission handler for session
 * Handles requests for specific devices (USB, serial, HID, Bluetooth)
 * @param {Electron.Session} session - Session to setup handler for
 */
export declare function setupDevicePermissionHandler(session: any): void;
/**
 * Setup all permission handlers for session
 * @param {Electron.Session} session - Session to setup handlers for
 */
export declare function setupAllPermissionHandlers(session: any): void;
