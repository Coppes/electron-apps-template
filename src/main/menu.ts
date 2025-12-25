import { Menu, app, shell, MenuItemConstructorOptions, BrowserWindow, MenuItem, BaseWindow } from 'electron';
import { logger } from './logger.ts';
import { WindowManager } from './window-manager.ts';

/**
 * Application Menu - Platform-specific menu creation and management
 */

/**
 * Create application menu template
 * @param {WindowManager} windowManager - Window manager instance
 * @returns {Array} Menu template
 */
export function createMenuTemplate(windowManager: WindowManager): MenuItemConstructorOptions[] {
  const isMac = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [
    // App menu (macOS only)
    ...(isMac
      ? [{
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          {
            label: 'Settings...',
            accelerator: 'Cmd+,',
            click: () => {
              logger.debug('Settings menu clicked');
              // Create or focus settings window
              const existing = windowManager.getWindowByType('settings');
              if (existing) {
                windowManager.focusWindow(existing.id);
              } else {
                windowManager.createWindow('settings');
              }
            },
          },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' },
        ],
      } as MenuItemConstructorOptions]
      : []),

    // File menu
    {
      label: 'File',
      submenu: [
        {
          label: 'New Window',
          accelerator: isMac ? 'Cmd+N' : 'Ctrl+N',
          click: () => {
            logger.info('New window requested via menu');
            windowManager.createWindow('main');
          },
        },
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          click: (_item: MenuItem, focusedWindow: BaseWindow | undefined) => {
            if (focusedWindow && focusedWindow instanceof BrowserWindow) {
              focusedWindow.webContents.send('menu:new-tab');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Import Data...',
          click: (_item: MenuItem, focusedWindow: BaseWindow | undefined) => {
            if (focusedWindow && focusedWindow instanceof BrowserWindow) {
              focusedWindow.webContents.send('menu:data-import');
            }
          }
        },
        {
          label: 'Export Data...',
          click: (_item: MenuItem, focusedWindow: BaseWindow | undefined) => {
            if (focusedWindow && focusedWindow instanceof BrowserWindow) {
              focusedWindow.webContents.send('menu:data-export');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Open Recent',
          role: 'recentDocuments',
          submenu: [
            {
              label: 'Clear Recent',
              role: 'clearRecentDocuments',
            },
          ],
        },
        { type: 'separator' },
        ...(!isMac
          ? [{
            label: 'Settings',
            accelerator: 'Ctrl+,',
            click: () => {
              logger.debug('Settings menu clicked');
              const existing = windowManager.getWindowByType('settings');
              if (existing) {
                windowManager.focusWindow(existing.id);
              } else {
                windowManager.createWindow('settings');
              }
            },
          } as MenuItemConstructorOptions,
          { type: 'separator' } as MenuItemConstructorOptions]
          : []),
        isMac ?
          {
            label: 'Close Window',
            accelerator: 'Cmd+W',
            click: (item: MenuItem, focusedWindow: BaseWindow | undefined) => {
              if (focusedWindow && focusedWindow instanceof BrowserWindow) {
                // If main window, try to close tab first via IPC
                focusedWindow.webContents.send('menu:close-tab');
              }
            }
          }
          : { role: 'quit' },
      ],
    },

    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac
          ? [{ role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
          }] as MenuItemConstructorOptions[]
          : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }] as MenuItemConstructorOptions[]),
      ],
    },

    // View menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        {
          label: 'Command Palette',
          accelerator: 'CmdOrCtrl+K',
          click: (_item: MenuItem, focusedWindow: BaseWindow | undefined) => {
            if (focusedWindow && focusedWindow instanceof BrowserWindow) {
              focusedWindow.webContents.send('menu:command-palette');
            }
          }
        },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },

    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [{ type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }] as MenuItemConstructorOptions[]
          : [{ role: 'close' }] as MenuItemConstructorOptions[]),
      ],
    },

    // Help menu
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            logger.debug('Learn More menu clicked');
            await shell.openExternal('https://electronjs.org');
          },
        },
        {
          label: 'Documentation',
          click: async () => {
            logger.debug('Documentation menu clicked');
            await shell.openExternal('https://www.electronjs.org/docs');
          },
        },
        { type: 'separator' },
        {
          label: 'Show Onboarding',
          click: (_item: MenuItem, focusedWindow: BaseWindow | undefined) => {
            if (focusedWindow && focusedWindow instanceof BrowserWindow) {
              focusedWindow.webContents.send('menu:show-onboarding');
            }
          },
        },
        { type: 'separator' },
        ...(!isMac
          ? [{
            label: 'About',
            click: () => {
              logger.debug('About menu clicked');
              const existing = windowManager.getWindowByType('about');
              if (existing) {
                windowManager.focusWindow(existing.id);
              } else {
                windowManager.createWindow('about');
              }
            },
          } as MenuItemConstructorOptions]
          : []),
      ],
    },
  ];

  return template;
}

/**
 * Setup application menu
 * @param {WindowManager} windowManager - Window manager instance
 */
export function setupMenu(windowManager: WindowManager) {
  const template = createMenuTemplate(windowManager);
  // Explicitly cast to MenuItemConstructorOptions[] to resolve strict type mismatch
  // The structure is correct but TS inference on deep nested objects can be tricky with Electron types
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  logger.info('Application menu initialized');
}

/**
 * Add custom menu items to existing menu
 * @param {Array} _customItems - Custom menu items to add (reserved for future use)
 */
export function addCustomMenuItems(_customItems: any[]) {
  const currentMenu = Menu.getApplicationMenu();
  if (!currentMenu) {
    logger.warn('Cannot add custom menu items: No application menu set');
    return;
  }

  // Custom menu items can be added by rebuilding the menu
  // This is a placeholder for future customization
  logger.debug('Custom menu items support available');
}
