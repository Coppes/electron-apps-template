import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Separator from '../components/ui/Separator';

export default function ComponentTestPage() {
  const [activeTab, setActiveTab] = useState('buttons');
  const [inputValue, setInputValue] = useState('');

  const tabs = [
    { id: 'buttons', label: 'Buttons' },
    { id: 'inputs', label: 'Inputs' },
    { id: 'cards', label: 'Cards' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Component Playground</h1>
        <p className="text-muted-foreground">
          Test area for UI components and interactions.
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
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>Test different button styles and states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">icon</Button>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-4">
              <Button disabled>Disabled</Button>
              <Button variant="outline" disabled>Disabled Outline</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'inputs' && (
        <Card>
          <CardHeader>
            <CardTitle>Input Components</CardTitle>
            <CardDescription>Test text inputs and controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-sm space-y-2">
              <label className="text-sm font-medium">Standard Input</label>
              <Input
                placeholder="Type something..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Value: {inputValue}</p>
            </div>

            <div className="max-w-sm space-y-2">
              <label className="text-sm font-medium">Disabled Input</label>
              <Input disabled placeholder="Cannot type here" />
            </div>

            <div className="max-w-sm space-y-2">
              <label className="text-sm font-medium">Input with Error</label>
              <Input className="border-red-500" placeholder="Error state" />
              <p className="text-xs text-red-500">Invalid input value</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'cards' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Simple Card</CardTitle>
              <CardDescription>Basic card with header and content</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is the content within the card body.</p>
            </CardContent>
          </Card>

          <Card className="bg-muted">
            <CardHeader>
              <CardTitle>Muted Card</CardTitle>
              <CardDescription>Card with muted background</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Content on a muted background surface.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
