import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import SyncQueueViewer from '../features/data-management/SyncQueueViewer';

/**
 * ConnectivityDemo Component
 * Demonstrates online/offline behavior and sync queue functionality
 */
export default function ConnectivityDemo() {
  const { t } = useTranslation('connectivity');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStats, setSyncStats] = useState({ pending: 0, completed: 0, failed: 0 });
  const [manualOffline, setManualOffline] = useState(false);

  useEffect(() => {
    // improved connectivity handling using API and fallback
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (window.electronAPI?.data?.getConnectivityStatus) {
      window.electronAPI.data.getConnectivityStatus().then(res => setIsOnline(res.data?.online ?? navigator.onLine));
    }

    // Simulate sync stats updates
    const interval = setInterval(() => {
      // Use getSyncQueueStatus
      if (window.electronAPI?.data?.getSyncQueueStatus) {
        window.electronAPI.data.getSyncQueueStatus().then(res => {
          if (res.data) {
            // Map available data to local state structure (approximated)
            setSyncStats(prev => ({ ...prev, pending: res.data?.pending || 0, completed: (res.data?.total || 0) - (res.data?.pending || 0) }));
          }
        }).catch(() => { });
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
      // Use syncQueueProcess
      if (window.electronAPI?.data?.syncQueueProcess) {
        await window.electronAPI.data.syncQueueProcess();
        // Force refresh stats
        if (window.electronAPI?.data?.getSyncQueueStatus) {
          const res = await window.electronAPI.data.getSyncQueueStatus();
          if (res.data) {
            setSyncStats(prev => ({ ...prev, pending: res.data?.pending || 0, completed: (res.data?.total || 0) - (res.data?.pending || 0) }));
          }
        }
      }
    } catch (error) {
      // Sync failed
    }
  };

  const handleClearQueue = async () => {
    // clearSyncQueue not available in preload
    console.warn('Clear queue not implemented in API');
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>{t('demo.status_title')}</CardTitle>
          <CardDescription>{t('demo.status_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${effectiveOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
              <div className="font-semibold">
                {effectiveOnline ? t('demo.online') : t('demo.offline')}
              </div>
              <div className="text-sm text-muted-foreground">
                {manualOffline ? t('demo.manual_mode') : isOnline ? t('demo.connected') : t('demo.disconnected')}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleToggleManualOffline}
          >
            {manualOffline ? t('demo.enable_net') : t('demo.sim_offline')}
          </Button>
        </CardContent>
      </Card>

      {/* Sync Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>{t('demo.stats_title')}</CardTitle>
          <CardDescription>{t('demo.stats_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border border-border rounded">
              <div className="text-2xl font-bold">{syncStats.pending}</div>
              <div className="text-sm text-muted-foreground">{t('demo.pending')}</div>
            </div>
            <div className="text-center p-4 border border-border rounded">
              <div className="text-2xl font-bold text-green-600">{syncStats.completed}</div>
              <div className="text-sm text-muted-foreground">{t('demo.completed')}</div>
            </div>
            <div className="text-center p-4 border border-border rounded">
              <div className="text-2xl font-bold text-red-600">{syncStats.failed}</div>
              <div className="text-sm text-muted-foreground">{t('demo.failed')}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleTriggerSync}
              disabled={!effectiveOnline || syncStats.pending === 0}
            >
              {t('demo.trigger_sync')}
            </Button>
            <Button
              variant="outline"
              onClick={handleClearQueue}
              disabled={syncStats.pending === 0}
            >
              {t('demo.clear_queue')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Queue Viewer */}
      <Card>
        <CardHeader>
          <CardTitle>{t('demo.queue_title')}</CardTitle>
          <CardDescription>{t('demo.queue_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <SyncQueueViewer />
        </CardContent>
      </Card>
    </div>
  );
}
