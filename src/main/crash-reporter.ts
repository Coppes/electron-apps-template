import * as Sentry from '@sentry/electron';
import { app } from 'electron';
import { logger } from './logger.ts';
import { config } from './config.ts';

/**
 * Crash Reporting System
 * Integrates with Sentry for production error tracking
 */

interface CrashConfiguration {
  crashReporting: {
    enabled: boolean;
    dsn?: string;
    environment?: string;
    sampleRate?: number;
    attachStacktrace?: boolean;
    attachScreenshot?: boolean;
  };
}

/**
 * Initialize crash reporting service
 * Only initializes if enabled in config and DSN is provided
 */
export function initializeCrashReporting(configuration: CrashConfiguration = config as CrashConfiguration) {
  if (!configuration.crashReporting.enabled) {
    logger.info('Crash reporting disabled');
    return;
  }

  if (!configuration.crashReporting.dsn) {
    logger.warn('Crash reporting enabled but no DSN configured');
    return;
  }

  try {
    Sentry.init({
      dsn: configuration.crashReporting.dsn,
      environment: configuration.crashReporting.environment,
      release: `${app.getName()}@${app.getVersion()}`,
      sampleRate: configuration.crashReporting.sampleRate,
      attachStacktrace: configuration.crashReporting.attachStacktrace,

      // Sanitize events before sending
      beforeSend(event: any): any {
        return sanitizeEvent(event as Sentry.Event);
      },

      // Disable automatic breadcrumb collection for screenshots
      integrations: (integrations) => {
        return integrations.filter(integration => {
          // Remove screenshot integration if disabled
          if (!configuration.crashReporting.attachScreenshot && integration.name === 'Screenshot') {
            return false;
          }
          return true;
        });
      },
    });

    logger.info('Crash reporting initialized', {
      environment: configuration.crashReporting.environment,
      release: `${app.getName()}@${app.getVersion()}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to initialize crash reporting', { error: message });
  }
}

/**
 * Sanitize event before sending to remove sensitive data
 * @param {Object} event - Sentry event object
 * @returns {Object|null} Sanitized event or null to drop
 */
export function sanitizeEvent(event: Sentry.Event): Sentry.Event | null {
  try {
    // Sanitize file paths - replace username
    if (event.exception?.values) {
      event.exception.values.forEach(exception => {
        if (exception.stacktrace?.frames) {
          exception.stacktrace.frames.forEach(frame => {
            if (frame.filename) {
              frame.filename = sanitizeFilePath(frame.filename);
            }
            if (frame.abs_path) {
              frame.abs_path = sanitizeFilePath(frame.abs_path);
            }
          });
        }
      });
    }

    // Sanitize top-level message
    if (event.message) {
      event.message = sanitizeFilePath(event.message);
    }

    // Sanitize breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
        if (breadcrumb.message) {
          breadcrumb.message = sanitizeFilePath(breadcrumb.message);
        }
        if (breadcrumb.data) {
          breadcrumb.data = sanitizeObject(breadcrumb.data);
        }
        return breadcrumb;
      });
    }

    // Sanitize contexts
    if (event.contexts) {
      event.contexts = sanitizeObject(event.contexts) as Record<string, any>;
    }

    // Sanitize extra data
    if (event.extra) {
      event.extra = redactEnvironmentVariables(event.extra as Record<string, string>);
    }

    // Redact environment variables
    if (event.contexts?.runtime?.env) {
      event.contexts.runtime.env = redactEnvironmentVariables(event.contexts.runtime.env as Record<string, string>);
    }

    return event;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to sanitize crash report', { error: message });
    return event; // Return unsanitized rather than dropping
  }
}

/**
 * Sanitize file paths to remove usernames and sensitive info
 * @param {string} path - File path to sanitize
 * @returns {string} Sanitized path
 */
function sanitizeFilePath(path: string): string {
  if (typeof path !== 'string') return path;

  // Replace home directory paths
  const homePatterns = [
    /\/Users\/[^/]+/g,           // macOS: /Users/username
    /\/home\/[^/]+/g,            // Linux: /home/username
    /C:\\Users\\[^\\]+/g,         // Windows: C:\Users\username
  ];

  let sanitized = path;
  homePatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[user]');
  });

  return sanitized;
}

/**
 * Redact sensitive environment variables
 * @param {Object} env - Environment variables object
 * @returns {Object} Redacted environment variables
 */
function redactEnvironmentVariables(env: Record<string, string>): Record<string, string> {
  const sensitivePatterns = [
    /_SECRET$/i,
    /_KEY$/i,
    /_TOKEN$/i,
    /_PASSWORD$/i,
    /^AWS_/i,
    /^SENTRY_DSN$/i,
  ];

  const redacted: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    const isSensitive = sensitivePatterns.some(pattern => pattern.test(key));
    redacted[key] = isSensitive ? '[REDACTED]' : value;
  }

  return redacted;
}

/**
 * Recursively sanitize objects
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeFilePath(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Report an error to crash reporting service
 * @param {Error|string} error - Error to report
 * @param {Object} [context] - Additional context
 */
export function reportError(error: Error | string | unknown, context: Record<string, any> = {}) {
  // Always log locally
  if (error instanceof Error) {
    logger.error('Error reported to crash reporting', {
      message: error.message,
      stack: error.stack,
      context,
    });
  } else {
    logger.error('Error reported to crash reporting', {
      error: String(error),
      context,
    });
  }

  // Send to Sentry if enabled
  if (!config.crashReporting.enabled) {
    return;
  }

  try {
    Sentry.withScope(scope => {
      // Add custom context
      Object.entries(context).forEach(([key, value]) => {
        if (value && typeof value === 'object') {
          scope.setContext(key, value as Record<string, any>);
        } else {
          // Primitive values can't be set as context directly in some Sentry SDK versions, but let's try or wrap
          scope.setContext(key, { value });
        }
      });

      // Add tags
      if (typeof context === 'object' && context !== null && 'type' in context) {
        scope.setTag('error.type', (context as any).type);
      }

      // Capture exception
      if (error instanceof Error) {
        Sentry.captureException(error);
      } else {
        Sentry.captureMessage(String(error), 'error');
      }
    });
  } catch (sentryError) {
    const message = sentryError instanceof Error ? sentryError.message : String(sentryError);
    logger.error('Failed to report error to Sentry', { error: message });
  }
}

/**
 * Add a breadcrumb to track user actions
 * @param {Object} breadcrumb - Breadcrumb data
 * @param {string} breadcrumb.message - Breadcrumb message
 * @param {string} [breadcrumb.category] - Category (navigation, user, etc.)
 * @param {string} [breadcrumb.level] - Level (info, warning, error)
 * @param {Object} [breadcrumb.data] - Additional data
 */
export function addBreadcrumb(breadcrumb: { message: string, category?: string, level?: Sentry.SeverityLevel, data?: Record<string, any> }) {
  if (!config.crashReporting.enabled) {
    return;
  }

  try {
    Sentry.addBreadcrumb({
      message: breadcrumb.message,
      category: breadcrumb.category || 'app',
      level: breadcrumb.level || 'info',
      data: breadcrumb.data || {},
      timestamp: Date.now() / 1000,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to add breadcrumb', { error: message });
  }
}

/**
 * Set user context for crash reports
 * @param {Object} user - User information (no PII)
 * @param {string} [user.id] - Anonymous user ID
 * @param {string} [user.environment] - User environment
 */
export function setUserContext(user: { id?: string, environment?: string }) {
  if (!config.crashReporting.enabled) {
    return;
  }

  try {
    Sentry.setUser({
      id: user.id,
      environment: user.environment,
      // Do NOT include email, username, or other PII
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to set user context', { error: message });
  }
}

/**
 * Clear user context
 */
export function clearUserContext() {
  if (!config.crashReporting.enabled) {
    return;
  }

  try {
    Sentry.setUser(null);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to clear user context', { error: message });
  }
}
