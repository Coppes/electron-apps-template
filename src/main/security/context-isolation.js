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
export const SECURE_WEB_PREFERENCES = {
  contextIsolation: true,
  nodeIntegration: false,
  enableRemoteModule: false,
  sandbox: true, // Enable when possible (some features require false)
  webSecurity: true,
  allowRunningInsecureContent: false,
  experimentalFeatures: false,
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
export function validateWebPreferences(webPreferences) {
  const warnings = [];

  if (!webPreferences.contextIsolation) {
    warnings.push('contextIsolation should be enabled');
  }

  if (webPreferences.nodeIntegration) {
    warnings.push('nodeIntegration should be disabled');
  }

  if (webPreferences.enableRemoteModule) {
    warnings.push('enableRemoteModule should be disabled');
  }

  if (!webPreferences.webSecurity) {
    warnings.push('webSecurity should be enabled');
  }

  if (webPreferences.allowRunningInsecureContent) {
    warnings.push('allowRunningInsecureContent should be disabled');
  }

  return warnings;
}

/**
 * Get secure webPreferences with optional overrides
 * @param {Object} overrides - Optional overrides
 * @returns {Object} Secure webPreferences
 */
export function getSecureWebPreferences(overrides = {}) {
  return {
    ...SECURE_WEB_PREFERENCES,
    ...overrides,
    // These should never be overridden
    contextIsolation: true,
    nodeIntegration: false,
    enableRemoteModule: false,
  };
}
