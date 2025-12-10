import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import DropZone from '../features/data-management/DropZone';
import { useTab } from '../../hooks/useTab';

const HomePage = () => {
  const { t } = useTranslation('common');
  const [droppedFiles, setDroppedFiles] = useState([]);
  const { openTab } = useTab();

  const handleDrop = async (files) => {
    setDroppedFiles(files);
    console.log('Dropped files:', files);

    // Auto-import logic could go here, or just showing them
    for (const file of files) {
      if (file.path) {
        // Example: check extension and import if supported
        if (file.path.endsWith('.json') || file.path.endsWith('.csv')) {
          try {
            // We could automatically trigger import here or just notify
            console.log('File supported for import:', file.path);
          } catch (e) {
            console.error('Import check failed', e);
          }
        }
      }
    }
  };

  const handleDragError = (error) => {
    console.error('Drag and drop error:', error);
  };

  const handleOpenFile = async () => {
    try {
      const filePath = await window.electronAPI.dialog.showOpenDialog({
        properties: ['openFile']
      });
      if (filePath) {
        console.log('Selected file:', filePath);
        // Handle file opening logic
      }
    } catch (error) {
      console.error('Open file error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{t('app.name', 'Electron App')}</h1>
          <p className="text-xl text-muted-foreground">{t('app.subtitle', 'Start Hub')}</p>
        </div>

        <DropZone
          onDrop={handleDrop}
          onError={handleDragError}
          className="w-full"
          activeClassName="ring-4 ring-primary ring-opacity-50 bg-accent"
        >
          <Card className="border-dashed border-2 min-h-[300px] flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors">
            <CardContent className="flex flex-col items-center space-y-4 p-8 text-center">
              <div className="p-4 rounded-full bg-primary/10 text-primary mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Drop files to open</h3>
                <p className="text-muted-foreground max-w-sm">
                  Drag and drop files here to import data or open projects.
                </p>
              </div>
              <div className="flex gap-4 mt-4">
                <Button onClick={(e) => { e.stopPropagation(); handleOpenFile(); }}>
                  Open File...
                </Button>
                <Button variant="outline" onClick={(e) => { e.stopPropagation(); openTab({ id: 'settings', title: 'Settings', type: 'settings' }); }}>
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </DropZone>

        {droppedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {droppedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{file.name}</span>
                        <span className="text-xs text-muted-foreground">{file.path}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Just now</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-3 gap-4">
          <Button variant="ghost" className="h-24 flex flex-col gap-2" onClick={() => openTab({ id: 'backup', title: 'Backups', type: 'backup' })}>
            <span className="text-2xl">💾</span>
            Backups
          </Button>
          <Button variant="ghost" className="h-24 flex flex-col gap-2" onClick={() => openTab({ id: 'settings', title: 'Settings', type: 'settings' })}>
            <span className="text-2xl">⚙️</span>
            Settings
          </Button>
          <Button variant="ghost" className="h-24 flex flex-col gap-2" onClick={() => window.open('https://github.com', '_blank')}>
            <span className="text-2xl">📚</span>
            Docs
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
