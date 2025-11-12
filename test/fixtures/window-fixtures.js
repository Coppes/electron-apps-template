/**
 * Test fixtures for BrowserWindow states and configurations
 */

// Default window options
export const defaultWindowOptions = {
  width: 1024,
  height: 768,
  minWidth: 800,
  minHeight: 600,
  show: false,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
  },
};

// Main window configuration
export const mainWindowConfig = {
  type: 'main',
  width: 1200,
  height: 800,
  title: 'Main Window',
  show: true,
};

// Settings window configuration
export const settingsWindowConfig = {
  type: 'settings',
  width: 600,
  height: 400,
  title: 'Settings',
  resizable: false,
  show: true,
};

// Window states
export const windowStates = {
  minimized: {
    isMinimized: true,
    isMaximized: false,
    isFullScreen: false,
    isVisible: false,
  },
  maximized: {
    isMinimized: false,
    isMaximized: true,
    isFullScreen: false,
    isVisible: true,
  },
  fullscreen: {
    isMinimized: false,
    isMaximized: false,
    isFullScreen: true,
    isVisible: true,
  },
  normal: {
    isMinimized: false,
    isMaximized: false,
    isFullScreen: false,
    isVisible: true,
  },
};

// Window bounds
export const windowBounds = {
  default: {
    x: 100,
    y: 100,
    width: 1024,
    height: 768,
  },
  maximized: {
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
  },
  minimized: {
    x: 100,
    y: 100,
    width: 200,
    height: 50,
  },
};

// Saved window state (for persistence testing)
export const savedWindowState = {
  main: {
    x: 150,
    y: 150,
    width: 1200,
    height: 900,
    isMaximized: false,
  },
  settings: {
    x: 300,
    y: 200,
    width: 600,
    height: 400,
    isMaximized: false,
  },
};
