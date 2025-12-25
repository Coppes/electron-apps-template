import { setDockBadge, setDockMenu } from '../../dock.ts';
import { trayManager } from '../../tray.ts';
import { IPC_CHANNELS } from '../../../common/constants.ts';

export const osHandlers = {
  [IPC_CHANNELS.OS_DOCK_SET_BADGE]: async (_event: Electron.IpcMainInvokeEvent, { text }: { text: string }) => {
    setDockBadge(text);
    return { success: true };
  },
  [IPC_CHANNELS.OS_DOCK_SET_MENU]: async (_event: Electron.IpcMainInvokeEvent, { template }: { template: any[] }) => {
    setDockMenu(template);
    return { success: true };
  },
  [IPC_CHANNELS.OS_TRAY_SET_STATUS]: async (_event: Electron.IpcMainInvokeEvent, { status }: { status: string }) => {
    trayManager.updateStatus(status);
    return { success: true };
  }
};
