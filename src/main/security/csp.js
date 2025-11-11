import { isDevelopment } from '../config.js';

/**
 * Content Security Policy (CSP) configuration
 */

/**
 * Production CSP policy - Strict security
 * @type {import('../../common/types.js').CSPPolicy}
 */
export const CSP_POLICY_PRODUCTION = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"], // Tailwind requires unsafe-inline
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

/**
 * Development CSP policy - Relaxed for hot reload
 * @type {import('../../common/types.js').CSPPolicy}
 */
export const CSP_POLICY_DEVELOPMENT = {
  'default-src': ["'self'", 'http://localhost:*', 'ws://localhost:*'],
  'script-src': ["'self'", "'unsafe-eval'", 'http://localhost:*'],
  'style-src': ["'self'", "'unsafe-inline'", 'http://localhost:*'],
  'img-src': ["'self'", 'data:', 'http://localhost:*', 'https:'],
  'font-src': ["'self'", 'data:', 'http://localhost:*'],
  'connect-src': ["'self'", 'http://localhost:*', 'ws://localhost:*', 'wss://localhost:*'],
  'object-src': ["'none'"],
};

/**
 * Convert CSP policy object to header string
 * @param {Object} policy - CSP policy object
 * @returns {string} CSP header value
 */
export function buildCSPHeader(policy) {
  return Object.entries(policy)
    .map(([directive, values]) => {
      if (values.length === 0) {
        return directive;
      }
      return `${directive} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Get appropriate CSP policy for current environment
 * @returns {Object} CSP policy object
 */
export function getCSPPolicy() {
  return isDevelopment() ? CSP_POLICY_DEVELOPMENT : CSP_POLICY_PRODUCTION;
}

/**
 * Get CSP header string for current environment
 * @returns {string} CSP header value
 */
export function getCSPHeader() {
  const policy = getCSPPolicy();
  return buildCSPHeader(policy);
}

/**
 * Apply CSP to window session
 * @param {Electron.WebContents} webContents - Window web contents
 */
export function applyCSP(webContents) {
  const cspHeader = getCSPHeader();
  
  webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [cspHeader],
      },
    });
  });
}
