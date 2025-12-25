import { logger } from './logger.ts';
import { isDevelopment } from './config.ts';
/**
 * Developer tools and DevTools integration
 */
/**
 * Setup DevTools for window
 * @param {BrowserWindow} window - Window instance
 */
export function setupDevTools(window) {
    if (!isDevelopment()) {
        logger.debug('DevTools disabled in production');
        return;
    }
    // Auto-open DevTools in development
    window.webContents.openDevTools();
    logger.info('DevTools opened for window', { windowId: window.id });
    // Install React DevTools
    installReactDevTools();
}
/**
 * Install React DevTools extension
 */
export async function installReactDevTools() {
    if (!isDevelopment()) {
        return;
    }
    try {
        // Dynamically import to avoid loading in production
        const { default: installExtension, REACT_DEVELOPER_TOOLS } = await import('electron-devtools-installer');
        const name = await installExtension(REACT_DEVELOPER_TOOLS, {
            loadExtensionOptions: { allowFileAccess: true },
        });
        logger.info(`Installed DevTools extension: ${name}`);
    }
    catch (error) {
        logger.warn('Failed to install React DevTools', {
            error: error.message,
            note: 'This is optional and does not affect functionality',
        });
    }
}
/**
 * Enable hot reload for main process
 * This watches for changes in main process files and restarts Electron
 */
export function enableMainProcessHMR() {
    if (!isDevelopment()) {
        return;
    }
    logger.info('Main process HMR enabled via electron-vite');
    // electron-vite handles main process reloading automatically
    // No additional configuration needed
}
/**
 * Setup performance monitoring
 */
export function setupPerformanceMonitoring() {
    if (!isDevelopment()) {
        return;
    }
    // Monitor IPC call performance
    logger.info('Performance monitoring enabled');
    // Track memory usage periodically
    setInterval(() => {
        const usage = process.memoryUsage();
        const usageMB = {
            rss: (usage.rss / 1024 / 1024).toFixed(2),
            heapTotal: (usage.heapTotal / 1024 / 1024).toFixed(2),
            heapUsed: (usage.heapUsed / 1024 / 1024).toFixed(2),
            external: (usage.external / 1024 / 1024).toFixed(2),
        };
        if (parseFloat(usageMB.heapUsed) > 500) {
            logger.warn('High memory usage detected', usageMB);
        }
    }, 60000); // Check every minute
}
/**
 * Log environment info
 */
export function logEnvironmentInfo() {
    logger.info('Development environment info', {
        node: process.versions.node,
        electron: process.versions.electron,
        chrome: process.versions.chrome,
        v8: process.versions.v8,
        platform: process.platform,
        arch: process.arch,
    });
}
