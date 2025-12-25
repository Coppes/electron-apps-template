/**
 * Splash Screen Manager
 * Handles creation, display, and cleanup of the splash screen
 */
export declare class SplashManager {
    constructor();
    /**
     * Show the splash screen
     * @returns {BrowserWindow} The created splash window
     */
    show(): any;
    /**
     * Fade out and destroy the splash screen
     */
    fadeOut(): Promise<void>;
    /**
     * Hide and destroy the splash screen
     */
    destroy(): void;
    /**
     * Check if splash screen is visible
     * @returns {boolean} True if visible
     */
    isVisible(): boolean;
}
export declare const splashManager: SplashManager;
