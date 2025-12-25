import { dialog } from 'electron';
import { logger } from '../logger.ts';
import { config } from '../config.ts';
import { logPermissionRequest } from './audit-log.ts';

/**
 * Permission Management
 * Handles permission requests from renderer process with user consent
 */

/**
 * Allowed permission types
 * @type {Set<string>}
 */
const DEFAULT_ALLOWED_PERMISSIONS = new Set([
  'notifications',
  // Add permissions your app needs here
  // Examples: 'media', 'notifications', 'geolocation', 'openExternal'
]);

/**
 * Permission types that should always be denied
 * @type {Set<string>}
 */
const DENIED_PERMISSIONS = new Set([
  'midi',
  'midiSysex',
  'pointerLock',
  'fullscreen',
  'serial',
  'usb',
  'bluetooth',
]);

/**
 * Check if permission type is allowed by configuration
 * @param {string} permission - Permission type
 * @returns {boolean}
 */
export function isPermissionAllowed(permission) {
  // Check if explicitly denied
  if (DENIED_PERMISSIONS.has(permission)) {
    return false;
  }

  // Check against configured allowed permissions
  const allowedPermissions = config.security.allowedPermissions || DEFAULT_ALLOWED_PERMISSIONS;
  return allowedPermissions.has(permission);
}

/**
 * Get human-readable permission name
 * @param {string} permission - Permission type
 * @returns {string}
 */
function getPermissionDisplayName(permission) {
  const names = {
    media: 'Camera and Microphone',
    notifications: 'Notifications',
    geolocation: 'Location',
    openExternal: 'Open External Links',
    clipboard: 'Clipboard Access',
    fullscreen: 'Fullscreen',
    pointerLock: 'Pointer Lock',
  };
  return names[permission] || permission;
}

/**
 * Show permission request dialog to user
 * @param {string} permission - Permission type
 * @param {string} origin - Requesting origin
 * @returns {Promise<boolean>} User's choice
 */
async function showPermissionDialog(permission, origin) {
  const permissionName = getPermissionDisplayName(permission);

  const result = await dialog.showMessageBox({
    type: 'question',
    buttons: ['Allow', 'Deny'],
    defaultId: 1, // Default to Deny for security
    title: 'Permission Request',
    message: `Allow ${permissionName}?`,
    detail: `The application is requesting access to ${permissionName}.\n\nOrigin: ${origin}`,
  });

  return result.response === 0; // 0 = Allow button
}

/**
 * Setup permission request handler for session
 * @param {Electron.Session} session - Session to setup handler for
 */
export function setupPermissionHandler(session) {
  session.setPermissionRequestHandler(async (webContents, permission, callback, details) => {
    const origin = details.requestingUrl || 'unknown';

    logger.info('Permission requested', {
      permission,
      origin,
      isMainFrame: details.isMainFrame,
    });

    // Auto-deny if permission is not in allowed list
    if (!isPermissionAllowed(permission)) {
      logger.warn('Permission auto-denied (not in allowed list)', {
        permission,
        origin,
      });

      // Log to security audit
      logPermissionRequest({
        windowId: webContents.id,
        permission,
        origin,
        granted: false,
      });

      callback(false);
      return;
    }

    // Prompt user for permission
    try {
      const granted = await showPermissionDialog(permission, origin);

      logger.info('Permission decision made', {
        permission,
        origin,
        granted,
      });

      // Log to security audit
      logPermissionRequest({
        windowId: webContents.id,
        permission,
        origin,
        granted,
      });

      callback(granted);
    } catch (error) {
      logger.error('Error handling permission request', {
        permission,
        origin,
        error: error.message,
      });

      // Log to security audit
      logPermissionRequest({
        windowId: webContents.id,
        permission,
        origin,
        granted: false,
      });

      callback(false); // Deny on error
    }
  });

  logger.debug('Permission handler setup complete');
}

/**
 * Setup permission check handler for session
 * @param {Electron.Session} session - Session to setup handler for
 */
export function setupPermissionCheckHandler(session) {
  session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    logger.debug('Permission check', {
      permission,
      origin: requestingOrigin,
      isMainFrame: details.isMainFrame,
    });

    // Only allow if permission is in allowed list
    const allowed = isPermissionAllowed(permission);

    if (!allowed) {
      logger.debug('Permission check denied', {
        permission,
        origin: requestingOrigin,
      });
    }

    return allowed;
  });

  logger.debug('Permission check handler setup complete');
}

/**
 * Setup device permission handler for session
 * Handles requests for specific devices (USB, serial, HID, Bluetooth)
 * @param {Electron.Session} session - Session to setup handler for
 */
export function setupDevicePermissionHandler(session) {
  // Handle device permission requests
  session.on('select-usb-device', (event, details, callback) => {
    event.preventDefault();
    logger.warn('USB device request denied by policy', {
      origin: details.origin,
    });
    callback(); // No device selected
  });

  session.on('select-serial-port', (event, portList, webContents, callback) => {
    event.preventDefault();
    logger.warn('Serial port request denied by policy', {
      ports: portList.length,
    });
    callback(''); // No port selected
  });

  session.setDevicePermissionHandler((details) => {
    logger.warn('Device permission request denied by policy', {
      deviceType: details.deviceType,
      origin: details.origin,
    });
    return false; // Deny all device access by default
  });

  logger.debug('Device permission handlers setup complete');
}

/**
 * Setup all permission handlers for session
 * @param {Electron.Session} session - Session to setup handlers for
 */
export function setupAllPermissionHandlers(session) {
  setupPermissionHandler(session);
  setupPermissionCheckHandler(session);
  setupDevicePermissionHandler(session);

  logger.info('All permission handlers configured');
}
