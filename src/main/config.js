import { app } from 'electron';
import { ENV } from '../common/constants.js';

/**
 * Environment and configuration management
 */

/**
 * Check if running in development mode
 * @returns {boolean}
 */
export function isDevelopment() {
  return process.env.NODE_ENV !== 'production' && !app.isPackaged;
}

/**
 * Check if running in production mode
 * @returns {boolean}
 */
export function isProduction() {
  return process.env.NODE_ENV === 'production' || app.isPackaged;
}

/**
 * Check if running in test mode
 * @returns {boolean}
 */
export function isTest() {
  return process.env.NODE_ENV === 'test';
}

/**
 * Get current environment
 * @returns {string}
 */
export function getEnvironment() {
  if (isTest()) return ENV.TEST;
  if (isDevelopment()) return ENV.DEVELOPMENT;
  return ENV.PRODUCTION;
}

/**
 * Application configuration
 */
export const config = {
  // Environment
  env: getEnvironment(),
  isDevelopment: isDevelopment(),
  isProduction: isProduction(),
  isTest: isTest(),

  // Application
  app: {
    name: app.getName(),
    version: app.getVersion(),
  },

  // Window
  window: {
    devTools: isDevelopment(),
    autoOpenDevTools: isDevelopment(),
  },

  // Security
  security: {
    cspEnabled: isProduction(),
    strictNavigation: isProduction(),
    allowedOrigins: isDevelopment() ? ['http://localhost:5173', 'http://localhost:5174'] : [],
  },

  // Logging
  logging: {
    level: isDevelopment() ? 'debug' : 'info',
    console: isDevelopment(),
    file: true,
  },

  // Updates
  updates: {
    enabled: isProduction(),
    autoDownload: false,
    autoInstallOnAppQuit: true,
  },

  // Single Instance
  singleInstance: {
    enabled: true,
  },

  // Deep Linking
  deepLinking: {
    enabled: true,
  },

  // Crash Recovery
  crashRecovery: {
    enabled: true,
  },

  // Paths (will be resolved at runtime)
  paths: {
    userData: app.getPath('userData'),
    appData: app.getPath('appData'),
    temp: app.getPath('temp'),
    logs: app.getPath('logs'),
  },
};

/**
 * Override config with environment variables
 * Environment variables should be prefixed with APP_
 * Example: APP_LOGGING_LEVEL=debug
 */
export function loadEnvironmentOverrides() {
  const overrides = {};

  // Log level override
  if (process.env.APP_LOGGING_LEVEL) {
    config.logging.level = process.env.APP_LOGGING_LEVEL;
    overrides.logging_level = process.env.APP_LOGGING_LEVEL;
  }

  // Updates enabled override
  if (process.env.APP_UPDATES_ENABLED !== undefined) {
    config.updates.enabled = process.env.APP_UPDATES_ENABLED === 'true';
    overrides.updates_enabled = config.updates.enabled;
  }

  // Single instance override
  if (process.env.APP_SINGLE_INSTANCE !== undefined) {
    config.singleInstance.enabled = process.env.APP_SINGLE_INSTANCE === 'true';
    overrides.single_instance = config.singleInstance.enabled;
  }

  return overrides;
}
