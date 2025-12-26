import { useCallback } from 'react';

/**
 * Hook for interacting with Dock (macOS) and Taskbar (Windows)
 * @returns {Object} Dock integration methods
 */
export function useDock() {
  const setBadge = useCallback(async (text: string) => {
    try {
      if (window.electronAPI.os && window.electronAPI.os.setDockBadge) {
        return await window.electronAPI.os.setDockBadge(text);
      }
      return { success: false, error: 'API not available' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, []);

  const setMenu = useCallback(async (template: any[]) => {
    try {
      if (window.electronAPI.os && window.electronAPI.os.setDockMenu) {
        return await window.electronAPI.os.setDockMenu(template);
      }
      // eslint-disable-next-line no-console
      console.warn('Dock API not available');
      return { success: false, error: 'API not available' };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to set dock menu', error);
      return { success: false, error: (error as Error).message };
    }
  }, []);

  return {
    setBadge,
    setMenu
  };
}
