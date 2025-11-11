import { Menu, app, shell } from 'electron';
import { logger } from './logger.js';

/**
 * Application Menu - Platform-specific menu creation and management
 */

/**
 * Create application menu template
 * @param {WindowManager} windowManager - Window manager instance
 * @returns {Array} Menu template
 */
export function createMenuTemplate(windowManager) {
  const isMac = process.platform === 'darwin';

  const template = [
    // App menu (macOS only)
    ...(isMac
      ? [
          {
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
          },
        ]
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
        { type: 'separator' },
        ...(!isMac
          ? [
              {
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
              },
              { type: 'separator' },
            ]
          : []),
        isMac ? { role: 'close' } : { role: 'quit' },
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
          ? [
              { role: 'pasteAndMatchStyle' },
              { role: 'delete' },
              { role: 'selectAll' },
              { type: 'separator' },
              {
                label: 'Speech',
                submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
              },
            ]
          : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
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
          ? [
              { type: 'separator' },
              { role: 'front' },
              { type: 'separator' },
              { role: 'window' },
            ]
          : [{ role: 'close' }]),
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
        ...(!isMac
          ? [
              {
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
              },
            ]
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
export function setupMenu(windowManager) {
  const template = createMenuTemplate(windowManager);
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  logger.info('Application menu initialized');
}

/**
 * Add custom menu items to existing menu
 * @param {Array} _customItems - Custom menu items to add (reserved for future use)
 */
export function addCustomMenuItems(_customItems) {
  const currentMenu = Menu.getApplicationMenu();
  if (!currentMenu) {
    logger.warn('Cannot add custom menu items: No application menu set');
    return;
  }

  // Custom menu items can be added by rebuilding the menu
  // This is a placeholder for future customization
  logger.debug('Custom menu items support available');
}
