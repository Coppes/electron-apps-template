/**
 * Setup file association handlers
 * @param {import('./window-manager.ts').WindowManager} windowManager
 */
export declare function setupFileHandlers(windowManager: any): void;
/**
 * Parse argv to find an associated file path
 * Windows/Linux usually pass the file path as the last argument
 * @param {string[]} argv
 * @returns {string|null}
 */
export declare function findFileInArgv(argv: any): any;
