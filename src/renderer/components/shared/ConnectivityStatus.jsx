import React, { useEffect } from 'react';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';
import { useStatusBar } from '../../hooks/useStatusBar';
import { CloudCheck, WifiSlash } from '@phosphor-icons/react';

/**
 * ConnectivityStatus Component
 * Displays network connectivity status in the global status bar
 */
export default function ConnectivityStatus() {
  const { isOnline } = useOfflineStatus();
  const { update } = useStatusBar({
    id: 'connectivity-status',
    position: 'right',
    priority: 100,
    content: null,
  });

  useEffect(() => {
    update({
      content: (
        <div className="flex items-center gap-2 px-2" title={isOnline ? 'Network: Online' : 'Network: Offline'}>
          {isOnline ? (
            <>
              <CloudCheck className="w-3 h-3 text-green-300" />
              <span className="hidden sm:inline">Online</span>
            </>
          ) : (
            <>
              <WifiSlash className="w-3 h-3 text-red-300" />
              <span className="text-red-300 font-bold">Offline</span>
            </>
          )}
        </div>
      )
    });
  }, [isOnline, update]);

  return null; // This component doesn't render anything itself, it injects into StatusBar
}
