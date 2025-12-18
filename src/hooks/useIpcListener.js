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
      return;
    }

    const eventHandler = (event, ...args) => {
      if (savedListener.current) {
        savedListener.current(event, ...args);
      }
    };

    window.electron.ipcRenderer.on(channel, eventHandler);

    return () => {
      if (!window.electron || !window.electron.ipcRenderer) return;

      // Remove specific listener
      if (window.electron.ipcRenderer.removeListener) {
        window.electron.ipcRenderer.removeListener(channel, eventHandler);
      } else {
        // Fallback or specific implementation check
        window.electron.ipcRenderer.removeAllListeners(channel);
      }
    };
  }, [channel]);
}
