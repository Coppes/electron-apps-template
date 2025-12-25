/**
 * Context isolation best practices and patterns
 * This file documents the security patterns for context isolation
 */
/**
 * Context Isolation Best Practices
 *
 * 1. Always enable contextIsolation in webPreferences
 * 2. Always disable nodeIntegration
 * 3. Use contextBridge to expose limited API surface
 * 4. Never expose Node.js or Electron internals directly
 * 5. Validate all inputs from renderer before processing
 * 6. Use IPC for communication, never direct function calls
 */
/**
 * Recommended webPreferences configuration
 */
export declare const SECURE_WEB_PREFERENCES: {
    contextIsolation: boolean;
    nodeIntegration: boolean;
    enableRemoteModule: boolean;
    sandbox: boolean;
    webSecurity: boolean;
    allowRunningInsecureContent: boolean;
    experimentalFeatures: boolean;
};
/**
 * Security checklist for BrowserWindow creation
 * - [ ] contextIsolation: true
 * - [ ] nodeIntegration: false
 * - [ ] enableRemoteModule: false
 * - [ ] preload script uses contextBridge
 * - [ ] sandbox: true (if compatible)
 * - [ ] webSecurity: true
 * - [ ] CSP policy applied
 * - [ ] Navigation guards enabled
 */
/**
 * Example secure preload pattern:
 *
 * import { contextBridge, ipcRenderer } from 'electron';
 *
 * contextBridge.exposeInMainWorld('electronAPI', {
 *   // Only expose specific, validated methods
 *   invoke: (channel, ...args) => {
 *     // Whitelist channels
 *     const validChannels = ['allowed-channel-1', 'allowed-channel-2'];
 *     if (validChannels.includes(channel)) {
 *       return ipcRenderer.invoke(channel, ...args);
 *     }
 *     throw new Error(`Invalid channel: ${channel}`);
 *   }
 * });
 */
/**
 * Validate webPreferences for security compliance
 * @param {Object} webPreferences - WebPreferences object
 * @returns {Array<string>} Array of security warnings
 */
export declare function validateWebPreferences(webPreferences: any): any[];
/**
 * Get secure webPreferences with optional overrides
 * @param {Object} overrides - Optional overrides
 * @returns {Object} Secure webPreferences
 */
export declare function getSecureWebPreferences(overrides?: {}): {
    contextIsolation: boolean;
    nodeIntegration: boolean;
    enableRemoteModule: boolean;
    sandbox: boolean;
    webSecurity: boolean;
    allowRunningInsecureContent: boolean;
    experimentalFeatures: boolean;
};
