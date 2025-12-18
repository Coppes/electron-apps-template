import { useCallback } from 'react';

/**
 * Hook for interacting with Dock (macOS) and Taskbar (Windows)
 * @returns {Object} Dock integration methods
 */
export function useDock() {
  const setBadge = useCallback(async (text) => {
    try {
      if (window.electronAPI.os && window.electronAPI.os.setDockBadge) {
        return await window.electronAPI.os.setDockBadge(text);
      }
      console.warn('Dock API not available');
      return { success: false, error: 'API not available' };
    } catch (error) {
      console.error('Failed to set dock badge', error);
      return { success: false, error: error.message };
    }
  }, []);

  const setMenu = useCallback(async (template) => {
    try {
      if (window.electronAPI.os && window.electronAPI.os.setDockMenu) {
        return await window.electronAPI.os.setDockMenu(template);
      }
      console.warn('Dock API not available');
      return { success: false, error: 'API not available' };
    } catch (error) {
      console.error('Failed to set dock menu', error);
      return { success: false, error: error.message };
    }
  }, []);

  return {
    setBadge,
    setMenu
  };
}
