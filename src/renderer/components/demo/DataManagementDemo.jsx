import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Separator from '../ui/Separator';
import DropZone from '../features/data-management/DropZone';

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

  useEffect(() => {
    loadBackups();
    
    // Listen for file change events
    const cleanup = window.electronAPI?.events?.onFileChange?.((event) => {
      setFileEvents(prev => [...prev, { ...event, timestamp: new Date().toISOString() }].slice(-10));
    });
    
    return () => cleanup?.();
  }, []);

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
      const result = await window.electronAPI.data.exportData({
        data: exportData,
        format: 'json',
      });
      setMessage({ type: 'success', text: `Data exported to: ${result.path}` });
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
      const result = await window.electronAPI.dialog.openFile({
        title: 'Import Data',
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
      });
      
      if (!result.canceled && result.filePaths[0]) {
        await window.electronAPI.data.importData({
          path: result.filePaths[0],
        });
        setMessage({ type: 'success', text: `Data imported successfully` });
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
      const result = await window.electronAPI.dialog.openFolder({
        title: 'Select Folder to Watch',
      });
      
      if (!result.canceled && result.filePaths[0]) {
        await window.electronAPI.data.watchPath({ path: result.filePaths[0] });
        setWatchedPath(result.filePaths[0]);
        setMessage({ type: 'success', text: `Watching: ${result.filePaths[0]}` });
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
      await window.electronAPI.data.unwatchPath({ path: watchedPath });
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

  const tabs = [
    { id: 'backup', label: '💾 Backup & Restore' },
    { id: 'import-export', label: '📤 Import & Export' },
    { id: 'file-watch', label: '👁️ File Watching' },
    { id: 'drag-drop', label: '📎 Drag & Drop' },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border pb-2">
        {tabs.map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-3 rounded ${
          message.type === 'error' ? 'bg-red-100 text-red-800' :
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
            <div className="flex gap-2">
              <Button onClick={handleCreateBackup} disabled={loading}>
                {loading ? 'Creating...' : 'Create Backup'}
              </Button>
              <Button variant="outline" onClick={loadBackups} disabled={loading}>
                Refresh
              </Button>
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
                          {new Date(backup.created).toLocaleString()} • {(backup.size / 1024).toFixed(1)} KB
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
              <div className="text-sm text-muted-foreground">
                Watching: {watchedPath}
              </div>
            )}

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
          <CardContent>
            <DropZone
              onFileDrop={handleFileDrop}
              accept=".txt,.json,.md"
              multiple
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
