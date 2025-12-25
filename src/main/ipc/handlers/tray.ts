import { IPC_CHANNELS } from '../../../common/constants.ts';
import { trayManager } from '../../tray.ts';
import { windowManager } from '../../window-manager.ts';
import { logger } from '../../logger.ts';
import { app } from 'electron';

/**
 * System Tray IPC Handlers
 */

/**
 * Create tray IPC handlers
 * @returns {Object} Handler map
 */
export function createTrayHandlers() {
  return {
    [IPC_CHANNELS.TRAY_CREATE]: async () => {
      const success = trayManager.createTray();
      return { success };
    },

    [IPC_CHANNELS.TRAY_DESTROY]: async () => {
      trayManager.destroy();
      return { success: true };
    },

    [IPC_CHANNELS.TRAY_CHECK_STATUS]: async () => {
      return { created: trayManager.isCreated() };
    },

    [IPC_CHANNELS.TRAY_SHOW]: async () => {
      const success = trayManager.show();
      return { success };
    },

    [IPC_CHANNELS.TRAY_HIDE]: async () => {
      const success = trayManager.hide();
      return { success };
    },

    [IPC_CHANNELS.TRAY_SET_ICON]: async (_, { iconPath }) => {
      if (!iconPath || typeof iconPath !== 'string') {
        throw new Error('Invalid icon path');
      }

      const success = trayManager.setIcon(iconPath);
      return { success };
    },

    [IPC_CHANNELS.TRAY_SET_TOOLTIP]: async (_, { tooltip }) => {
      if (!tooltip || typeof tooltip !== 'string') {
        throw new Error('Invalid tooltip');
      }

      const success = trayManager.setTooltip(tooltip);
      return { success };
    },

    [IPC_CHANNELS.TRAY_SET_MENU]: async (_, { menuTemplate }) => {
      if (!Array.isArray(menuTemplate)) {
        throw new Error('Invalid menu template');
      }

      // Convert menu template items to have actual click handlers
      const processedTemplate = processMenuTemplate(menuTemplate);
      const success = trayManager.setContextMenu(processedTemplate);
      return { success };
    },
  };
}

/**
 * Process menu template to add click handlers
 * @param {import('../../common/types.ts').TrayMenuItem[]} template - Menu template
 * @returns {Object[]} Processed template
 */
function processMenuTemplate(template) {
  return template.map((item) => {
    const processed = { ...item };

    // Handle click events
    if (item.id && item.type !== 'separator') {
      processed.click = () => handleMenuItemClick(item.id);
    }

    // Handle built-in actions
    if (item.id === 'show') {
      processed.click = () => {
        const mainWindow = windowManager.getWindowByType('main');
        if (mainWindow) {
          windowManager.focusWindow(mainWindow.id);
        }
      };
    } else if (item.id === 'quit') {
      processed.click = () => {
        app.quit();
      };
    }

    // Recursively process submenu items
    if (item.submenu) {
      processed.submenu = processMenuTemplate(item.submenu);
    }

    return processed;
  });
}

/**
 * Handle menu item click
 * @param {string} itemId - Menu item ID
 */
function handleMenuItemClick(itemId) {
  logger.debug('Tray menu item clicked', { itemId });

  // Send event to all renderer processes
  const windows = windowManager.getAllWindows();
  windows.forEach((win) => {
    if (win.window && !win.window.isDestroyed()) {
      win.window.webContents.send(IPC_CHANNELS.TRAY_MENU_ITEM_CLICKED, { itemId });
    }
  });
}

export const trayHandlers = createTrayHandlers();
