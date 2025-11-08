import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';

const HomePage = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome to Electron Apps Template</h1>
        <p className="text-xl text-muted-foreground">
          A secure, scalable, and modern boilerplate for desktop applications
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>🔒 Security First</CardTitle>
            <CardDescription>
              Built with best practices in mind
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ Context isolation enabled</li>
              <li>✓ Node integration disabled in renderer</li>
              <li>✓ Secure IPC via contextBridge</li>
              <li>✓ Content Security Policy configured</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>⚡ Modern Stack</CardTitle>
            <CardDescription>
              Latest tools and technologies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ Electron {window.navigator.userAgent.match(/Electron\/([^\s]+)/)?.[1] || 'latest'}</li>
              <li>✓ React 18 with hooks</li>
              <li>✓ Tailwind CSS for styling</li>
              <li>✓ shadcn/ui component library</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎨 Beautiful UI</CardTitle>
            <CardDescription>
              Pre-configured components ready to use
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ Resizable sidebar layout</li>
              <li>✓ Multiple page templates</li>
              <li>✓ Form components (Input, Select, Switch)</li>
              <li>✓ Cards, Buttons, and more</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💾 Persistent Storage</CardTitle>
            <CardDescription>
              Save user preferences easily
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ electron-store integration</li>
              <li>✓ Settings persistence</li>
              <li>✓ Cross-platform storage</li>
              <li>✓ Simple key-value API</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🚀 Getting Started</CardTitle>
          <CardDescription>
            Explore the template features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Navigate through the sidebar to explore different sections:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col">
                <span className="font-medium text-sm mb-1">🔧 Demo</span>
                <span className="text-xs text-muted-foreground">
                  Try the native file opener and see IPC in action
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm mb-1">⚙️ Settings</span>
                <span className="text-xs text-muted-foreground">
                  Configure preferences with persistent storage
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm mb-1">ℹ️ About</span>
                <span className="text-xs text-muted-foreground">
                  View version info and system details
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 p-6 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Ready to Build?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This template is ready for development. Start customizing components, add your features, and build amazing desktop applications.
        </p>
        <div className="flex gap-3">
          <Button>View Documentation</Button>
          <Button variant="outline">GitHub Repository</Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
