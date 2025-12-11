import React, { useState, useEffect } from 'react';
import { FloppyDisk, DownloadSimple, Eye, Paperclip, FileArchive, CloudCheck, ArrowsClockwise, WifiSlash } from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Switch from '../ui/Switch';
import Label from '../ui/Label';
import Separator from '../ui/Separator';
import DropZone from '../features/data-management/DropZone';
import useDragDrop from '../../hooks/useDragDrop';
import useOfflineStatus from '../../hooks/useOfflineStatus';

/**
 * DataManagementDemo Component
 * Demonstrates backup, import/export, file watching, and drag-drop features
 */
export default function DataManagementDemo() {
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

  const { isOnline } = useOfflineStatus();

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
        setMessage({ type: 'error', text: `File deleted externally: ${eventData.path}` });
        window.electronAPI?.notifications?.show({
          title: 'File Deleted',
          body: `The file ${eventData.path} was deleted externally.`,
          urgency: 'critical'
        }).catch(console.error);
        return;
      }

      // Handle Auto-Reload or Notification
      if (autoReload && eventData.type === 'changed') {
        // Simulate auto-reload
        setMessage({ type: 'success', text: `File changed. Auto-reloaded: ${eventData.path}` });
      } else {
        // Show native notification
        window.electronAPI?.notifications?.show({
          title: 'File Update Detected',
          body: `File ${eventData.type === 'rename' ? 'renamed' : 'changed'}: ${eventData.path}`,
          silent: true
        }).catch(err => console.error('Failed to show notification:', err));
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
      } catch (err) {
        console.error('Failed to load schedule:', err);
      }
    };
    loadSchedule();

    return () => cleanup?.();
  }, [autoReload]); // added autoReload dependency for closure

  const calculateNextBackup = (sch) => {
    if (sch === 'never') {
      setNextBackup(null);
      return;
    }
    const now = new Date();
    const next = new Date(now);
    if (sch === 'daily') next.setDate(now.getDate() + 1);
    if (sch === 'weekly') next.setDate(now.getDate() + 7);
    if (sch === 'monthly') next.setMonth(now.getMonth() + 1);
    next.setHours(2, 0, 0, 0); // Default to 2 AM
    setNextBackup(next);
  };

  const handleScheduleChange = async (e) => {
    const newSchedule = e.target.value;
    setSchedule(newSchedule);
    calculateNextBackup(newSchedule);
    try {
      await window.electronAPI.store.set('backupSchedule', newSchedule);
    } catch (err) {
      console.error('Failed to save schedule:', err);
    }
  };

  const loadBackups = async () => {
    try {
      setLoading(true);
      const result = await window.electronAPI.data.listBackups();
      setBackups(result.backups || []);
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to load backups: ${error.message}` });
    } finally {
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
      setMessage({ type: 'success', text: `Backup created: ${result.filename}` });
      await loadBackups();
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to create backup: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async (filename) => {
    try {
      setLoading(true);
      setMessage(null);
      await window.electronAPI.data.restoreBackup({ filename });
      setMessage({ type: 'success', text: `Restored from: ${filename}` });
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to restore: ${error.message}` });
    } finally {
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
          setMessage({ type: 'success', text: `Data exported to: ${filePath}` });
        } else {
          throw new Error(result.error || 'Export failed');
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to export: ${error.message}` });
    } finally {
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
          setMessage({ type: 'success', text: `Data imported successfully` });
        } else {
          throw new Error(result.error || 'Import failed');
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to import: ${error.message}` });
    } finally {
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
        setMessage({ type: 'success', text: `Watching: ${filePath}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to watch folder: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleUnwatchFolder = async () => {
    try {
      if (!watchedPath) return;
      await window.electronAPI.file.watchStop(watchedPath);
      setWatchedPath('');
      setFileEvents([]);
      setMessage({ type: 'success', text: 'Stopped watching folder' });
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to unwatch: ${error.message}` });
    }
  };

  const handleFileDrop = async (files) => {
    setMessage({ type: 'info', text: `Received ${files.length} file(s)` });
  };

  const handleDragStart = (e, backup) => {
    e.preventDefault();
    if (!backup.path) {
      setMessage({ type: 'error', text: 'Backup file path not available for drag' });
      return;
    }

    // We can provide a custom icon path here if we had one
    startDrag(backup.path);
    setMessage({ type: 'info', text: `Dragging ${backup.filename}...` });
  };

  const tabs = [
    { id: 'backup', label: 'Backup & Restore', icon: FloppyDisk },
    { id: 'import-export', label: 'Import & Export', icon: DownloadSimple },
    { id: 'drag-drop', label: 'Drag & Drop', icon: Paperclip },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        {/* Tab Navigation */}
        <div className="flex gap-2" role="tablist">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                className="gap-2"
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-800' :
          message.type === 'success' ? 'bg-green-100 text-green-800' :
            'bg-blue-100 text-blue-800'
          }`}>
          {message.text}
        </div>
      )}

      {/* Backup & Restore Tab */}
      {activeTab === 'backup' && (
        <Card>
          <CardHeader>
            <CardTitle>Backup & Restore</CardTitle>
            <CardDescription>Create and restore data backups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border">
                <div className="flex flex-col">
                  <h4 className="text-sm font-semibold">Backup Schedule</h4>
                  <p className="text-xs text-muted-foreground">Automate your backups</p>
                </div>
                <select
                  className="bg-background border border-border rounded text-sm p-1"
                  value={schedule}
                  onChange={handleScheduleChange}
                  aria-label="Backup Schedule Frequency"
                >
                  <option value="never">Never</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                {nextBackup && (
                  <div className="text-xs text-muted-foreground mt-1 text-right w-full absolute -bottom-5 right-0 px-3">
                    Next: {nextBackup.toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateBackup} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Backup'}
                </Button>
                <Button variant="outline" onClick={loadBackups} disabled={loading}>
                  Refresh
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Available Backups</h3>
              {backups.length === 0 ? (
                <p className="text-muted-foreground">No backups found</p>
              ) : (
                <div className="space-y-2">
                  {backups.map((backup) => (
                    <div key={backup.filename} className="flex items-center justify-between p-3 border border-border rounded">
                      <div>
                        <div className="font-medium">{backup.filename}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(backup.timestamp).toLocaleString()} • {(backup.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreBackup(backup.filename)}
                        disabled={loading}
                      >
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import & Export Tab */}
      {activeTab === 'import-export' && (
        <Card>
          <CardHeader>
            <CardTitle>Import & Export</CardTitle>
            <CardDescription>Export and import data in various formats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Export Data</h3>
              <div className="space-y-2">
                <textarea
                  className="w-full p-2 border border-border rounded font-mono text-sm"
                  rows={6}
                  value={JSON.stringify(exportData, null, 2)}
                  aria-label="Data to Export (JSON)"
                  onChange={(e) => {
                    try {
                      setExportData(JSON.parse(e.target.value));
                    } catch (error) {
                      // Invalid JSON, ignore
                    }
                  }}
                />
                <Button onClick={handleExportData} disabled={loading}>
                  Export to File
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Import Data</h3>
              <Button onClick={handleImportData} disabled={loading}>
                Import from File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Watching Tab */}
      {activeTab === 'file-watch' && (
        <Card>
          <CardHeader>
            <CardTitle>File Watching</CardTitle>
            <CardDescription>Monitor file system changes in real-time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={handleWatchFolder} disabled={loading || !!watchedPath}>
                {watchedPath ? 'Watching...' : 'Select Folder to Watch'}
              </Button>
              {watchedPath && (
                <Button variant="outline" onClick={handleUnwatchFolder}>
                  Stop Watching
                </Button>
              )}
            </div>

            {watchedPath && (
              <div className="flex flex-col gap-4">
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                  Watching: <span className="font-mono">{watchedPath}</span>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <Switch id="auto-reload" checked={autoReload} onCheckedChange={setAutoReload} />
              <Label htmlFor="auto-reload">Auto-reload on external changes (Bypass conflict dialog)</Label>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">File Events</h3>
              {fileEvents.length === 0 ? (
                <p className="text-muted-foreground">No events yet</p>
              ) : (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {fileEvents.map((event, idx) => (
                    <div key={idx} className="text-sm p-2 border border-border rounded">
                      <span className="font-mono">{event.type}</span>: {event.path}
                      <div className="text-xs text-muted-foreground">{event.timestamp}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drag & Drop Tab */}
      {activeTab === 'drag-drop' && (
        <Card>
          <CardHeader>
            <CardTitle>Drag & Drop</CardTitle>
            <CardDescription>Test file drag and drop functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 text-sm">Drop Files Here</h3>
              <DropZone
                onDrop={handleFileDrop}
                accept={['.txt', '.json', '.md']}
                multiple
              />
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2 text-sm">Drag From App (Backups)</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag the backup files below to your desktop or file explorer.
              </p>

              {backups.length === 0 ? (
                <div className="p-4 border border-dashed rounded text-center text-sm text-muted-foreground">
                  No backups available to drag. Create a backup first.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {backups.map(backup => (
                    <div
                      key={backup.filename}
                      draggable
                      onDragStart={(e) => handleDragStart(e, backup)}
                      className="p-3 border border-border rounded bg-card hover:border-primary/50 cursor-grab active:cursor-grabbing flex items-center gap-3 transition-colors"
                    >
                      <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center text-primary">
                        <FileArchive className="w-6 h-6" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-medium text-sm truncate" title={backup.filename}>
                          {backup.filename}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(backup.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
