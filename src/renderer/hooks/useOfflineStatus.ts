/**
 * useOfflineStatus Hook
 * Custom React hook for monitoring network connectivity
 */

import { useState, useEffect } from 'react';

/**
 * Hook for monitoring online/offline status
 * @returns {object} Online status and utilities
 */
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastCheck, setLastCheck] = useState<number | null>(null);

  // Listen for connectivity changes
  useEffect(() => {
    // Initial check
    const checkStatus = async () => {
      try {
        const result = await (window.electronAPI as any).invoke('connectivity:check');
        const onlineStatus = typeof result === 'boolean' ? result : result?.online ?? result?.data?.online ?? false;
        setIsOnline(!!onlineStatus);
        setLastCheck(Date.now());
      } catch (error) {
        // console.error('Failed to check connectivity', error);
      }
    };
    checkStatus();

    // Listen for updates - using any for fallback if API differs
    const eventsAPI = window.electronAPI?.events as any;
    const cleanup = eventsAPI?.onConnectivityChange ? eventsAPI.onConnectivityChange((data: any) => {
      const isOnline = typeof data === 'boolean' ? data : data?.online;
      setIsOnline(!!isOnline);
      setLastCheck(Date.now());
    }) : undefined;

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    lastCheck
  };
}

export default useOfflineStatus;
