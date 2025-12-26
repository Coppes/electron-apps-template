import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { File, FloppyDisk, Gear, Book, UploadSimple } from '@phosphor-icons/react';
import { useTab } from '../hooks/useTab';
import DropZone from '../components/features/data-management/DropZone';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';

interface FileWithPath extends File {
  path: string;
  name: string;
}

const HomePage = () => {
  const { t } = useTranslation('common');
  const [droppedFiles, setDroppedFiles] = useState<FileWithPath[]>([]);
  const { openTab } = useTab();

  const handleDrop = async (files: any[]) => {
    setDroppedFiles(files as FileWithPath[]);
    // console.log('Dropped files:', files);

    // Auto-import logic could go here, or just showing them
    for (const file of files) {
      if (file.path) {
        // Example: check extension and import if supported
        if (file.path.endsWith('.json') || file.path.endsWith('.csv')) {
          try {
            // We could automatically trigger import here or just notify
            // console.log('File supported for import:', file.path);
          } catch (e) {
            // console.error('Import check failed', e);
          }
        }
      }
    }
  };

  const handleDragError = (_error: unknown) => {
    // console.error('Drag and drop error:', error);
  };

  const handleOpenFile = async () => {
    try {
      const filePath = await window.electronAPI.dialog.showOpenDialog({
        properties: ['openFile']
      });
      if (filePath) {
        // console.log('Selected file:', filePath);
        // Handle file opening logic
      }
    } catch (error) {
      // console.error('Open file error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">{t('app.name')}</h1>
            <p className="text-xl text-muted-foreground">{t('app.subtitle')}</p>
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
                  <UploadSimple className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold">{t('home.drop_title')}</h3>
                  <p className="text-muted-foreground max-w-sm">
                    {t('home.drop_desc')}
                  </p>
                </div>
                <div className="flex gap-4 mt-4">
                  <Button onClick={(e) => { e.stopPropagation(); handleOpenFile(); }}>
                    {t('home.open_file')}
                  </Button>
                  <Button variant="outline" onClick={(e) => { e.stopPropagation(); openTab({ id: 'settings', title: t('nav.items.settings'), type: 'settings' }); }}>
                    {t('nav.items.settings')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </DropZone>

          {droppedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('home.recent_activity')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {droppedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-3">
                        <File className="w-6 h-6" />
                        <div className="flex flex-col">
                          <span className="font-medium">{file.name}</span>
                          <span className="text-xs text-muted-foreground">{file.path}</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{t('home.just_now')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-3 gap-4">
            <Button variant="ghost" className="h-24 flex flex-col gap-2" onClick={() => openTab({ id: 'backup', title: t('nav.items.backups'), type: 'backup' })}>
              <FloppyDisk className="w-8 h-8" />
              {t('home.backups')}
            </Button>
            <Button variant="ghost" className="h-24 flex flex-col gap-2" onClick={() => openTab({ id: 'settings', title: t('nav.items.settings'), type: 'settings' })}>
              <Gear className="w-8 h-8" />
              {t('home.settings')}
            </Button>
            <Button variant="ghost" className="h-24 flex flex-col gap-2" onClick={() => window.open('https://github.com', '_blank')}>
              <Book className="w-8 h-8" />
              {t('home.docs')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
