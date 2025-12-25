import { app, dialog } from 'electron';
import { logger } from './logger.ts';
import { reportError } from './crash-reporter.ts';

/**
 * Error handling framework
 * Handles uncaught exceptions, unhandled rejections, and provides error reporting
 */

/**
 * Setup global error handlers
 */
export function setupErrorHandlers() {
  // Handle uncaught exceptions in main process
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception in main process', error);

    // Report to crash reporting service
    reportError(error, { type: 'uncaughtException' });

    showErrorDialog(
      'Application Error',
      `An unexpected error occurred: ${error.message}\n\nThe application will attempt to continue.`
    );

    // Don't quit - try to continue running
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));

    logger.error('Unhandled promise rejection', {
      reason: reason instanceof Error ? reason.message : reason,
      stack: reason instanceof Error ? reason.stack : undefined,
      promise: promise.toString(),
    });

    // Report to crash reporting service
    reportError(error, { type: 'unhandledRejection' });

    // Don't show dialog for every rejection, just log it
  });

  // Handle warnings
  process.on('warning', (warning) => {
    logger.warn('Process warning', {
      name: warning.name,
      message: warning.message,
      stack: warning.stack,
    });
  });

  logger.info('Global error handlers initialized');
}

/**
 * Show error dialog to user
 * @param {string} title - Dialog title
 * @param {string} message - Error message
 */
export function showErrorDialog(title: string, message: string) {
  dialog.showErrorBox(title, message);
}

/**
 * Create error report
 * @param {Error} error - Error object
 * @returns {Object} Error report with diagnostics
 */
export function createErrorReport(error: Error) {
  return {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
    diagnostics: getDiagnostics(),
  };
}

/**
 * Get system diagnostics
 * @returns {Object} Diagnostic information
 */
export function getDiagnostics() {
  const diagnostics = {
    app: {
      version: app.getVersion(),
      name: app.getName(),
      locale: app.getLocale(),
    },
    system: {
      platform: process.platform,
      arch: process.arch,
      version: process.getSystemVersion(),
    },
    versions: {
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
      v8: process.versions.v8,
    },
    memory: {
      rss: process.memoryUsage().rss,
      heapTotal: process.memoryUsage().heapTotal,
      heapUsed: process.memoryUsage().heapUsed,
      external: process.memoryUsage().external,
    },
    uptime: process.uptime(),
  };

  return diagnostics;
}

/**
 * Handle renderer process crash
 * @param {BrowserWindow} window - Crashed window
 */
export function handleRendererCrash(window: Electron.BrowserWindow) {
  const diagnostics = getDiagnostics();

  logger.error('Renderer process crashed', {
    windowId: window.id,
    diagnostics,
  });

  // Report to crash reporting service
  reportError(new Error('Renderer process crashed'), {
    type: 'rendererCrash',
    windowId: window.id,
    diagnostics,
  });

  // Show error and offer to reload
  const response = dialog.showMessageBoxSync(window, {
    type: 'error',
    title: 'Renderer Process Crashed',
    message: 'The window has crashed. Would you like to reload?',
    buttons: ['Reload', 'Close'],
    defaultId: 0,
  });

  if (response === 0) {
    // Reload
    window.reload();
  } else {
    // Close
    window.close();
  }
}

/**
 * Setup renderer crash handling for window
 * @param {BrowserWindow} window - Window instance
 */
export function setupRendererCrashHandler(window: Electron.BrowserWindow) {
  window.webContents.on('render-process-gone', (event: Electron.Event, details: Electron.RenderProcessGoneDetails) => {
    logger.error('Render process gone', {
      windowId: window.id,
      reason: details.reason,
      exitCode: details.exitCode,
    });

    // Report with details
    reportError(new Error(`Render process gone: ${details.reason}`), {
      type: 'renderProcessGone',
      windowId: window.id,
      reason: details.reason,
      exitCode: details.exitCode,
    });

    handleRendererCrash(window);
  });

  window.webContents.on('unresponsive', () => {
    logger.warn('Window became unresponsive', { windowId: window.id });

    const response = dialog.showMessageBoxSync(window, {
      type: 'warning',
      title: 'Window Unresponsive',
      message: 'The window is not responding. Would you like to wait or close it?',
      buttons: ['Wait', 'Close'],
      defaultId: 0,
    });

    if (response === 1) {
      window.close();
    }
  });

  window.webContents.on('responsive', () => {
    logger.info('Window became responsive again', { windowId: window.id });
  });
}

/**
 * Log startup errors
 * @param {Error} error - Startup error
 */
export function logStartupError(error: Error) {
  logger.error('Application startup error', {
    error: error.message,
    stack: error.stack,
    diagnostics: getDiagnostics(),
  });

  showErrorDialog(
    'Startup Error',
    `Failed to start application: ${error.message}\n\nPlease check the logs for more details.`
  );
}
