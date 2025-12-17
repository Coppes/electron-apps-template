import { useEffect, useRef } from 'react';

/**
 * Hook to listen for IPC messages with automatic cleanup.
 * @param {string} channel - The IPC channel to listen to.
 * @param {function} listener - The callback function.
 */
export function useIpcListener(channel, listener) {
  const savedListener = useRef(listener);

  useEffect(() => {
    savedListener.current = listener;
  }, [listener]);

  useEffect(() => {
    if (!window.electron || !window.electron.ipcRenderer) {
      console.warn('IPC renderer not available');
      return;
    }

    const eventHandler = (event, ...args) => {
      if (savedListener.current) {
        savedListener.current(event, ...args);
      }
    };

    window.electron.ipcRenderer.on(channel, eventHandler);

    return () => {
      // Remove specific listener
      // Note: This assumes exposeInMainWorld exposes removeListener or similar.
      // If using the standard pattern where 'on' returns a cleanup function or we need removeListener:
      if (window.electron.ipcRenderer.removeListener) {
        window.electron.ipcRenderer.removeListener(channel, eventHandler);
      } else {
        // Fallback or specific implementation check
        // Often context bridges expose a specific 'off' or return a disposer
        window.electron.ipcRenderer.removeAllListeners(channel);
      }
    };
  }, [channel]);
}
