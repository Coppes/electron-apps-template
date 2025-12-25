import { windowManager } from './window-manager.ts';
import { logger } from './logger.ts';
/**
 * Splash Screen Manager
 * Handles creation, display, and cleanup of the splash screen
 */
export class SplashManager {
    constructor() {
        this.splashWindow = null;
    }
    /**
     * Show the splash screen
     * @returns {BrowserWindow} The created splash window
     */
    show() {
        if (this.splashWindow && !this.splashWindow.isDestroyed()) {
            this.splashWindow.show();
            return this.splashWindow;
        }
        this.splashWindow = windowManager.createWindow('splash', {
            width: 400,
            height: 400,
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            resizable: false,
            movable: true,
            skipTaskbar: true,
            center: true,
            backgroundColor: '#1E1E1E', // Dark background
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: true,
            }
        });
        logger.info('Splash screen shown');
        return this.splashWindow;
    }
    /**
     * Fade out and destroy the splash screen
     */
    async fadeOut() {
        if (!this.splashWindow || this.splashWindow.isDestroyed())
            return;
        try {
            for (let i = 1.0; i >= 0; i -= 0.1) {
                if (!this.splashWindow || this.splashWindow.isDestroyed())
                    return;
                this.splashWindow.setOpacity(i);
                await new Promise(r => setTimeout(r, 40));
            }
        }
        catch (error) {
            // Ignore errors during fade
            logger.error('Error during splash fade out', error);
        }
        this.destroy();
    }
    /**
     * Hide and destroy the splash screen
     */
    destroy() {
        if (this.splashWindow && !this.splashWindow.isDestroyed()) {
            this.splashWindow.close();
            this.splashWindow = null;
            logger.info('Splash screen destroyed');
        }
    }
    /**
     * Check if splash screen is visible
     * @returns {boolean} True if visible
     */
    isVisible() {
        return !!(this.splashWindow && !this.splashWindow.isDestroyed() && this.splashWindow.isVisible());
    }
}
export const splashManager = new SplashManager();
