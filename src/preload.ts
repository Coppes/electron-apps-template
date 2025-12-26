import { contextBridge, ipcRenderer, webUtils } from 'electron';
import { IPC_CHANNELS } from './common/constants.ts';
import type {
  WindowOptions,
  WindowState,
  IPCResponse,
  FileDialogResult,
  VersionInfo,
  UpdateInfo,
  TrayMenuItem,
  ShortcutInfo,
  ProgressOptions,
  NotificationOptions,
  NotificationInfo,
  DeepLinkData
} from './common/types.ts';

/**
 * Preload script - Exposes a secure, type-safe API to the renderer process
 * Uses contextBridge for context isolation and ipcRenderer for IPC communication
 */

export interface ElectronAPI {
  window: typeof windowAPI;
  store: typeof storeAPI;
  secureStore: typeof secureStoreAPI;
  dialog: typeof dialogAPI;
  app: typeof appAPI;
  system: typeof systemAPI;
  events: typeof eventsAPI;
  log: typeof logAPI;
  file: typeof fileAPI;
  data: typeof dataAPI;
  tray: typeof trayAPI;
  shortcuts: typeof shortcutsAPI;
  progress: typeof progressAPI;
  recentDocs: typeof recentDocsAPI;
  notifications: typeof notificationsAPI;
  deepLink: typeof deepLinkAPI;
  os: typeof osAPI;
  i18n: typeof i18nAPI;
  plugins: typeof pluginsAPI;
}

/**
 * Window management API
 */
const windowAPI = {
  /**
   * Create a new window
   */
  create: (type: string, options?: WindowOptions): Promise<IPCResponse<{ windowId: number }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CREATE, { type, options }),

  /**
   * Close a window
   */
  close: (windowId?: number): Promise<IPCResponse<{ closed: boolean }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE, { windowId }),

  /**
   * Minimize current window
   */
  minimize: (): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE, {}),

  /**
   * Maximize/unmaximize current window
   */
  maximize: (): Promise<IPCResponse<{ maximized: boolean }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE, {}),

  /**
   * Get current window state
   */
  getState: (): Promise<IPCResponse<{ state: WindowState }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.WINDOW_GET_STATE, {}),

  /**
   * Get display info
   */
  getDisplay: (): Promise<IPCResponse<{ display: Electron.Display }>> =>
    ipcRenderer.invoke('window:get-display', {}),
};

/**
 * Store/persistence API
 */
const storeAPI = {
  /**
   * Get value from store
   */
  get: <T = any>(key: string): Promise<T> =>
    ipcRenderer.invoke(IPC_CHANNELS.STORE_GET, { key }).then((r: IPCResponse<{ value: T }>) => r.data?.value as T),

  /**
   * Set value in store
   */
  set: (key: string, value: any): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.STORE_SET, { key, value }),

  /**
   * Delete key from store
   */
  delete: (key: string): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.STORE_DELETE, { key }),

  /**
   * Clear entire store
   */
  clear: (): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.STORE_CLEAR, {}),

  /**
   * Check if key exists in store
   */
  has: (key: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.STORE_HAS, { key }).then((r: IPCResponse<{ exists: boolean }>) => !!r.data?.exists),

  /**
   * Listen for store changes
   */
  onStoreChanged: (callback: (data: any) => void) => {
    const listener = (event: Electron.IpcRendererEvent, data: any) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.STORE_CHANGED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.STORE_CHANGED, listener);
  },
};

/**
 * Secure Store API - Encrypted storage for sensitive data
 */
const secureStoreAPI = {
  set: (key: string, value: any): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.SECURE_STORE_SET, { key, value }),

  get: (key: string): Promise<IPCResponse<{ value: any }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.SECURE_STORE_GET, { key }),

  delete: (key: string): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.SECURE_STORE_DELETE, { key }),

  has: (key: string): Promise<IPCResponse<{ exists: boolean }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.SECURE_STORE_HAS, { key }),

  isAvailable: (): Promise<IPCResponse<{ available: boolean }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.SECURE_STORE_IS_AVAILABLE, {}),
};

/**
 * Dialog API
 */
const dialogAPI = {
  openFile: (options?: Electron.OpenDialogOptions): Promise<IPCResponse<FileDialogResult>> =>
    ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_FILE, { options }),

  saveFile: (options: Electron.SaveDialogOptions, content: string): Promise<IPCResponse<{ filePath?: string }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SAVE_FILE, { options, content }),

  showOpenDialog: async (options?: Electron.OpenDialogOptions): Promise<string | null> => {
    const result: IPCResponse<FileDialogResult> = await ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_FILE, { options });
    return result.data?.canceled ? null : result.data?.filePath || null;
  },

  showSaveDialog: async (options?: Electron.SaveDialogOptions): Promise<string | null> => {
    const result: IPCResponse<FileDialogResult> = await ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SAVE_FILE, { options, content: '' });
    return result.data?.canceled ? null : result.data?.filePath || null;
  },

  message: (options: Electron.MessageBoxOptions): Promise<IPCResponse<{ response: number }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.DIALOG_MESSAGE, { options }),

  error: (title: string, content: string): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.DIALOG_ERROR, { title, content }),
};

/**
 * App info API
 */
const appAPI = {
  getVersion: (): Promise<IPCResponse<VersionInfo>> =>
    ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION, {}),

  getPlatform: (): Promise<IPCResponse<{ platform: string; arch: string }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_GET_PLATFORM, {}),

  isPackaged: (): Promise<IPCResponse<{ isPackaged: boolean }>> =>
    ipcRenderer.invoke('app:is-packaged', {}),

  getPath: (name: string): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.APP_GET_PATH, { name }).then((r: IPCResponse<{ path: string }>) => r.data?.path || ''),

  quit: (): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.APP_QUIT, {}),

  relaunch: (): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.APP_RELAUNCH, {}),

  checkForUpdates: (): Promise<IPCResponse<{ updateAvailable: boolean; updateInfo?: UpdateInfo }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.APP_CHECK_FOR_UPDATES, {}),

  installUpdate: (): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.APP_INSTALL_UPDATE, {}),
};

/**
 * System info API
 */
const systemAPI = {
  getPlatform: (): Promise<IPCResponse<{ platform: string; arch: string }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_GET_PLATFORM, {}),
};

/**
 * Event listeners API
 */
const eventsAPI = {
  onUpdateCounter: (callback: (count: number) => void) => {
    const listener = (event: Electron.IpcRendererEvent, count: number) => callback(count);
    ipcRenderer.on(IPC_CHANNELS.COUNTER_UPDATED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.COUNTER_UPDATED, listener);
  },

  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => {
    const listener = (event: Electron.IpcRendererEvent, info: UpdateInfo) => callback(info);
    ipcRenderer.on(IPC_CHANNELS.UPDATE_AVAILABLE, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_AVAILABLE, listener);
  },

  onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => {
    const listener = (event: Electron.IpcRendererEvent, info: UpdateInfo) => callback(info);
    ipcRenderer.on(IPC_CHANNELS.UPDATE_DOWNLOADED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_DOWNLOADED, listener);
  },

  onUpdateProgress: (callback: (progress: any) => void) => {
    const listener = (event: Electron.IpcRendererEvent, progress: any) => callback(progress);
    ipcRenderer.on(IPC_CHANNELS.UPDATE_PROGRESS, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_PROGRESS, listener);
  },

  onUpdateError: (callback: (error: Error) => void) => {
    const listener = (event: Electron.IpcRendererEvent, error: Error) => callback(error);
    ipcRenderer.on(IPC_CHANNELS.UPDATE_ERROR, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.UPDATE_ERROR, listener);
  },

  onMenuAction: (callback: (action: string, data?: any) => void) => {
    const listeners: { channel: string; listener: (event: Electron.IpcRendererEvent, data: any) => void }[] = [];

    const add = (channel: string, action: string) => {
      const listener = (event: Electron.IpcRendererEvent, data: any) => callback(action, data);
      ipcRenderer.on(channel, listener);
      listeners.push({ channel, listener });
    };

    add('menu:new-tab', 'new-tab');
    add('menu:command-palette', 'command-palette');
    add('menu:show-onboarding', 'show-onboarding');
    add('menu:close-tab', 'close-tab');
    add('menu:data-import', 'data-import');
    add('menu:data-export', 'data-export');

    return () => {
      listeners.forEach(({ channel, listener }) =>
        ipcRenderer.removeListener(channel, listener)
      );
    };
  },
};

/**
 * Logging API - Forwards logs to main process
 */
const logAPI = {
  debug: (message: string, meta: Record<string, any> = {}): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.LOG_DEBUG, { message, meta }),

  info: (message: string, meta: Record<string, any> = {}): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.LOG_INFO, { message, meta }),

  warn: (message: string, meta: Record<string, any> = {}): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.LOG_WARN, { message, meta }),

  error: (message: string, meta: Record<string, any> = {}): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.LOG_ERROR, { message, meta }),
};

/**
 * File operations API
 */
const fileAPI = {
  /**
   * Process dropped files
   * @param {Array<string>} filePaths - Array of file paths
   * @param {Object} [options] - Validation options
   * @returns {Promise<Object>} Result with valid/invalid files
   */
  drop: (filePaths: string[], options?: object) => ipcRenderer.invoke(IPC_CHANNELS.FILE_DROP, { filePaths, options }),

  /**
   * Get file path from File object (webUtils)
   * @param {File} file - File object
   * @returns {string} File path
   */
  getPath: (file: File) => webUtils.getPathForFile(file),

  /**
   * Start drag operation from app
   * @param {string} filePath - File path to drag
   * @param {string} [icon] - Optional drag icon path
   * @returns {Promise<Object>} Result
   */
  dragStart: (filePath: string, icon?: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE_DRAG_START, { filePath, icon }),

  /**
   * Validate file path
   */
  validatePath: (filePath: string): Promise<IPCResponse<{ metadata: any }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_VALIDATE_PATH, { filePath }),

  /**
   * Watch file for changes
   */
  watch: (filePath: string, callback: (event: string, filename: string) => void): Promise<() => void> => {
    const channel = `file:changed:${filePath}`;
    const listener = (event: Electron.IpcRendererEvent, data: { event: string; filename: string }) =>
      callback(data.event, data.filename);

    return ipcRenderer.invoke(IPC_CHANNELS.FILE_WATCH_START, { filePath }).then((res: IPCResponse<void>) => {
      if (res.success) {
        ipcRenderer.on(channel, listener);
        return () => {
          ipcRenderer.removeListener(channel, listener);
          ipcRenderer.invoke(IPC_CHANNELS.FILE_WATCH_STOP, { filePath });
        };
      }
      return () => { };
    });
  }
};

/**
 * Data management API
 */
const dataAPI = {
  /**
   * Create backup of application data
   */
  createBackup: (options?: { includeDatabase?: boolean }): Promise<IPCResponse<{ backup: any }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.DATA_CREATE_BACKUP, options),

  /**
   * List available backups
   */
  listBackups: (): Promise<IPCResponse<{ backups: any[] }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.DATA_LIST_BACKUPS, {}),

  /**
   * Restore from backup
   */
  restoreBackup: (filename: string): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.DATA_RESTORE_BACKUP, { filename }),

  /**
   * Delete backup
   */
  deleteBackup: (filename: string): Promise<IPCResponse<{ deleted: string }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.DATA_DELETE_BACKUP, { filename }),

  /**
   * Import data from file
   */
  importData: (filePath: string, options?: any): Promise<IPCResponse<{ data: any }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.DATA_IMPORT, { filePath, options }),

  /**
   * Export data to file
   */
  exportData: (filePath: string, data: any, options?: any): Promise<IPCResponse<{ path: string }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.DATA_EXPORT, { filePath, data, options }),

  /**
   * Export data using a preset
   */
  exportPreset: (filePath: string, preset: string, options?: any): Promise<IPCResponse<{ path: string }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.DATA_EXPORT, { filePath, preset, options }),

  /**
   * List available import/export formats
   */
  listFormats: (): Promise<IPCResponse<{ formats: string[] }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.DATA_LIST_FORMATS, {}),

  /**
   * Get connectivity status
   */
  getConnectivityStatus: (): Promise<IPCResponse<{ online: boolean }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.CONNECTIVITY_STATUS, {}),

  /**
   * Listen for connectivity change events
   */
  onConnectivityChanged: (callback: (online: boolean) => void) => {
    const listener = (event: Electron.IpcRendererEvent, data: { online: boolean }) => callback(data.online);
    ipcRenderer.on(IPC_CHANNELS.CONNECTIVITY_STATUS, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.CONNECTIVITY_STATUS, listener);
  },

  /**
   * Add operation to sync queue
   */
  syncQueueAdd: (operation: any): Promise<IPCResponse<{ id: string }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.SYNC_QUEUE_ADD, { operation }),

  /**
   * Process sync queue
   */
  syncQueueProcess: (): Promise<IPCResponse<{ processed: number; failed: number }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.SYNC_QUEUE_PROCESS, {}),

  /**
   * Get sync queue status
   */
  syncQueueStatus: (): Promise<IPCResponse<{ total: number; pending: number }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.SYNC_QUEUE_STATUS, {}),
  getSyncQueueStatus: (): Promise<IPCResponse<{ total: number; pending: number }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.SYNC_QUEUE_STATUS, {}),

  /**
   * Listen for sync status change events
   */
  onSyncStatusChanged: (callback: (status: any) => void) => {
    const listener = (event: Electron.IpcRendererEvent, data: any) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.SYNC_STATUS_CHANGED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SYNC_STATUS_CHANGED, listener);
  },
};

/**
 * System Tray API
 */
const trayAPI = {
  create: (): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.TRAY_CREATE, {}),

  checkStatus: (): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.TRAY_CHECK_STATUS, {}).then((r: IPCResponse<{ created: boolean }>) => !!r.data?.created),

  destroy: (): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.TRAY_DESTROY, {}),

  show: (): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.TRAY_SHOW, {}),

  hide: (): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.TRAY_HIDE, {}),

  setIcon: (iconPath: string): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.TRAY_SET_ICON, { iconPath }),

  setTooltip: (tooltip: string): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.TRAY_SET_TOOLTIP, { tooltip }),

  setContextMenu: (menuTemplate: TrayMenuItem[]): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.TRAY_SET_MENU, { menuTemplate }),

  onMenuItemClick: (callback: (id: string) => void) => {
    const listener = (event: Electron.IpcRendererEvent, data: { id: string }) => callback(data.id);
    ipcRenderer.on(IPC_CHANNELS.TRAY_MENU_ITEM_CLICKED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TRAY_MENU_ITEM_CLICKED, listener);
  },
};

/**
 * Global Shortcuts API
 */
const shortcutsAPI = {
  register: (accelerator: string, description?: string): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.SHORTCUT_REGISTER, { accelerator, description }),

  unregister: (accelerator: string): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.SHORTCUT_UNREGISTER, { accelerator }),

  unregisterAll: (): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.SHORTCUT_UNREGISTER_ALL, {}),

  isRegistered: (accelerator: string): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.SHORTCUT_IS_REGISTERED, { accelerator }).then((r: IPCResponse<{ registered: boolean }>) => !!r.data?.registered),

  listActive: (): Promise<ShortcutInfo[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.SHORTCUT_LIST_ACTIVE, {}).then((r: IPCResponse<{ shortcuts: ShortcutInfo[] }>) => r.data?.shortcuts || []),

  onTriggered: (callback: (accelerator: string) => void) => {
    const listener = (event: Electron.IpcRendererEvent, data: { accelerator: string }) => callback(data.accelerator);
    ipcRenderer.on(IPC_CHANNELS.SHORTCUT_TRIGGERED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SHORTCUT_TRIGGERED, listener);
  },
};

/**
 * Progress Indicator API
 */
const progressAPI = {
  set: (value: number, options: ProgressOptions = { value: 0 }): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.PROGRESS_SET, { ...options, value }),

  clear: (windowId?: number): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.PROGRESS_CLEAR, { windowId }),
};

/**
 * Recent Documents API
 */
const recentDocsAPI = {
  add: (filePath: string): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.RECENT_DOCS_ADD, { filePath }),

  clear: (): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.RECENT_DOCS_CLEAR, {}),
};

/**
 * Native Notifications API
 */
const notificationsAPI = {
  show: (options: NotificationOptions): Promise<IPCResponse<{ id: string }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_SHOW, options),

  close: (id: string): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_CLOSE, { id }),

  getHistory: (limit = 50): Promise<NotificationInfo[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_GET_HISTORY, { limit }).then((r: IPCResponse<{ history: NotificationInfo[] }>) => r.data?.history || []),

  checkPermission: (): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_CHECK_PERMISSION, {}).then((r: IPCResponse<{ allowed: boolean }>) => !!r.data?.allowed),

  requestPermission: (): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATION_REQUEST_PERMISSION, {}).then((r: IPCResponse<{ granted: boolean }>) => !!r.data?.granted),

  onClick: (callback: (id: string) => void) => {
    const listener = (event: Electron.IpcRendererEvent, data: { id: string }) => callback(data.id);
    ipcRenderer.on(IPC_CHANNELS.NOTIFICATION_CLICKED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.NOTIFICATION_CLICKED, listener);
  },

  onAction: (callback: (id: string, action: string) => void) => {
    const listener = (event: Electron.IpcRendererEvent, data: { id: string; action: string }) => callback(data.id, data.action);
    ipcRenderer.on(IPC_CHANNELS.NOTIFICATION_ACTION_CLICKED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.NOTIFICATION_ACTION_CLICKED, listener);
  },

  onClose: (callback: (id: string) => void) => {
    const listener = (event: Electron.IpcRendererEvent, data: { id: string }) => callback(data.id);
    ipcRenderer.on(IPC_CHANNELS.NOTIFICATION_CLOSED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.NOTIFICATION_CLOSED, listener);
  },
};

/**
 * Deep Linking API
 */
const deepLinkAPI = {
  onReceived: (callback: (data: DeepLinkData) => void) => {
    const listener = (event: Electron.IpcRendererEvent, data: DeepLinkData) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.DEEP_LINK_RECEIVED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.DEEP_LINK_RECEIVED, listener);
  },
};

/**
 * I18n API
 */
const i18nAPI = {
  changeLanguage: (language: string): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke(IPC_CHANNELS.I18N_SET_LANGUAGE, { language }),

  getLanguage: (): Promise<IPCResponse<{ language: string }>> =>
    ipcRenderer.invoke(IPC_CHANNELS.I18N_GET_LANGUAGE, {}),
};

/**
 * Plugins API
 */
const pluginsAPI = {
  getAll: (): Promise<any[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.PLUGINS_GET_ALL).then((r: IPCResponse<{ plugins: any[] }>) => r.data?.plugins || []),
};

/**
 * OS Integration API
 */
const osAPI = {
  // Dock
  setDockBadge: (text: string): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke('dock:set-badge', { text }),

  setDockMenu: (template: any[]): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke('dock:set-menu', { template }),

  // Tray
  setTrayStatus: (status: string): Promise<IPCResponse<void>> =>
    ipcRenderer.invoke('tray:set-status', { status }),

  // Power Monitor
  onPowerStatusChange: (callback: (status: string) => void) => {
    const listener = (event: Electron.IpcRendererEvent, status: string) => callback(status);
    ipcRenderer.on('power:status-change', listener);
    return () => ipcRenderer.removeListener('power:status-change', listener);
  },

  // File Associations
  onFileOpened: (callback: (data: { filePath: string; content?: string }) => void) => {
    const listener = (event: Electron.IpcRendererEvent, data: { filePath: string; content?: string }) => callback(data);
    ipcRenderer.on('app:file-opened', listener);
    return () => ipcRenderer.removeListener('app:file-opened', listener);
  }
};

/**
 * Complete Electron API surface exposed to renderer
 */
const electronAPI: ElectronAPI = {
  window: windowAPI,
  store: storeAPI,
  secureStore: secureStoreAPI,
  dialog: dialogAPI,
  app: appAPI,
  system: systemAPI,
  events: eventsAPI,
  log: logAPI,
  file: fileAPI, // Added fileAPI to ElectronAPI interface
  data: dataAPI,
  tray: trayAPI,
  shortcuts: shortcutsAPI,
  progress: progressAPI,
  recentDocs: recentDocsAPI,
  notifications: notificationsAPI,
  deepLink: deepLinkAPI,
  os: osAPI,
  i18n: i18nAPI,
  plugins: pluginsAPI,
};

// We need to extend the interface in common/types.ts or preload.ts to include all these.
// For now, I'm matching the structure.

// Expose the API to the renderer context
// Object is frozen to prevent modifications from renderer
contextBridge.exposeInMainWorld('electronAPI', {
  ...electronAPI,
  deepLink: deepLinkAPI,
  os: osAPI,
  i18n: i18nAPI,
  plugins: pluginsAPI,
  // Legacy compatibility
  setTitle: (title: string) => windowAPI.getState().then(() => title),
  getVersion: appAPI.getVersion,
  openFile: dialogAPI.openFile,
  onUpdateCounter: eventsAPI.onUpdateCounter,
  invoke: (channel: string, payload: any) => ipcRenderer.invoke(channel, payload),
});

// Expose Plugin Registry API
contextBridge.exposeInMainWorld('appPlugin', {
  registerCommand: (command: any) => {
    // Dispatch event so React context can pick it up
    window.dispatchEvent(new CustomEvent('plugin-register-command', { detail: command }));
  }
});

// Freeze API to prevent tampering
Object.freeze(electronAPI);
Object.freeze(windowAPI);
Object.freeze(storeAPI);
Object.freeze(secureStoreAPI);
Object.freeze(dialogAPI);
Object.freeze(appAPI);
Object.freeze(systemAPI);
Object.freeze(eventsAPI);
Object.freeze(logAPI);
Object.freeze(fileAPI);
Object.freeze(dataAPI);
Object.freeze(trayAPI);
Object.freeze(shortcutsAPI);
Object.freeze(progressAPI);
Object.freeze(recentDocsAPI);
Object.freeze(notificationsAPI);
Object.freeze(deepLinkAPI);
Object.freeze(i18nAPI);
Object.freeze(osAPI);

