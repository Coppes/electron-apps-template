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

const { mockWindow } = vi.hoisted(() => {
  return {
    mockWindow: {
      id: 1,
      window: {
        isDestroyed: vi.fn(() => false),
        webContents: { send: vi.fn() }
      }
    }
  };
});

vi.mock('../../../src/main/window-manager.js', () => ({
  windowManager: {
    getWindowByType: vi.fn(() => mockWindow),
    focusWindow: vi.fn(),
    getAllWindows: vi.fn(() => [mockWindow])
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

  it('should throw error when permission is denied', async () => {
    // Mock permission denied
    const { isPermissionAllowed } = await import('../../../src/main/security/permissions.js');
    isPermissionAllowed.mockReturnValueOnce(false);

    await expect(notificationManager.showNotification({
      title: 'Denied',
      body: 'Should fail'
    })).rejects.toThrow('Notification permission denied');
  });

  it('should handle action clicks', async () => {
    // Determine which notification instance to spy on
    // Since we mock Notification constructor, we need to capture the instance it returns
    await notificationManager.showNotification({
      title: 'Action',
      body: 'Click me',
      actions: [{ type: 'button', text: 'Reply' }]
    });

    // Get the last created notification instance from the mock results
    // But Notification is a mock fn that returns an object. 
    // We can spy on the mock implementation or just access the mock instances if we were tracking them.
    // Our mock implementation:
    // Notification: vi.fn().mockImplementation(function () { return { show, on, close } })

    // We can't easily access the created instance from outside unless we modify the mock to store it.
    // However, notificationManager stores it in `activeNotifications`.

    // Let's rely on internal state of notificationManager for this unit test since it's "white box" testing
    const activeEntries = Array.from(notificationManager.activeNotifications.values());
    const notificationEntry = activeEntries.find(e => e.options.title === 'Action');

    expect(notificationEntry).toBeDefined();

    // Simulate action event
    // The real notification emits 'action', listener calls handleNotificationAction
    // We need to trigger the 'action' listener we registered.

    // Retrieve the 'on' mock calls
    const onCalls = notificationEntry.notification.on.mock.calls;
    const actionHandler = onCalls.find(call => call[0] === 'action')?.[1];

    expect(typeof actionHandler).toBe('function');

    // Call handler with index 0
    actionHandler({}, 0);

    // Verify it sent IPC message (we can spy on sendToRenderer or windowManager)
    // windowManager.getAllWindows returns mock windows with webContents.send
    const windows = await import('../../../src/main/window-manager.js').then(m => m.windowManager.getAllWindows());
    expect(windows[0].window.webContents.send).toHaveBeenCalledWith('notification:action-clicked', expect.objectContaining({
      actionIndex: 0,
      action: { type: 'button', text: 'Reply' }
    }));
  });

  it('should check permission status', async () => {
    const { isPermissionAllowed } = await import('../../../src/main/security/permissions.js');
    isPermissionAllowed.mockReturnValue(true);
    expect(notificationManager.checkPermission()).toBe(true);

    isPermissionAllowed.mockReturnValue(false);
    expect(notificationManager.checkPermission()).toBe(false);
  });

  it('should request permission', async () => {
    const { isPermissionAllowed } = await import('../../../src/main/security/permissions.js');
    isPermissionAllowed.mockReturnValue(true);
    expect(await notificationManager.requestPermission()).toBe(true);
  });
});
