import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TrayManager } from '../../../src/main/tray.js';
import { app, Menu, Tray } from 'electron';

// Mock Electron modules
vi.mock('electron', () => ({
  app: {
    isPackaged: false,
    getName: vi.fn(() => 'Test App'),
    getVersion: vi.fn(() => '1.0.0'),
    getPath: vi.fn(() => '/tmp'),
    getAppPath: vi.fn(() => '/app'),
    quit: vi.fn()
  },
  Menu: {
    buildFromTemplate: vi.fn(template => ({ template, popup: vi.fn() })),
    setApplicationMenu: vi.fn()
  },
  Tray: vi.fn().mockImplementation(function () {
    return {
      setToolTip: vi.fn(),
      setContextMenu: vi.fn(),
      on: vi.fn(),
      setImage: vi.fn(),
      destroy: vi.fn(),
      getBounds: vi.fn(() => ({ x: 0, y: 0, width: 16, height: 16 }))
    };
  }),
  nativeImage: {
    createFromPath: vi.fn(() => ({ isEmpty: vi.fn(() => false), resize: vi.fn(() => ({})) }))
  }
}));

vi.mock('fs', () => {
  return {
    default: {
      existsSync: vi.fn(() => true),
      readFileSync: vi.fn(),
    },
    existsSync: vi.fn(() => true),
    readFileSync: vi.fn(),
  };
});

vi.mock('../../../src/common/constants.js', () => ({
  isMacOS: vi.fn(() => true),
  isWindows: vi.fn(() => false),
  isLinux: vi.fn(() => false),
  ENV: { DEVELOPMENT: 'development', PRODUCTION: 'production' }
}));


describe('TrayManager Menu', () => {
  let trayManager;
  let windowManagerMock;

  beforeEach(() => {
    vi.clearAllMocks();
    windowManagerMock = {
      getMainWindow: vi.fn().mockReturnValue({
        show: vi.fn(),
        focus: vi.fn(),
        isVisible: vi.fn(() => false)
      })
    };
    trayManager = new TrayManager(windowManagerMock);
  });

  it('should create a default context menu', () => {
    trayManager.createTray();

    expect(Menu.buildFromTemplate).toHaveBeenCalled();
    const template = Menu.buildFromTemplate.mock.calls[0][0];

    expect(template).toHaveLength(3);
    expect(template[0].label).toBe('Show Window');
    expect(template[2].label).toBe('Quit');
  });

  it('should allow adding custom menu items', () => {
    trayManager.createTray();

    // Clear previous calls to check strictly
    Menu.buildFromTemplate.mockClear();

    trayManager.setContextMenu([
      { label: 'Custom Item', click: vi.fn() }
    ]);

    expect(Menu.buildFromTemplate).toHaveBeenCalled();
    const template = Menu.buildFromTemplate.mock.calls[0][0];

    const customItem = template.find(item => item.label === 'Custom Item');
    expect(customItem).toBeDefined();
    expect(customItem.label).toBe('Custom Item');
  });

  it('should update context menu dynamically', () => {
    trayManager.createTray();

    const newTemplate = [
      { label: 'New Item', click: vi.fn() }
    ];

    trayManager.setContextMenu(newTemplate);

    expect(Menu.buildFromTemplate).toHaveBeenCalledWith(newTemplate);
    expect(trayManager.tray.setContextMenu).toHaveBeenCalled();
  });

  it('should handle menu item clicks', () => {
    trayManager.createTray();
    const emitSpy = vi.spyOn(trayManager, 'emit');

    const template = Menu.buildFromTemplate.mock.calls[0][0];
    const showItem = template.find(item => item.label === 'Show Window');

    showItem.click();
    expect(emitSpy).toHaveBeenCalledWith('menu-item-click', 'show');
  });

  it('should handle quit item click', () => {
    trayManager.createTray();
    const emitSpy = vi.spyOn(trayManager, 'emit');

    const template = Menu.buildFromTemplate.mock.calls[0][0];
    const quitItem = template.find(item => item.label === 'Quit');

    quitItem.click();
    expect(emitSpy).toHaveBeenCalledWith('menu-item-click', 'quit');
  });
});
