import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Separator from '../components/ui/Separator';

export default function ComponentTestPage() {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState('buttons');
  const [inputValue, setInputValue] = useState('');

  const tabs = [
    { id: 'buttons', label: t('component_test.tabs.buttons') },
    { id: 'inputs', label: t('component_test.tabs.inputs') },
    { id: 'cards', label: t('component_test.tabs.cards') },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('component_test.title')}</h1>
        <p className="text-muted-foreground">
          {t('component_test.description')}
        </p>
      </div>

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

      {activeTab === 'buttons' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('component_test.buttons.title')}</CardTitle>
            <CardDescription>{t('component_test.buttons.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button>{t('component_test.buttons.default')}</Button>
              <Button variant="secondary">{t('component_test.buttons.secondary')}</Button>
              <Button variant="destructive">{t('component_test.buttons.destructive')}</Button>
              <Button variant="outline">{t('component_test.buttons.outline')}</Button>
              <Button variant="ghost">{t('component_test.buttons.ghost')}</Button>
              <Button variant="link">{t('component_test.buttons.link')}</Button>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-4">
              <Button size="sm">{t('component_test.buttons.small')}</Button>
              <Button size="md">{t('component_test.buttons.default')}</Button>
              <Button size="lg">{t('component_test.buttons.large')}</Button>
              <Button size="icon">{t('component_test.buttons.icon')}</Button>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-4">
              <Button disabled>{t('component_test.buttons.disabled')}</Button>
              <Button variant="outline" disabled>{t('component_test.buttons.disabled_outline')}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'inputs' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('component_test.inputs.title')}</CardTitle>
            <CardDescription>{t('component_test.inputs.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-sm space-y-2">
              <label className="text-sm font-medium">{t('component_test.inputs.standard_label')}</label>
              <Input
                placeholder={t('component_test.inputs.placeholder')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{t('component_test.inputs.value_label', { val: inputValue })}</p>
            </div>

            <div className="max-w-sm space-y-2">
              <label className="text-sm font-medium">{t('component_test.inputs.disabled_label')}</label>
              <Input disabled placeholder={t('component_test.inputs.disabled_placeholder')} />
            </div>

            <div className="max-w-sm space-y-2">
              <label className="text-sm font-medium">{t('component_test.inputs.error_label')}</label>
              <Input className="border-red-500" placeholder={t('component_test.inputs.error_placeholder')} />
              <p className="text-xs text-red-500">{t('component_test.inputs.error_msg')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'cards' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('component_test.cards.simple_title')}</CardTitle>
              <CardDescription>{t('component_test.cards.simple_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{t('component_test.cards.simple_content')}</p>
            </CardContent>
          </Card>

          <Card className="bg-muted">
            <CardHeader>
              <CardTitle>{t('component_test.cards.muted_title')}</CardTitle>
              <CardDescription>{t('component_test.cards.muted_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{t('component_test.cards.muted_content')}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
