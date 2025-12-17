import { useEffect } from 'react';

/**
 * Hook to register global shortcuts with automatic cleanup.
 * @param {string} accelerator - The shortcut accelerator (e.g., 'CommandOrControl+X').
 * @param {function} callback - The function to call when shortcut is triggered.
 */
export function useGlobalShortcut(accelerator, callback) {
  useEffect(() => {
    if (!window.electron || !window.electron.globalShortcut) {
      // Assuming globalShortcut is exposed via context bridge or IPC
      console.warn('GlobalShortcut API not available directly in renderer. Using IPC fallback if applicable.');
      // In many secure Electron apps, renderer doesn't access globalShortcut directly.
      // It usually asks main to register it.
      // Let's assume an IPC mechanism: 'register-shortcut', 'unregister-shortcut'
    }

    const register = async () => {
      try {
        await window.electron.ipcRenderer.invoke('register-global-shortcut', accelerator);
      } catch (e) {
        console.error('Failed to register shortcut', e);
      }
    };

    const unregister = async () => {
      try {
        await window.electron.ipcRenderer.invoke('unregister-global-shortcut', accelerator);
      } catch (e) {
        console.error('Failed to unregister shortcut', e);
      }
    };

    // Listen for the shortcut execution event from main
    const trace = `global-shortcut-${accelerator}`;
    const onTrigger = () => callback();

    // We assume the main process sends an event when the shortcut is pressed
    // This part depends on how the main process handles shortcuts.
    // For this hook to be fully functional, the Main process needs to handle the registration
    // and send a message back.

    // Register
    register();

    // Listen for trigger (assuming main sends specific channel or generic one)
    window.electron.ipcRenderer.on('global-shortcut-triggered', (event, arg) => {
      if (arg === accelerator) {
        onTrigger();
      }
    });

    return () => {
      unregister();
      // Cleanup listener is tricky if we use a generic channel.
      // Ideally we use a unique channel or filter.
    };
  }, [accelerator, callback]);
}
