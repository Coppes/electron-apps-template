import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationManager } from '../../../src/main/notifications.js';
import { Notification, app } from 'electron';

vi.mock('electron-store', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      has: vi.fn(),
      clear: vi.fn()
    }))
  };
});

vi.mock('electron', () => ({
  Notification: vi.fn().mockImplementation(function () {
    return {
      show: vi.fn(),
      on: vi.fn(),
      close: vi.fn()
    };
  }),
  app: {
    isPackaged: false,
    getName: vi.fn(() => 'Test App'),
    getVersion: vi.fn(() => '1.0.0'),
    getPath: vi.fn(() => '/tmp'),
    getAppPath: vi.fn(() => '/app')
  },
  nativeImage: {
    createFromPath: vi.fn(() => ({}))
  }
}));

vi.mock('../../../src/common/constants.js', () => ({
  IPC_CHANNELS: {
    NOTIFICATION_CLICKED: 'notification:clicked',
    NOTIFICATION_ACTION_CLICKED: 'notification:action-clicked',
    NOTIFICATION_CLOSED: 'notification:closed'
  }
}));

vi.mock('../../../src/main/window-manager.js', () => ({
  windowManager: {
    getWindowByType: vi.fn(() => ({
      id: 1,
      window: { isDestroyed: vi.fn(() => false) }
    })),
    focusWindow: vi.fn(),
    getAllWindows: vi.fn(() => [])
  }
}));

vi.mock('../../../src/main/security/permissions.js', () => ({
  isPermissionAllowed: vi.fn(() => true)
}));

vi.mock('../../../src/main/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

describe('NotificationManager', () => {
  let notificationManager;

  beforeEach(() => {
    vi.clearAllMocks();
    notificationManager = new NotificationManager();
  });

  it('should show a notification', async () => {
    const result = await notificationManager.showNotification({
      title: 'Test',
      body: 'Body'
    });

    expect(typeof result).toBe('string');
    expect(Notification).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Test',
      body: 'Body'
    }));
  });

  it('should sanitize HTML in body', async () => {
    await notificationManager.showNotification({
      title: 'Test',
      body: '<b>Bold</b>'
    });

    expect(Notification).toHaveBeenCalledWith(expect.objectContaining({
      body: 'Bold'
    }));
  });

  it('should handle silent mode', async () => {
    await notificationManager.showNotification({
      title: 'Test',
      body: 'Body',
      silent: true
    });

    expect(Notification).toHaveBeenCalledWith(expect.objectContaining({
      silent: true
    }));
  });

  it('should enforce rate limiting', async () => {
    // Fill up quota (assuming max 10/min)
    for (let i = 0; i < 10; i++) {
      await notificationManager.showNotification({ title: `Msg ${i}`, body: 'b' });
    }

    // 11th should fail
    await expect(notificationManager.showNotification({ title: 'Spam', body: 'b' }))
      .rejects.toThrow('Too many notifications');
  });

  it('should track history', async () => {
    await notificationManager.showNotification({ title: 'History 1', body: 'b' });
    const history = notificationManager.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].title).toBe('History 1');
  });
});
