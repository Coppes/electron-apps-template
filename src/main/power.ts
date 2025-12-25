import { powerMonitor, BrowserWindow } from 'electron';

export function setupPowerMonitor() {
  const sendPowerEvent = (event) => {
    BrowserWindow.getAllWindows().forEach(win => {
      if (!win.isDestroyed()) {
        win.webContents.send('power:status-change', event);
      }
    });
  };

  powerMonitor.on('on-ac', () => sendPowerEvent('on-ac'));
  powerMonitor.on('on-battery', () => sendPowerEvent('on-battery'));
  powerMonitor.on('suspend', () => sendPowerEvent('suspend'));
  powerMonitor.on('resume', () => sendPowerEvent('resume'));
}
