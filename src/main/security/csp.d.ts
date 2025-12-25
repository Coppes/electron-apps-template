/**
 * Content Security Policy (CSP) configuration
 */
/**
 * Production CSP policy - Strict security
 * @type {import('../../common/types.ts').CSPPolicy}
 */
export declare const CSP_POLICY_PRODUCTION: {
    'default-src': string[];
    'script-src': string[];
    'style-src': string[];
    'img-src': string[];
    'font-src': string[];
    'connect-src': string[];
    'object-src': string[];
    'base-uri': string[];
    'form-action': string[];
    'frame-ancestors': string[];
    'upgrade-insecure-requests': any[];
};
/**
 * Development CSP policy - Relaxed for hot reload
 * @type {import('../../common/types.ts').CSPPolicy}
 */
export declare const CSP_POLICY_DEVELOPMENT: {
    'default-src': string[];
    'script-src': string[];
    'style-src': string[];
    'img-src': string[];
    'font-src': string[];
    'connect-src': string[];
    'object-src': string[];
};
/**
 * Convert CSP policy object to header string
 * @param {Object} policy - CSP policy object
 * @returns {string} CSP header value
 */
export declare function buildCSPHeader(policy: any): string;
/**
 * Get appropriate CSP policy for current environment
 * @returns {Object} CSP policy object
 */
export declare function getCSPPolicy(): {
    'default-src': string[];
    'script-src': string[];
    'style-src': string[];
    'img-src': string[];
    'font-src': string[];
    'connect-src': string[];
    'object-src': string[];
};
/**
 * Get CSP header string for current environment
 * @returns {string} CSP header value
 */
export declare function getCSPHeader(): string;
/**
 * Apply CSP to window session
 * @param {Electron.WebContents} webContents - Window web contents
 */
export declare function applyCSP(webContents: any): void;
