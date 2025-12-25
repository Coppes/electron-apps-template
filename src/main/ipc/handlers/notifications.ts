import { IPC_CHANNELS } from '../../../common/constants.ts';
import { notificationManager } from '../../notifications.ts';
import { existsSync } from 'fs';
import { isAbsolute } from 'path';
import { NotificationOptions } from '../../../common/types.ts';

/**
 * Native Notifications IPC Handlers
 */

/**
 * Create notification IPC handlers
 * @returns {Object} Handler map
 */
export function createNotificationHandlers() {
  return {
    [IPC_CHANNELS.NOTIFICATION_SHOW]: async (_event: Electron.IpcMainInvokeEvent, options: NotificationOptions) => {
      // Validate options
      if (!options || typeof options !== 'object') {
        throw new Error('Invalid notification options');
      }

      if (!options.title || !options.body) {
        throw new Error('Title and body are required');
      }

      // Validate icon path if provided
      if (options.icon) {
        if (!isAbsolute(options.icon) || !existsSync(options.icon)) {
          throw new Error('Icon must be an absolute path to an existing file');
        }
      }

      // Show notification
      const id = await notificationManager.showNotification(options);
      return { success: true, id };
    },

    [IPC_CHANNELS.NOTIFICATION_CLOSE]: async (_event: Electron.IpcMainInvokeEvent, { id }: { id: string }) => {
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid notification ID');
      }

      const success = notificationManager.closeNotification(id);
      return { success };
    },

    [IPC_CHANNELS.NOTIFICATION_GET_HISTORY]: async (_event: Electron.IpcMainInvokeEvent, { limit }: { limit: number }) => {
      const limitNum = limit && typeof limit === 'number' ? limit : 50;
      const history = notificationManager.getHistory(limitNum);
      return { history };
    },

    [IPC_CHANNELS.NOTIFICATION_CHECK_PERMISSION]: async () => {
      const allowed = notificationManager.checkPermission();
      return { allowed };
    },

    [IPC_CHANNELS.NOTIFICATION_REQUEST_PERMISSION]: async () => {
      const granted = await notificationManager.requestPermission();
      return { granted };
    },
  };
}

export const notificationHandlers = createNotificationHandlers();
