import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FloppyDisk, DownloadSimple, Paperclip, FileArchive, Eye } from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Switch from '../ui/Switch';
import Label from '../ui/Label';
import Separator from '../ui/Separator';
import DropZone from '../features/data-management/DropZone';
import useDragDrop from '../../hooks/useDragDrop';
/**
 * DataManagementDemo Component
 * Demonstrates backup, import/export, file watching, and drag-drop features
 */
export default function DataManagementDemo() {
    const { t } = useTranslation('data_management');
    const [activeTab, setActiveTab] = useState('backup');
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [exportData, setExportData] = useState({ key: 'value', array: [1, 2, 3] });
    const [watchedPath, setWatchedPath] = useState('');
    const [fileEvents, setFileEvents] = useState([]);
    const [autoReload, setAutoReload] = useState(false);
    const [schedule, setSchedule] = useState('never');
    const [nextBackup, setNextBackup] = useState(null);
    // Hooks
    const { startDrag } = useDragDrop({
        onError: (err) => setMessage({ type: 'error', text: err.message })
    });
    // const { isOnline } = useOfflineStatus();
    useEffect(() => {
        loadBackups();
        // Listen for file change events
        const cleanup = window.electronAPI?.file?.onFileChanged?.((event) => {
            // Event format might vary, standardizing here
            const eventData = typeof event === 'string' ? { path: event, type: 'changed' } : event;
            // Update event log
            setFileEvents(prev => [...prev, { ...eventData, timestamp: new Date().toISOString() }].slice(-10));
            // Handle File Deletion
            if (eventData.type === 'unlink' || eventData.type === 'delete') {
                setMessage({ type: 'error', text: t('demo.file_watch.deleted_error', { path: eventData.path }) });
                window.electronAPI?.notifications?.show({
                    title: t('demo.file_watch.deleted_notification_title'),
                    body: t('demo.file_watch.deleted_notification_body', { path: eventData.path }),
                    urgency: 'critical'
                }).catch(() => { }); // console.error
                return;
            }
            // Handle Auto-Reload or Notification
            if (autoReload && eventData.type === 'changed') {
                // Simulate auto-reload
                setMessage({ type: 'success', text: t('demo.file_watch.reload_success', { path: eventData.path }) });
            }
            else {
                // Show native notification
                window.electronAPI?.notifications?.show({
                    title: t('demo.file_watch.update_notification_title'),
                    body: t('demo.file_watch.update_notification_body', { type: eventData.type === 'rename' ? 'renamed' : 'changed', path: eventData.path }),
                    silent: true
                }).catch(() => { }); // err => console.error('Failed to show notification:', err)
            }
        });
        // Load schedule
        const loadSchedule = async () => {
            try {
                const savedSchedule = await window.electronAPI.store.get('backupSchedule');
                if (savedSchedule) {
                    setSchedule(savedSchedule);
                    calculateNextBackup(savedSchedule);
                }
            }
            catch (_error) {
                // console.error('Failed to load schedule:', _error);
            }
        };
        loadSchedule();
        return () => cleanup?.();
    }, [autoReload, t]); // added autoReload dependency for closure
    const calculateNextBackup = (sch) => {
        if (sch === 'never') {
            setNextBackup(null);
            return;
        }
        const now = new Date();
        const next = new Date(now);
        if (sch === 'daily')
            next.setDate(now.getDate() + 1);
        if (sch === 'weekly')
            next.setDate(now.getDate() + 7);
        if (sch === 'monthly')
            next.setMonth(now.getMonth() + 1);
        next.setHours(2, 0, 0, 0); // Default to 2 AM
        setNextBackup(next);
    };
    const handleScheduleChange = async (e) => {
        const newSchedule = e.target.value;
        setSchedule(newSchedule);
        calculateNextBackup(newSchedule);
        try {
            await window.electronAPI.store.set('backupSchedule', newSchedule);
        }
        catch (err) {
            // console.error('Failed to save schedule:', err);
        }
    };
    const loadBackups = async () => {
        try {
            setLoading(true);
            const result = await window.electronAPI.data.listBackups();
            setBackups(result.backups || []);
        }
        catch (error) {
            setMessage({ type: 'error', text: `Failed to load backups: ${error.message}` });
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateBackup = async () => {
        try {
            setLoading(true);
            setMessage(null);
            const result = await window.electronAPI.data.createBackup({
                includeSecureStorage: true,
            });
            setMessage({ type: 'success', text: t('demo.backup.create_success', { filename: result.filename }) });
            await loadBackups();
        }
        catch (error) {
            setMessage({ type: 'error', text: t('demo.backup.create_error', { error: error.message }) });
        }
        finally {
            setLoading(false);
        }
    };
    const handleRestoreBackup = async (filename) => {
        try {
            setLoading(true);
            setMessage(null);
            await window.electronAPI.data.restoreBackup({ filename });
            setMessage({ type: 'success', text: `Restored from: ${filename}` });
        }
        catch (error) {
            setMessage({ type: 'error', text: t('demo.backup.restore_error', { error: error.message }) });
        }
        finally {
            setLoading(false);
        }
    };
    const handleExportData = async () => {
        try {
            setLoading(true);
            setMessage(null);
            // 1. Choose location
            const filePath = await window.electronAPI.dialog.showSaveDialog({
                defaultPath: 'export.json',
                filters: [{ name: 'JSON', extensions: ['json'] }]
            });
            if (filePath) {
                const result = await window.electronAPI.data.export(filePath, exportData);
                if (result.success) {
                    setMessage({ type: 'success', text: t('demo.import_export.export_success', { path: filePath }) });
                }
                else {
                    throw new Error(result.error || 'Export failed');
                }
            }
        }
        catch (error) {
            setMessage({ type: 'error', text: t('demo.import_export.export_error', { error: error.message }) });
        }
        finally {
            setLoading(false);
        }
    };
    const handleImportData = async () => {
        try {
            setLoading(true);
            setMessage(null);
            const filePath = await window.electronAPI.dialog.showOpenDialog({
                title: 'Import Data',
                filters: [{ name: 'JSON Files', extensions: ['json'] }],
                properties: ['openFile']
            });
            if (filePath) {
                const result = await window.electronAPI.data.import(filePath);
                if (result.success) {
                    setMessage({ type: 'success', text: t('demo.import_export.import_success') });
                }
                else {
                    throw new Error(result.error || 'Import failed');
                }
            }
        }
        catch (error) {
            setMessage({ type: 'error', text: t('demo.import_export.import_error', { error: error.message }) });
        }
        finally {
            setLoading(false);
        }
    };
    const handleWatchFolder = async () => {
        try {
            setLoading(true);
            setMessage(null);
            const filePath = await window.electronAPI.dialog.showOpenDialog({
                title: 'Select Folder to Watch',
                properties: ['openDirectory']
            });
            if (filePath) {
                await window.electronAPI.file.watchStart(filePath);
                setWatchedPath(filePath);
                setMessage({ type: 'success', text: t('demo.file_watch.watch_success', { path: filePath }) });
            }
        }
        catch (error) {
            setMessage({ type: 'error', text: t('demo.file_watch.watch_error', { error: error.message }) });
        }
        finally {
            setLoading(false);
        }
    };
    const handleUnwatchFolder = async () => {
        try {
            if (!watchedPath)
                return;
            await window.electronAPI.file.watchStop(watchedPath);
            setWatchedPath('');
            setFileEvents([]);
            setMessage({ type: 'success', text: t('demo.file_watch.stop_success') });
        }
        catch (error) {
            setMessage({ type: 'error', text: t('demo.file_watch.stop_error', { error: error.message }) });
        }
    };
    const handleFileDrop = async (files) => {
        setMessage({ type: 'info', text: t('demo.drag_drop.received', { count: files.length }) });
    };
    const handleDragStart = (e, backup) => {
        e.preventDefault();
        if (!backup.path) {
            setMessage({ type: 'error', text: t('demo.drag_drop.path_missing') });
            return;
        }
        // We can provide a custom icon path here if we had one
        startDrag(backup.path);
        setMessage({ type: 'info', text: t('demo.drag_drop.dragging', { filename: backup.filename }) });
    };
    const tabs = [
        { id: 'backup', label: t('demo.tabs.backup'), icon: FloppyDisk },
        { id: 'import-export', label: t('demo.tabs.import_export'), icon: DownloadSimple },
        { id: 'file-watch', label: t('demo.tabs.file_watch'), icon: Eye },
        { id: 'drag-drop', label: t('demo.tabs.drag_drop'), icon: Paperclip },
    ];
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex items-center justify-between border-b border-border pb-2", children: _jsx("div", { className: "flex gap-2", role: "tablist", children: tabs.map(tab => {
                        const Icon = tab.icon;
                        return (_jsxs(Button, { variant: activeTab === tab.id ? 'default' : 'ghost', className: "gap-2", onClick: () => setActiveTab(tab.id), role: "tab", "aria-selected": activeTab === tab.id, "aria-controls": `panel-${tab.id}`, children: [_jsx(Icon, { className: "w-4 h-4", "aria-hidden": "true" }), tab.label] }, tab.id));
                    }) }) }), message && (_jsx("div", { className: `p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-800' :
                    message.type === 'success' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'}`, children: message.text })), activeTab === 'backup' && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Backup & Restore" }), _jsx(CardDescription, { children: "Create and restore data backups" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("h4", { className: "text-sm font-semibold", children: "Backup Schedule" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Automate your backups" })] }), _jsxs("select", { className: "bg-background border border-border rounded text-sm p-1", value: schedule, onChange: handleScheduleChange, "aria-label": "Backup Schedule Frequency", children: [_jsx("option", { value: "never", children: t('demo.backup.schedule.never') }), _jsx("option", { value: "daily", children: t('demo.backup.schedule.daily') }), _jsx("option", { value: "weekly", children: t('demo.backup.schedule.weekly') }), _jsx("option", { value: "monthly", children: t('demo.backup.schedule.monthly') })] }), nextBackup && (_jsx("div", { className: "text-xs text-muted-foreground mt-1 text-right w-full absolute -bottom-5 right-0 px-3", children: t('demo.backup.schedule.next', { date: nextBackup.toLocaleDateString() }) }))] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: handleCreateBackup, disabled: loading, children: loading ? t('demo.backup.creating') : t('demo.backup.create_btn') }), _jsx(Button, { variant: "outline", onClick: loadBackups, disabled: loading, children: t('demo.backup.refresh') })] })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-2", children: t('demo.backup.available_backups') }), backups.length === 0 ? (_jsx("p", { className: "text-muted-foreground", children: t('demo.backup.no_backups') })) : (_jsx("div", { className: "space-y-2", children: backups.map((backup) => (_jsxs("div", { className: "flex items-center justify-between p-3 border border-border rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: backup.filename }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [new Date(backup.timestamp).toLocaleString(), " \u2022 ", (backup.size / 1024).toFixed(1), " KB"] })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleRestoreBackup(backup.filename), disabled: loading, children: t('demo.backup.restore_btn') })] }, backup.filename))) }))] })] })] })), activeTab === 'import-export' && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('demo.import_export.title') }), _jsx(CardDescription, { children: t('demo.import_export.description') })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-2", children: t('demo.import_export.export_section') }), _jsxs("div", { className: "space-y-2", children: [_jsx("textarea", { className: "w-full p-2 border border-border rounded font-mono text-sm", rows: 6, value: JSON.stringify(exportData, null, 2), "aria-label": "Data to Export (JSON)", onChange: (e) => {
                                                    try {
                                                        setExportData(JSON.parse(e.target.value));
                                                    }
                                                    catch (error) {
                                                        // Invalid JSON, ignore
                                                    }
                                                } }), _jsx(Button, { onClick: handleExportData, disabled: loading, children: t('demo.import_export.export_btn') })] })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-2", children: t('demo.import_export.import_section') }), _jsx(Button, { onClick: handleImportData, disabled: loading, children: t('demo.import_export.import_btn') })] })] })] })), activeTab === 'file-watch' && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('demo.file_watch.title') }), _jsx(CardDescription, { children: t('demo.file_watch.description') })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: handleWatchFolder, disabled: loading || !!watchedPath, children: watchedPath ? t('demo.file_watch.watching_btn') : t('demo.file_watch.select_folder') }), watchedPath && (_jsx(Button, { variant: "outline", onClick: handleUnwatchFolder, children: t('demo.file_watch.stop_watch') }))] }), watchedPath && (_jsx("div", { className: "flex flex-col gap-4", children: _jsxs("div", { className: "text-sm text-muted-foreground bg-muted p-2 rounded", children: [t('demo.file_watch.watching_label'), " ", _jsx("span", { className: "font-mono", children: watchedPath })] }) })), _jsxs("div", { className: "flex items-center space-x-2 pt-2", children: [_jsx(Switch, { id: "auto-reload", checked: autoReload, onCheckedChange: setAutoReload }), _jsx(Label, { htmlFor: "auto-reload", children: t('demo.file_watch.auto_reload') })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-2", children: t('demo.file_watch.events_title') }), fileEvents.length === 0 ? (_jsx("p", { className: "text-muted-foreground", children: t('demo.file_watch.no_events') })) : (_jsx("div", { className: "space-y-1 max-h-64 overflow-y-auto", children: fileEvents.map((event, idx) => (_jsxs("div", { className: "text-sm p-2 border border-border rounded", children: [_jsx("span", { className: "font-mono", children: event.type }), ": ", event.path, _jsx("div", { className: "text-xs text-muted-foreground", children: event.timestamp })] }, idx))) }))] })] })] })), activeTab === 'drag-drop' && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('demo.drag_drop.title') }), _jsx(CardDescription, { children: t('demo.drag_drop.description') })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-2 text-sm", children: t('demo.drag_drop.drop_title') }), _jsx(DropZone, { onDrop: handleFileDrop, accept: ['.txt', '.json', '.md'], multiple: true })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-2 text-sm", children: t('demo.drag_drop.drag_from') }), _jsx("p", { className: "text-sm text-muted-foreground mb-4", children: t('demo.drag_drop.drag_desc') }), backups.length === 0 ? (_jsx("div", { className: "p-4 border border-dashed rounded text-center text-sm text-muted-foreground", children: t('demo.drag_drop.no_drag') })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: backups.map(backup => (_jsxs("div", { draggable: true, onDragStart: (e) => handleDragStart(e, backup), className: "p-3 border border-border rounded bg-card hover:border-primary/50 cursor-grab active:cursor-grabbing flex items-center gap-3 transition-colors", children: [_jsx("div", { className: "h-10 w-10 bg-primary/10 rounded flex items-center justify-center text-primary", children: _jsx(FileArchive, { className: "w-6 h-6" }) }), _jsxs("div", { className: "overflow-hidden", children: [_jsx("div", { className: "font-medium text-sm truncate", title: backup.filename, children: backup.filename }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [(backup.size / 1024).toFixed(1), " KB"] })] })] }, backup.filename))) }))] })] })] }))] }));
}
