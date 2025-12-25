import { app } from 'electron';
import { logger } from './main/logger.ts';
import { lifecycleManager } from './main/lifecycle.ts';
import { updater } from './main/updater.ts';
import { initializeCrashReporting } from './main/crash-reporter.ts';
import { setupErrorHandlers, logStartupError } from './main/error-handler.ts';
import { setupDevTools, logEnvironmentInfo, setupPerformanceMonitoring } from './main/dev-tools.ts';
import { applyCSP } from './main/security/csp.ts';
import { setupSecurityGuards } from './main/security/navigation-guard.ts';
import { setupAllPermissionHandlers } from './main/security/permissions.ts';
import { initSecurityAuditLog } from './main/security/audit-log.ts';
import { isDevelopment } from './main/config.ts';

/**
 * Main process entry point
 * Orchestrates application lifecycle and wires together all modules
 */

// Initialize crash reporting early (before error handlers)
initializeCrashReporting();

// Setup error handlers early
setupErrorHandlers();

/**
 * Handle single instance lock
 */
if (!lifecycleManager.setupSingleInstance()) {
  app.quit();
}

/**
 * Setup deep linking protocol
 */
lifecycleManager.setupDeepLinking();

/**
 * App ready event - Initialize application
 */
app.on('ready', async () => {
  try {
    // Initialize security audit log
    initSecurityAuditLog();

    // Log environment info in development
    if (isDevelopment()) {
      logEnvironmentInfo();
      setupPerformanceMonitoring();
    }

    // Initialize lifecycle manager (starts application)
    await lifecycleManager.startup();

    // Initialize auto-updater (async)
    await updater.initialize();

    // Check for updates on startup (production only)
    if (!isDevelopment()) {
      setTimeout(() => {
        updater.checkForUpdates().catch(err => {
          logger.warn('Update check failed', err);
        });
      }, 5000); // Wait 5 seconds after startup
    }

    logger.info('Application ready and initialized');
  } catch (error) {
    logStartupError(error);
    app.quit();
  }
});

/**
 * All windows closed - Quit on non-macOS platforms
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Activate (macOS) - Recreate window when dock icon is clicked
 */
app.on('activate', async () => {
  const { windowManager } = await import('./main/window-manager.ts');
  const mainWindow = windowManager.getWindowByType('main');
  
  if (!mainWindow) {
    windowManager.createWindow('main');
  }
});

/**
 * Before quit - Graceful shutdown
 */
app.on('before-quit', async (event) => {
  event.preventDefault();
  await lifecycleManager.shutdown();
  app.exit(0);
});

/**
 * Setup security and dev tools for all web contents
 */
app.on('web-contents-created', (event, contents) => {
  // Setup permission handlers for the session
  setupAllPermissionHandlers(contents.session);

  // Apply security guards
  setupSecurityGuards(contents);

  // Apply CSP in production
  if (!isDevelopment()) {
    applyCSP(contents);
  }

  // Setup DevTools in development
  if (isDevelopment() && contents.getType() === 'window') {
    contents.on('did-finish-load', () => {
      const window = contents.getOwnerBrowserWindow?.();
      if (window) {
        setupDevTools(window);
      }
    });
  }
});

/**
 * Handle GPU process crashes
 */
app.on('gpu-process-crashed', (event, killed) => {
  logger.error('GPU process crashed', { killed });
});

/**
 * Handle child process gone
 */
app.on('child-process-gone', (event, details) => {
  logger.error('Child process gone', {
    type: details.type,
    reason: details.reason,
    exitCode: details.exitCode,
  });
});

logger.info('Main process initialized, waiting for ready event');

