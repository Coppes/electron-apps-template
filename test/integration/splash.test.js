import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SplashManager } from '../../src/main/splash.js';
import { windowManager } from '../../src/main/window-manager.js';

// Mock dependencies
vi.mock('../../src/main/window-manager.js', () => ({
  windowManager: {
    createWindow: vi.fn(),
  },
}));

vi.mock('../../src/main/logger.js', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

describe('SplashManager Integration', () => {
  let splashManager;
  let mockWindow;

  beforeEach(() => {
    vi.clearAllMocks();
    splashManager = new SplashManager();

    mockWindow = {
      id: 1,
      show: vi.fn(),
      close: vi.fn(),
      isDestroyed: vi.fn(() => false),
      isVisible: vi.fn(() => true),
    };

    windowManager.createWindow.mockReturnValue(mockWindow);
  });

  it('should create a splash window when show() is called', () => {
    const window = splashManager.show();

    expect(windowManager.createWindow).toHaveBeenCalledWith('splash', expect.objectContaining({
      width: 400,
      height: 400,
      frame: false,
    }));
    expect(window).toBe(mockWindow);
    expect(splashManager.splashWindow).toBe(mockWindow);
  });

  it('should not create a new window if one already exists', () => {
    splashManager.show();
    splashManager.show();

    expect(windowManager.createWindow).toHaveBeenCalledTimes(1);
  });

  it('should show existing window if show() is called again', () => {
    splashManager.show();
    splashManager.show();

    expect(mockWindow.show).toHaveBeenCalled();
  });

  it('should close and clear window when destroy() is called', () => {
    splashManager.show();
    splashManager.destroy();

    expect(mockWindow.close).toHaveBeenCalled();
    expect(splashManager.splashWindow).toBeNull();
  });

  it('should handle destroy() when no window exists', () => {
    expect(() => splashManager.destroy()).not.toThrow();
  });

  it('should correctly report visibility', () => {
    expect(splashManager.isVisible()).toBe(false);

    splashManager.show();
    expect(splashManager.isVisible()).toBe(true);

    mockWindow.isVisible.mockReturnValue(false);
    expect(splashManager.isVisible()).toBe(false);
  });
});
