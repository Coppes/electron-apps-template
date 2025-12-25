/**
 * Environment and configuration management
 */
/**
 * Check if running in development mode
 * @returns {boolean}
 */
export declare function isDevelopment(): boolean;
/**
 * Check if running in production mode
 * @returns {boolean}
 */
export declare function isProduction(): boolean;
/**
 * Check if running in test mode
 * @returns {boolean}
 */
export declare function isTest(): boolean;
/**
 * Get current environment
 * @returns {string}
 */
export declare function getEnvironment(): string;
/**
 * Application configuration
 */
export declare const config: {
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
};
/**
 * Override config with environment variables
 * Environment variables should be prefixed with APP_
 * Example: APP_LOGGING_LEVEL=debug
 */
export declare function loadEnvironmentOverrides(): {};
