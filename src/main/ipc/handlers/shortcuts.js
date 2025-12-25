import { IPC_CHANNELS } from '../../../common/constants.ts';
import { shortcutManager } from '../../shortcuts.ts';
import { windowManager } from '../../window-manager.ts';
/**
 * Global Shortcuts IPC Handlers
 */
/**
 * Create shortcut IPC handlers
 * @returns {Object} Handler map
 */
export function createShortcutHandlers() {
    return {
        [IPC_CHANNELS.SHORTCUT_REGISTER]: async ({ accelerator, description }) => {
            if (!accelerator || typeof accelerator !== 'string') {
                throw new Error('Invalid accelerator');
            }
            // Security: check whitelist
            if (!shortcutManager.isWhitelisted(accelerator)) {
                throw new Error(`Shortcut not whitelisted: ${accelerator}`);
            }
            // Create handler that sends event to renderer
            const handler = () => {
                const windows = windowManager.getAllWindows();
                windows.forEach((win) => {
                    if (win.window && !win.window.isDestroyed()) {
                        win.window.webContents.send(IPC_CHANNELS.SHORTCUT_TRIGGERED, {
                            accelerator,
                            description
                        });
                    }
                });
            };
            const success = shortcutManager.register(accelerator, handler, description || '');
            if (!success) {
                throw new Error('Failed to register shortcut (may be in use by another application)');
            }
            return { success, accelerator };
        },
        [IPC_CHANNELS.SHORTCUT_UNREGISTER]: async ({ accelerator }) => {
            if (!accelerator || typeof accelerator !== 'string') {
                throw new Error('Invalid accelerator');
            }
            const success = shortcutManager.unregister(accelerator);
            return { success };
        },
        [IPC_CHANNELS.SHORTCUT_UNREGISTER_ALL]: async () => {
            const success = shortcutManager.unregisterAll();
            return { success };
        },
        [IPC_CHANNELS.SHORTCUT_IS_REGISTERED]: async ({ accelerator }) => {
            if (!accelerator || typeof accelerator !== 'string') {
                throw new Error('Invalid accelerator');
            }
            const registered = shortcutManager.isRegistered(accelerator);
            return { registered };
        },
        [IPC_CHANNELS.SHORTCUT_LIST_ACTIVE]: async () => {
            const shortcuts = shortcutManager.listActive();
            return { shortcuts };
        },
    };
}
export const shortcutHandlers = createShortcutHandlers();
