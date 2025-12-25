import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
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
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        // Simulate sync stats updates
        const interval = setInterval(() => {
            if (window.electronAPI?.data?.getSyncStats) {
                window.electronAPI.data.getSyncStats().then(setSyncStats).catch(() => { });
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
        }
        catch (error) {
            // Sync failed, will be retried automatically
        }
    };
    const handleClearQueue = async () => {
        try {
            if (window.electronAPI?.data?.clearSyncQueue) {
                await window.electronAPI.data.clearSyncQueue();
                setSyncStats({ pending: 0, completed: 0, failed: 0 });
            }
        }
        catch (error) {
            // Clear queue failed
        }
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('demo.status_title') }), _jsx(CardDescription, { children: t('demo.status_desc') })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: `w-4 h-4 rounded-full ${effectiveOnline ? 'bg-green-500' : 'bg-red-500'}` }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: effectiveOnline ? t('demo.online') : t('demo.offline') }), _jsx("div", { className: "text-sm text-muted-foreground", children: manualOffline ? t('demo.manual_mode') : isOnline ? t('demo.connected') : t('demo.disconnected') })] })] }), _jsx(Button, { variant: "outline", onClick: handleToggleManualOffline, children: manualOffline ? t('demo.enable_net') : t('demo.sim_offline') })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('demo.stats_title') }), _jsx(CardDescription, { children: t('demo.stats_desc') })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center p-4 border border-border rounded", children: [_jsx("div", { className: "text-2xl font-bold", children: syncStats.pending }), _jsx("div", { className: "text-sm text-muted-foreground", children: t('demo.pending') })] }), _jsxs("div", { className: "text-center p-4 border border-border rounded", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: syncStats.completed }), _jsx("div", { className: "text-sm text-muted-foreground", children: t('demo.completed') })] }), _jsxs("div", { className: "text-center p-4 border border-border rounded", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: syncStats.failed }), _jsx("div", { className: "text-sm text-muted-foreground", children: t('demo.failed') })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: handleTriggerSync, disabled: !effectiveOnline || syncStats.pending === 0, children: t('demo.trigger_sync') }), _jsx(Button, { variant: "outline", onClick: handleClearQueue, disabled: syncStats.pending === 0, children: t('demo.clear_queue') })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('demo.queue_title') }), _jsx(CardDescription, { children: t('demo.queue_desc') })] }), _jsx(CardContent, { children: _jsx(SyncQueueViewer, {}) })] })] }));
}
