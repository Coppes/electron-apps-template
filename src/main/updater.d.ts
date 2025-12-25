/**
 * Auto-updater scaffolding
 * Handles application updates using electron-updater
 */
declare class Updater {
    constructor();
    /**
     * Initialize auto-updater
     */
    initialize(): Promise<void>;
    /**
     * Setup updater event handlers
     */
    setupEventHandlers(): void;
    /**
     * Check for updates
     */
    checkForUpdates(): Promise<any>;
    /**
     * Download update
     */
    downloadUpdate(): Promise<void>;
    /**
     * Install update and restart app
     */
    quitAndInstall(): void;
    /**
     * Start periodic update checks
     * @param {number} intervalMinutes - Check interval in minutes
     */
    startPeriodicChecks(intervalMinutes?: number): void;
    /**
     * Stop periodic update checks
     */
    stopPeriodicChecks(): void;
    /**
     * Check if version changed and set flag in store
     */
    checkVersion(): void;
    /**
     * Simple semantic version comparison
     * Returns > 0 if v1 > v2
     */
    compareVersions(v1: any, v2: any): any;
}
export declare const updater: Updater;
export {};
/**
 * NOTE: Auto-updater requires proper configuration:
 *
 * 1. Create electron-builder.yml in project root:
 *
 * appId: com.yourcompany.yourapp
 * productName: YourApp
 * publish:
 *   provider: github
 *   owner: your-github-username
 *   repo: your-repo-name
 *
 * 2. Or configure in package.json:
 *
 * "build": {
 *   "appId": "com.yourcompany.yourapp",
 *   "publish": {
 *     "provider": "github",
 *     "owner": "your-github-username",
 *     "repo": "your-repo-name"
 *   }
 * }
 *
 * 3. For other providers (S3, generic, etc.), see:
 * https://www.electron.build/configuration/publish
 */
