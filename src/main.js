import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { join } from 'path';
import Store from 'electron-store';
import fs from 'fs/promises';

// electron-vite fornece __dirname automaticamente após compilação
const store = new Store();

let mainWindow;

const createWindow = () => {
  // Construir path absoluto para o preload
  const preloadPath = join(__dirname, '../preload/index.mjs');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      preload: preloadPath,
      sandbox: false,
    },
  });

  // Em desenvolvimento, carrega do servidor Vite
  // Em produção, carrega do arquivo compilado
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Aplicar CSP após o carregamento
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': isDevelopment
          ? ["default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173 ws://localhost:5173; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173; style-src 'self' 'unsafe-inline' http://localhost:5173; img-src 'self' data: http://localhost:5173; font-src 'self' data:; connect-src 'self' http://localhost:5173 ws://localhost:5173;"]
          : ["default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;"]
      }
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// Desabilitar navegação para URLs externas
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    const isDevelopment = process.env.NODE_ENV === 'development';
    const allowedOrigins = isDevelopment ? ['http://localhost:5173'] : [];
    
    if (!allowedOrigins.includes(parsedUrl.origin)) {
      event.preventDefault();
    }
  });

  contents.setWindowOpenHandler(({ url }) => {
    const parsedUrl = new URL(url);
    if (parsedUrl.origin === 'https://example.com') {
      return { action: 'allow' };
    }
    return { action: 'deny' };
  });
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('set-title', async (event, title) => {
  mainWindow.setTitle(title);
  return { success: true, title };
});

ipcMain.handle('update-counter', async (event, count) => {
  mainWindow.webContents.send('counter-updated', count);
  return { success: true, count };
});

ipcMain.handle('get-version', async () => {
  return {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
    v8: process.versions.v8,
    app: app.getVersion(),
  };
});

// Store handlers
ipcMain.handle('store-get', async (event, key) => {
  return store.get(key);
});

ipcMain.handle('store-set', async (event, key, value) => {
  store.set(key, value);
  return { success: true };
});

ipcMain.handle('store-delete', async (event, key) => {
  store.delete(key);
  return { success: true };
});

// File dialog handler
ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt', 'md', 'json', 'js', 'jsx', 'ts', 'tsx'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled) {
    return { canceled: true };
  }

  try {
    const filePath = result.filePaths[0];
    const content = await fs.readFile(filePath, 'utf-8');
    return { 
      canceled: false, 
      filePath, 
      content 
    };
  } catch (error) {
    return { 
      canceled: false, 
      error: error.message 
    };
  }
});
