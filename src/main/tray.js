import { app, Tray, Menu, nativeImage } from 'electron';
import { join } from 'path';
import fs from 'fs';
import { logger } from './logger.js';
import { isMacOS, isWindows } from '../common/constants.js';

/**
 * System Tray Manager
 * Manages system tray icon and context menu
 */
export class TrayManager {
  constructor() {
    this.tray = null;
    this.menuTemplate = [];
    this.visible = false;
  }

  /**
   * Check if tray is created
   * @returns {boolean} True if created
   */
  isCreated() {
    return !!this.tray;
  }

  /**
   * Create system tray icon
   * @param {Object} [options] - Tray creation options
   * @param {string} [options.tooltip] - Tooltip text
   * @param {Function} [options.onClick] - Click handler
   * @returns {boolean} Success status
   */
  createTray(options = {}) {
    if (this.tray) {
      logger.warn('Tray already exists');
      return false;
    }

    try {
      const iconPath = this.getTrayIconPath();

      // Verify file exists
      if (!fs.existsSync(iconPath)) {
        logger.error('Tray icon file not found', { iconPath });
        return false;
      }

      let icon = nativeImage.createFromPath(iconPath);

      if (icon.isEmpty()) {
        logger.warn('nativeImage.createFromPath returned empty, trying createFromBuffer', { iconPath });
        try {
          const buffer = fs.readFileSync(iconPath);
          icon = nativeImage.createFromBuffer(buffer);
        } catch (error) {
          logger.error('Failed to read icon file buffer', { error });
        }
      }

      if (icon.isEmpty()) {
        logger.error('Failed to load tray icon (empty)', { iconPath });
        return false;
      }

      this.tray = new Tray(icon);
      this.visible = true;

      // Set tooltip
      if (options.tooltip) {
        this.setTooltip(options.tooltip);
      } else {
        this.setTooltip(app.getName());
      }

      // Set click handler
      if (options.onClick) {
        this.tray.on('click', options.onClick);
      }

      // Set default context menu
      this.setDefaultMenu();

      logger.info('System tray created successfully');
      return true;
    } catch (error) {
      logger.error('Failed to create system tray', error);
      return false;
    }
  }

  /**
   * Get platform-specific tray icon path
   * @returns {string} Icon path
   */
  getTrayIconPath() {
    const assetsPath = app.isPackaged
      ? join(process.resourcesPath, 'assets')
      : join(app.getAppPath(), 'assets');

    if (isMacOS()) {
      // macOS uses template images that adapt to dark/light mode
      return join(assetsPath, 'icon-Template.png');
    } else if (isWindows()) {
      // Windows uses standard PNG icons
      return join(assetsPath, 'icon-32.png');
    } else {
      // Linux uses standard PNG icons
      return join(assetsPath, 'icon-32.png');
    }
  }

  /**
   * Set tray icon (for dynamic updates)
   * @param {string} iconPath - Path to icon file
   * @returns {boolean} Success status
   */
  setIcon(iconPath) {
    if (!this.tray) {
      logger.warn('Tray not created');
      return false;
    }

    try {
      const icon = nativeImage.createFromPath(iconPath);
      if (icon.isEmpty()) {
        logger.error('Failed to load icon', { iconPath });
        return false;
      }

      this.tray.setImage(icon);
      logger.debug('Tray icon updated', { iconPath });
      return true;
    } catch (error) {
      logger.error('Failed to set tray icon', error);
      return false;
    }
  }

  /**
   * Set tray tooltip
   * @param {string} tooltip - Tooltip text
   * @returns {boolean} Success status
   */
  setTooltip(tooltip) {
    if (!this.tray) {
      logger.warn('Tray not created');
      return false;
    }

    try {
      this.tray.setToolTip(tooltip);
      logger.debug('Tray tooltip updated', { tooltip });
      return true;
    } catch (error) {
      logger.error('Failed to set tray tooltip', error);
      return false;
    }
  }

  /**
   * Set default tray context menu
   */
  setDefaultMenu() {
    const menuTemplate = [
      {
        label: 'Show Window',
        click: () => {
          this.emit('menu-item-click', 'show');
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          this.emit('menu-item-click', 'quit');
        },
      },
    ];

    this.setContextMenu(menuTemplate);
  }

  /**
   * Set tray context menu
   * @param {import('../common/types.js').TrayMenuItem[]} menuTemplate - Menu template
   * @returns {boolean} Success status
   */
  setContextMenu(menuTemplate) {
    if (!this.tray) {
      logger.warn('Tray not created');
      return false;
    }

    try {
      this.menuTemplate = menuTemplate;
      const menu = Menu.buildFromTemplate(menuTemplate);
      this.tray.setContextMenu(menu);
      logger.debug('Tray context menu updated', { itemCount: menuTemplate.length });
      return true;
    } catch (error) {
      logger.error('Failed to set tray context menu', error);
      return false;
    }
  }

  /**
   * Add menu item to tray
   * @param {import('../common/types.js').TrayMenuItem} item - Menu item
   * @param {number} [position] - Insert position (default: append)
   * @returns {boolean} Success status
   */
  addMenuItem(item, position) {
    if (!this.tray) {
      logger.warn('Tray not created');
      return false;
    }

    try {
      if (position !== undefined && position >= 0 && position <= this.menuTemplate.length) {
        this.menuTemplate.splice(position, 0, item);
      } else {
        this.menuTemplate.push(item);
      }

      return this.setContextMenu(this.menuTemplate);
    } catch (error) {
      logger.error('Failed to add menu item', error);
      return false;
    }
  }

  /**
   * Update existing menu item
   * @param {string} id - Menu item ID
   * @param {Partial<import('../common/types.js').TrayMenuItem>} updates - Updates
   * @returns {boolean} Success status
   */
  updateMenuItem(id, updates) {
    if (!this.tray) {
      logger.warn('Tray not created');
      return false;
    }

    try {
      const item = this.findMenuItem(this.menuTemplate, id);
      if (!item) {
        logger.warn('Menu item not found', { id });
        return false;
      }

      Object.assign(item, updates);
      return this.setContextMenu(this.menuTemplate);
    } catch (error) {
      logger.error('Failed to update menu item', error);
      return false;
    }
  }

  /**
   * Find menu item by ID (recursive search for submenus)
   * @param {import('../common/types.js').TrayMenuItem[]} items - Menu items
   * @param {string} id - Item ID to find
   * @returns {import('../common/types.js').TrayMenuItem|null}
   */
  findMenuItem(items, id) {
    for (const item of items) {
      if (item.id === id) {
        return item;
      }
      if (item.submenu) {
        const found = this.findMenuItem(item.submenu, id);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Show tray icon
   * @returns {boolean} Success status
   */
  show() {
    if (!this.tray) {
      logger.warn('Tray not created');
      return false;
    }

    this.visible = true;
    logger.debug('Tray shown');
    return true;
  }

  /**
   * Hide tray icon
   * @returns {boolean} Success status
   */
  hide() {
    if (!this.tray) {
      logger.warn('Tray not created');
      return false;
    }

    this.visible = false;
    // Note: Electron Tray doesn't have a hide method, we'd need to destroy and recreate
    // For now, just track visibility state
    logger.debug('Tray hidden (state tracked)');
    return true;
  }

  /**
   * Check if tray is visible
   * @returns {boolean}
   */
  isVisible() {
    return this.visible && this.tray !== null;
  }

  /**
   * Destroy tray icon
   */
  destroy() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
      this.visible = false;
      this.menuTemplate = [];
      logger.info('System tray destroyed');
    }
  }

  /**
   * Emit tray event (placeholder for event handling)
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    // Events will be handled by IPC handlers
    logger.debug('Tray event emitted', { event, data });
  }
}

// Export singleton instance
export const trayManager = new TrayManager();
