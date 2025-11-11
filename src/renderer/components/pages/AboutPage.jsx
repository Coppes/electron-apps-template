import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Separator from '../ui/Separator';

const AboutPage = () => {
  const [versionInfo, setVersionInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVersionInfo = async () => {
      try {
        if (window.electronAPI?.appAPI) {
          const info = await window.electronAPI.appAPI.getVersion();
          setVersionInfo(info);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading version info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVersionInfo();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">About</h1>
        <p className="text-muted-foreground mt-2">
          Application and system information
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Electron Apps Template</CardTitle>
            <CardDescription>
              A secure, scalable, and modern boilerplate template for desktop applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading version information...</p>
            ) : versionInfo ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">App Version</span>
                  <span className="text-muted-foreground">{versionInfo.app}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Electron</span>
                  <span className="text-muted-foreground">{versionInfo.electron}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Chrome</span>
                  <span className="text-muted-foreground">{versionInfo.chrome}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Node.js</span>
                  <span className="text-muted-foreground">{versionInfo.node}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">V8</span>
                  <span className="text-muted-foreground">{versionInfo.v8}</span>
                </div>
              </div>
            ) : (
              <p className="text-red-600">Unable to load version information</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>
              What makes this template special
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Secure IPC communication via contextBridge</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Context isolation and Node.js integration disabled</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Modern React with hooks</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Tailwind CSS and shadcn/ui components</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Persistent settings with electron-store</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Native file dialog integration</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Resizable sidebar layout</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>License</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This template is open source and available under the ISC License.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
