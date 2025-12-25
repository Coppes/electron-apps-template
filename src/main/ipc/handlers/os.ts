import { setDockBadge, setDockMenu } from '../../dock.ts';
import { trayManager } from '../../tray.ts';

export const osHandlers = {
  'dock:set-badge': async (event, { text }) => {
    setDockBadge(text);
    return { success: true };
  },
  'dock:set-menu': async (event, { template }) => {
    setDockMenu(template);
    return { success: true };
  },
  'tray:set-status': async (event, { status }) => {
    trayManager.updateStatus(status);
    return { success: true };
  }
};
