import { shell } from 'electron';
import { logger } from '../logger.ts';
import { config } from '../config.ts';
import { logNavigationBlock, logExternalLink } from './audit-log.ts';

/**
 * Navigation security guards to prevent unauthorized navigation
 */

/**
 * Check if URL is allowed for navigation
 * @param {string} url - URL to check
 * @returns {boolean} True if allowed
 */
export function isAllowedOrigin(url) {
  try {
    const parsedUrl = new URL(url);
    const allowedOrigins = config.security.allowedOrigins;

    // Allow navigation within the same origin
    if (parsedUrl.protocol === 'file:') {
      return true;
    }

    // Check against allowed origins list
    return allowedOrigins.some(origin => {
      const allowedUrl = new URL(origin);
      return (
        parsedUrl.protocol === allowedUrl.protocol &&
        parsedUrl.hostname === allowedUrl.hostname &&
        parsedUrl.port === allowedUrl.port
      );
    });
  } catch (error) {
    logger.error('Error parsing URL in navigation guard', error);
    return false;
  }
}

/**
 * Setup navigation guard for window
 * @param {Electron.WebContents} webContents - Window web contents
 */
export function setupNavigationGuard(webContents) {
  // Prevent navigation to external URLs
  webContents.on('will-navigate', (event, navigationUrl) => {
    const allowed = isAllowedOrigin(navigationUrl);
    
    if (!allowed) {
      event.preventDefault();
      logger.warn('Blocked navigation attempt', {
        url: navigationUrl,
        reason: 'Not in allowed origins',
      });
      
      // Log to security audit
      logNavigationBlock({
        windowId: webContents.id,
        url: navigationUrl,
        reason: 'Not in allowed origins',
      });
    } else {
      logger.debug('Allowed navigation', { url: navigationUrl });
    }
  });

  // Handle navigation requests that open in new window
  webContents.on('did-start-navigation', (event, url, isInPlace) => {
    if (!isInPlace) {
      logger.debug('Navigation started', { url, isInPlace });
    }
  });

  logger.debug('Navigation guard setup complete');
}

/**
 * Setup window open handler for secure new window creation
 * @param {Electron.WebContents} webContents - Window web contents
 */
export function setupWindowOpenHandler(webContents) {
  webContents.setWindowOpenHandler(({ url }) => {
    const parsedUrl = new URL(url);

    // Always deny file:// protocol in new windows
    if (parsedUrl.protocol === 'file:') {
      logger.warn('Blocked file:// protocol in new window', { url });
      return { action: 'deny' };
    }

    // For external URLs, open in default browser
    if (!isAllowedOrigin(url)) {
      logger.info('Opening external URL in default browser', { url });
      shell.openExternal(url);
      
      // Log to security audit
      logExternalLink({
        url,
        windowId: webContents.id,
      });
      
      return { action: 'deny' };
    }

    // Allow if in allowed origins
    logger.debug('Allowing new window', { url });
    return { action: 'allow' };
  });

  logger.debug('Window open handler setup complete');
}

/**
 * Setup external link handler
 * Opens external links in system browser instead of Electron
 * @param {Electron.WebContents} webContents - Window web contents
 */
export function setupExternalLinkHandler(webContents) {
  webContents.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url);
    
    // If it's an external http/https link, open in browser
    if (
      (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') &&
      !isAllowedOrigin(url)
    ) {
      event.preventDefault();
      shell.openExternal(url);
      logger.info('Opened external link in browser', { url });
      
      // Log to security audit
      logExternalLink({
        url,
        windowId: webContents.id,
      });
    }
  });

  logger.debug('External link handler setup complete');
}

/**
 * Setup all security guards for window
 * @param {Electron.WebContents} webContents - Window web contents
 */
export function setupSecurityGuards(webContents) {
  setupNavigationGuard(webContents);
  setupWindowOpenHandler(webContents);
  setupExternalLinkHandler(webContents);
  logger.info('All security guards enabled');
}
