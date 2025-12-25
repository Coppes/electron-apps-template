/**
 * Crash Reporting System
 * Integrates with Sentry for production error tracking
 */
/**
 * Initialize crash reporting service
 * Only initializes if enabled in config and DSN is provided
 */
export declare function initializeCrashReporting(configuration?: {
    env: string;
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
    app: {
        name: string;
        version: string;
    };
    window: {
        devTools: boolean;
        autoOpenDevTools: boolean;
    };
    security: {
        cspEnabled: boolean;
        strictNavigation: boolean;
        allowedOrigins: string[];
        allowedPermissions: Set<string>;
    };
    logging: {
        level: string;
        console: boolean;
        file: boolean;
    };
    updates: {
        enabled: boolean;
        autoDownload: boolean;
        autoInstallOnAppQuit: boolean;
    };
    singleInstance: {
        enabled: boolean;
    };
    deepLinking: {
        enabled: boolean;
    };
    osIntegration: {
        tray: {
            enabled: boolean;
            startMinimized: boolean;
        };
        shortcuts: {
            enabled: boolean;
            defaults: {
                'CommandOrControl+Shift+K': string;
                'CommandOrControl+Shift+P': string;
            };
        };
        progress: {
            enabled: boolean;
        };
        recentDocuments: {
            enabled: boolean;
            trackAutomatically: boolean;
        };
        notifications: {
            enabled: boolean;
            sound: boolean;
        };
    };
    crashRecovery: {
        enabled: boolean;
    };
    crashReporting: {
        enabled: boolean;
        dsn: string;
        environment: string;
        sampleRate: number;
        attachStacktrace: boolean;
    };
    features: {
        tabs: boolean;
        splashScreen: boolean;
        commandPalette: boolean;
        onboarding: boolean;
    };
    paths: {
        userData: string;
        appData: string;
        temp: string;
        logs: string;
    };
}): void;
/**
 * Sanitize event before sending to remove sensitive data
 * @param {Object} event - Sentry event object
 * @returns {Object|null} Sanitized event or null to drop
 */
export declare function sanitizeEvent(event: any): any;
/**
 * Report an error to crash reporting service
 * @param {Error|string} error - Error to report
 * @param {Object} [context] - Additional context
 */
export declare function reportError(error: any, context?: {}): void;
/**
 * Add a breadcrumb to track user actions
 * @param {Object} breadcrumb - Breadcrumb data
 * @param {string} breadcrumb.message - Breadcrumb message
 * @param {string} [breadcrumb.category] - Category (navigation, user, etc.)
 * @param {string} [breadcrumb.level] - Level (info, warning, error)
 * @param {Object} [breadcrumb.data] - Additional data
 */
export declare function addBreadcrumb(breadcrumb: any): void;
/**
 * Set user context for crash reports
 * @param {Object} user - User information (no PII)
 * @param {string} [user.id] - Anonymous user ID
 * @param {string} [user.environment] - User environment
 */
export declare function setUserContext(user: any): void;
/**
 * Clear user context
 */
export declare function clearUserContext(): void;
