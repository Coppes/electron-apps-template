import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import DropZone from '../features/data-management/DropZone';

const HomePage = () => {
  const { t } = useTranslation('common');
  const [droppedFiles, setDroppedFiles] = useState([]);

  const handleDrop = (files) => {
    setDroppedFiles(files);
    console.log('Dropped files:', files);
  };

  const handleDragError = (error) => {
    console.error('Drag and drop error:', error);
  };

  return (
    <DropZone
      onDrop={handleDrop}
      onError={handleDragError}
      className="min-h-screen"
      activeClassName="ring-2 ring-primary ring-offset-2 bg-primary/5"
    >
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t('home.title')}</h1>
          <p className="text-xl text-muted-foreground">
            {t('home.subtitle')}
          </p>
        </div>

        {droppedFiles.length > 0 && (
          <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Files Dropped!</h3>
            <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-300">
              {droppedFiles.map((file, index) => (
                <li key={index}>{file.path} ({Math.round(file.size / 1024)} KB)</li>
              ))}
            </ul>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={(e) => {
                e.stopPropagation();
                setDroppedFiles([]);
              }}
            >
              Clear
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>🔒 {t('home.cards.security.title')}</CardTitle>
              <CardDescription>
                {t('home.cards.security.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ {t('home.cards.security.features.context')}</li>
                <li>✓ {t('home.cards.security.features.node')}</li>
                <li>✓ {t('home.cards.security.features.ipc')}</li>
                <li>✓ {t('home.cards.security.features.csp')}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⚡ {t('home.cards.stack.title')}</CardTitle>
              <CardDescription>
                {t('home.cards.stack.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ {t('home.cards.stack.features.electron').replace('latest', window.navigator.userAgent.match(/Electron\/([^\s]+)/)?.[1] || 'latest')}</li>
                <li>✓ {t('home.cards.stack.features.react')}</li>
                <li>✓ {t('home.cards.stack.features.tailwind')}</li>
                <li>✓ {t('home.cards.stack.features.shadcn')}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎨 {t('home.cards.ui.title')}</CardTitle>
              <CardDescription>
                {t('home.cards.ui.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ {t('home.cards.ui.features.layouts', 'Responsive Layouts')}</li>
                <li>✓ {t('home.cards.ui.features.pages')}</li>
                <li>✓ {t('home.cards.ui.features.forms')}</li>
                <li>✓ {t('home.cards.ui.features.components')}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💾 {t('home.cards.storage.title')}</CardTitle>
              <CardDescription>
                {t('home.cards.storage.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ {t('home.cards.storage.features.store')}</li>
                <li>✓ {t('home.cards.storage.features.settings')}</li>
                <li>✓ {t('home.cards.storage.features.cross')}</li>
                <li>✓ {t('home.cards.storage.features.api')}</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>🚀 {t('home.cards.start.title')}</CardTitle>
            <CardDescription>
              {t('home.cards.start.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('home.cards.start.text')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <span className="font-medium text-sm mb-1">🔧 {t('home.cards.start.demo.title')}</span>
                  <span className="text-xs text-muted-foreground">
                    {t('home.cards.start.demo.description')}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm mb-1">⚙️ {t('home.cards.start.settings.title')}</span>
                  <span className="text-xs text-muted-foreground">
                    {t('home.cards.start.settings.description')}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm mb-1">ℹ️ {t('home.cards.start.about.title')}</span>
                  <span className="text-xs text-muted-foreground">
                    {t('home.cards.start.about.description')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">{t('home.ready.title')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('home.ready.text')}
          </p>
          <div className="flex gap-3">
            <Button>{t('home.ready.docs')}</Button>
            <Button variant="outline">{t('home.ready.github')}</Button>
          </div>
        </div>
      </div>
    </DropZone>
  );
};

export default HomePage;
