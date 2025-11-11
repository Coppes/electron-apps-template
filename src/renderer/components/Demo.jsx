import React, { useState } from 'react';
import Button from './ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';

function Demo() {
  const [windowStatus, setWindowStatus] = useState('');
  const [dialogResult, setDialogResult] = useState('');

  const handleMinimize = async () => {
    try {
      await window.electronAPI.window.minimize();
      setWindowStatus('✓ Window minimized');
      setTimeout(() => setWindowStatus(''), 2000);
    } catch (error) {
      setWindowStatus(`✗ Error: ${error.message}`);
    }
  };

  const handleMaximize = async () => {
    try {
      await window.electronAPI.window.maximize();
      setWindowStatus('✓ Window maximized/restored');
      setTimeout(() => setWindowStatus(''), 2000);
    } catch (error) {
      setWindowStatus(`✗ Error: ${error.message}`);
    }
  };

  const handleGetWindowState = async () => {
    try {
      const state = await window.electronAPI.window.getState();
      setWindowStatus(
        `Window: ${state.isMaximized ? 'Maximized' : 'Normal'}, ` +
        `Visible: ${state.isVisible ? 'Yes' : 'No'}, ` +
        `Size: ${state.bounds.width}x${state.bounds.height}`
      );
    } catch (error) {
      setWindowStatus(`✗ Error: ${error.message}`);
    }
  };

  const handleShowMessage = async () => {
    try {
      const result = await window.electronAPI.dialog.message({
        type: 'info',
        title: 'Demo Dialog',
        message: 'This is a native dialog from the new Dialog API!',
        buttons: ['OK', 'Cancel'],
      });
      setDialogResult(`✓ User clicked: ${result.response === 0 ? 'OK' : 'Cancel'}`);
    } catch (error) {
      setDialogResult(`✗ Error: ${error.message}`);
    }
  };

  const handleShowError = async () => {
    try {
      await window.electronAPI.dialog.error({
        title: 'Demo Error',
        content: 'This is an error dialog example',
      });
      setDialogResult('✓ Error dialog shown');
    } catch (error) {
      setDialogResult(`✗ Error: ${error.message}`);
    }
  };

  return (
    <section className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Window Management API</CardTitle>
          <CardDescription>
            Control window state using the new windowAPI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleMinimize} variant="outline">
              Minimize Window
            </Button>
            <Button onClick={handleMaximize} variant="outline">
              Maximize/Restore
            </Button>
            <Button onClick={handleGetWindowState} variant="outline">
              Get Window State
            </Button>
          </div>
          {windowStatus && (
            <div
              className={`p-3 rounded text-sm ${
                windowStatus.startsWith('✓')
                  ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100'
                  : 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100'
              }`}
            >
              {windowStatus}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dialog API</CardTitle>
          <CardDescription>
            Show native dialogs using the new dialogAPI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleShowMessage} variant="outline">
              Show Message Dialog
            </Button>
            <Button onClick={handleShowError} variant="outline">
              Show Error Dialog
            </Button>
          </div>
          {dialogResult && (
            <div
              className={`p-3 rounded text-sm ${
                dialogResult.startsWith('✓')
                  ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100'
                  : 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100'
              }`}
            >
              {dialogResult}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default Demo;
