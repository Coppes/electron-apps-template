import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';

const HomePage = () => {
  const { t } = useTranslation('common');

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{t('home.title')}</h1>
        <p className="text-xl text-muted-foreground">
          {t('home.subtitle')}
        </p>
      </div>

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
              <li>✓ {t('home.cards.ui.features.layout')}</li>
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
  );
};

export default HomePage;
