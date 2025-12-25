/**
 * useOfflineStatus Hook
 * Custom React hook for monitoring network connectivity
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for monitoring online/offline status
 * @returns {object} Online status and utilities
 */
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [lastCheck, setLastCheck] = useState(null);

  // Fetch current status
  const fetchStatus = useCallback(async () => {
    try {
      const result = await window.electronAPI.data.getConnectivityStatus();
      if (result.success) {
        setIsOnline(result.online);
        setLastCheck(result.lastCheck || Date.now());
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch connectivity status:', error);
    }
  }, []);

  // Listen for connectivity changes
  useEffect(() => {
    // Initial fetch (using setTimeout to avoid synchronous state update)
    const timer = setTimeout(() => {
      fetchStatus();
    }, 0);

    // Listen for connectivity events
    const cleanup = window.electronAPI.data.onConnectivityChanged?.((data) => {
      setIsOnline(data.online);
      setLastCheck(data.timestamp || Date.now());
    });

    return () => {
      clearTimeout(timer);
      if (cleanup) {
        cleanup();
      }
    };
  }, [fetchStatus]);

  // Force check
  const checkNow = useCallback(async () => {
    await fetchStatus();
  }, [fetchStatus]);

  return {
    isOnline,
    isOffline: !isOnline,
    lastCheck,
    checkNow
  };
}

export default useOfflineStatus;
