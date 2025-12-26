import { useState, useEffect } from 'react';

/**
 * Hook for monitoring system power state
 * @returns {string} Current power status (e.g., 'on-ac', 'on-battery', 'suspend', 'resume', 'unknown')
 */
export function usePowerMonitor() {
  const [status, setStatus] = useState('unknown');
  const [lastEventTime, setLastEventTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!window.electronAPI?.os?.onPowerStatusChange) {
      // eslint-disable-next-line no-console
      console.warn('Power Monitor API not available');
      return;
    }

    const cleanup = window.electronAPI.os.onPowerStatusChange((newStatus) => {
      // eslint-disable-next-line no-console
      console.log('Power status changed:', newStatus);
      setStatus(newStatus);
      setLastEventTime(new Date());
    });

    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);

  return { status, lastEventTime };
}
