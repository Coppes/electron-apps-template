import React from 'react';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import Separator from '../components/ui/Separator';
import SecureStorageDemo from '../components/features/secure-storage/SecureStorageDemo';

import { FolderOpen, FloppyDisk } from '@phosphor-icons/react';

const DemoPage = () => {
  const [fileContent, setFileContent] = useState('');
  const [filePath, setFilePath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  const handleOpenFile = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (window.electronAPI?.dialog) {
        const result = await window.electronAPI.dialog.openFile({
          title: 'Open Text File',
          filters: [
            { name: 'Text Files', extensions: ['txt', 'md', 'json', 'js', 'jsx'] },
            { name: 'All Files', extensions: ['*'] },
          ],
          properties: ['openFile'],
        });

        if (result.canceled) {
          setError('File selection canceled');
        } else if (result.error) {
          setError(`Error: ${result.error}`);
        } else if (result.filePaths && result.filePaths.length > 0) {
          setFilePath(result.filePaths[0]);
          setFileContent(result.content || '');
        }
      } else {
        setError('Dialog API not available');
      }
    } catch (err) {
      setError(`Error opening file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFile = async () => {
    if (!fileContent.trim()) {
      setError('No content to save');
      return;
    }

    setIsLoading(true);
    setError('');
    setSaveStatus('');

    try {
      if (window.electronAPI?.dialog) {
        const result = await window.electronAPI.dialog.saveFile({
          title: 'Save File',
          defaultPath: filePath || 'untitled.txt',
          filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'All Files', extensions: ['*'] },
          ],
          content: fileContent,
        });

        if (result.canceled) {
          setError('Save canceled');
        } else if (result.error) {
          setError(`Error: ${result.error}`);
        } else if (result.filePath) {
          setFilePath(result.filePath);
          setSaveStatus(`✓ File saved successfully to: ${result.filePath}`);
          setTimeout(() => setSaveStatus(''), 3000);
        }
      } else {
        setError('Dialog API not available');
      }
    } catch (err) {
      setError(`Error saving file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Demo</h1>
        <p className="text-muted-foreground mt-2">
          Explore Electron features and IPC examples
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Native File Opener</CardTitle>
            <CardDescription>
              Open and read files using native OS dialogs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button onClick={handleOpenFile} disabled={isLoading} className="gap-2">
                {isLoading ? 'Opening...' : <><FolderOpen className="w-4 h-4" /> Open File</>}
              </Button>
              <Button onClick={handleSaveFile} disabled={isLoading || !fileContent.trim()} className="gap-2">
                {isLoading ? 'Saving...' : <><FloppyDisk className="w-4 h-4" /> Save File</>}
              </Button>
              {filePath && (
                <span className="text-sm text-muted-foreground truncate flex-1">
                  {filePath}
                </span>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            {saveStatus && (
              <p className="text-sm text-green-600">{saveStatus}</p>
            )}

            <Separator />

            <div>
              <label className="block text-sm font-medium mb-2">
                File Content
              </label>
              <Textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                placeholder="File content will appear here..."
                className="min-h-[300px] font-mono text-xs"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>IPC Communication</CardTitle>
            <CardDescription>
              How the file opener works
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1">1. Renderer Process</p>
                <p className="text-muted-foreground">
                  Calls <code className="bg-muted px-1 py-0.5 rounded">window.electronAPI.openFile()</code>
                </p>
              </div>
              <Separator />
              <div>
                <p className="font-medium mb-1">2. Preload Script</p>
                <p className="text-muted-foreground">
                  Safely bridges the call using <code className="bg-muted px-1 py-0.5 rounded">ipcRenderer.invoke()</code>
                </p>
              </div>
              <Separator />
              <div>
                <p className="font-medium mb-1">3. Main Process</p>
                <p className="text-muted-foreground">
                  Opens native dialog with <code className="bg-muted px-1 py-0.5 rounded">dialog.showOpenDialog()</code> and reads file
                </p>
              </div>
              <Separator />
              <div>
                <p className="font-medium mb-1">4. Return to Renderer</p>
                <p className="text-muted-foreground">
                  File path and content are returned securely through IPC
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Secure Storage Demo */}
        <Card>
          <CardHeader>
            <CardTitle>🔐 Secure Storage</CardTitle>
            <CardDescription>
              Securely store sensitive data using OS-level encryption
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SecureStorageDemo />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DemoPage;
