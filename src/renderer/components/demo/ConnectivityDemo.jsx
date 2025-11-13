import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import SyncQueueViewer from '../features/data-management/SyncQueueViewer';

/**
 * ConnectivityDemo Component
 * Demonstrates online/offline behavior and sync queue functionality
 */
export default function ConnectivityDemo() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStats, setSyncStats] = useState({ pending: 0, completed: 0, failed: 0 });
  const [manualOffline, setManualOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate sync stats updates
    const interval = setInterval(() => {
      if (window.electronAPI?.data?.getSyncStats) {
        window.electronAPI.data.getSyncStats().then(setSyncStats).catch(() => {});
      }
    }, 2000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const effectiveOnline = isOnline && !manualOffline;

  const handleToggleManualOffline = () => {
    setManualOffline(!manualOffline);
  };

  const handleTriggerSync = async () => {
    try {
      if (window.electronAPI?.data?.triggerSync) {
        await window.electronAPI.data.triggerSync();
      }
    } catch (error) {
      // Sync failed, will be retried automatically
    }
  };

  const handleClearQueue = async () => {
    try {
      if (window.electronAPI?.data?.clearSyncQueue) {
        await window.electronAPI.data.clearSyncQueue();
        setSyncStats({ pending: 0, completed: 0, failed: 0 });
      }
    } catch (error) {
      // Clear queue failed
    }
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>Current network and connectivity state</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${effectiveOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
              <div className="font-semibold">
                {effectiveOnline ? 'Online' : 'Offline'}
              </div>
              <div className="text-sm text-muted-foreground">
                {manualOffline ? 'Manual offline mode' : isOnline ? 'Network connected' : 'Network disconnected'}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleToggleManualOffline}
          >
            {manualOffline ? 'Enable Network' : 'Simulate Offline Mode'}
          </Button>
        </CardContent>
      </Card>

      {/* Sync Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Statistics</CardTitle>
          <CardDescription>Operations queue status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border border-border rounded">
              <div className="text-2xl font-bold">{syncStats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-4 border border-border rounded">
              <div className="text-2xl font-bold text-green-600">{syncStats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-4 border border-border rounded">
              <div className="text-2xl font-bold text-red-600">{syncStats.failed}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleTriggerSync}
              disabled={!effectiveOnline || syncStats.pending === 0}
            >
              Trigger Sync
            </Button>
            <Button
              variant="outline"
              onClick={handleClearQueue}
              disabled={syncStats.pending === 0}
            >
              Clear Queue
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Queue Viewer */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Queue</CardTitle>
          <CardDescription>Pending operations in the sync queue</CardDescription>
        </CardHeader>
        <CardContent>
          <SyncQueueViewer />
        </CardContent>
      </Card>
    </div>
  );
}
