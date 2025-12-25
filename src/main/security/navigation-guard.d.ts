/**
 * Navigation security guards to prevent unauthorized navigation
 */
/**
 * Check if URL is allowed for navigation
 * @param {string} url - URL to check
 * @returns {boolean} True if allowed
 */
export declare function isAllowedOrigin(url: any): boolean;
/**
 * Setup navigation guard for window
 * @param {Electron.WebContents} webContents - Window web contents
 */
export declare function setupNavigationGuard(webContents: any): void;
/**
 * Setup window open handler for secure new window creation
 * @param {Electron.WebContents} webContents - Window web contents
 */
export declare function setupWindowOpenHandler(webContents: any): void;
/**
 * Setup external link handler
 * Opens external links in system browser instead of Electron
 * @param {Electron.WebContents} webContents - Window web contents
 */
export declare function setupExternalLinkHandler(webContents: any): void;
/**
 * Setup all security guards for window
 * @param {Electron.WebContents} webContents - Window web contents
 */
export declare function setupSecurityGuards(webContents: any): void;
