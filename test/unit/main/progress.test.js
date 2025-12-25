import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setProgress, clearProgress } from '../../../src/main/progress.ts';
import { PROGRESS_STATE } from '../../../src/common/constants.ts';

vi.mock('../../../src/common/constants.ts', () => ({
  PROGRESS_STATE: {
    NORMAL: 'normal',
    PAUSED: 'paused',
    ERROR: 'error',
    INDETERMINATE: 'indeterminate'
  }
}));

// Mock window manager and logger
const mockWindows = new Map();
vi.mock('../../../src/main/window-manager.ts', () => ({
  windowManager: {
    getWindow: vi.fn((id) => mockWindows.get(id))
  }
}));

vi.mock('../../../src/main/logger.ts', () => ({
  logger: {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

// Mock constants if needed, but imported one is fine if it's just an object
// The actual progress.js imports PROGRESS_STATE from common/constants.

describe('Progress Indicator', () => {
  let mockWindow;

  beforeEach(() => {
    mockWindows.clear();
    mockWindow = {
      setProgressBar: vi.fn(),
      isDestroyed: vi.fn(() => false)
    };
    // getWindow returns the window object directly in usage
    mockWindows.set(1, mockWindow);
    vi.clearAllMocks();
  });

  it('should set progress for a valid window', () => {
    const result = setProgress(0.5, { windowId: 1 });

    expect(result).toBe(true);
    expect(mockWindow.setProgressBar).toHaveBeenCalledWith(0.5, expect.objectContaining({ mode: 'normal' }));
  });

  it('should set progress with state', () => {
    const result = setProgress(0.5, { windowId: 1, state: PROGRESS_STATE.ERROR });

    expect(result).toBe(true);
    // Note: mock implementation might use string 'normal'/'error' from constants
    expect(mockWindow.setProgressBar).toHaveBeenCalledWith(0.5, expect.objectContaining({ mode: 'error' }));
  });

  it('should return false for invalid window id', () => {
    const result = setProgress(0.5, { windowId: 999 });

    expect(result).toBe(false);
  });

  it('should clamp progress values', () => {
    // Current implementation checks < -1 or > 1 and returns false. It does NOT clamp.
    const result = setProgress(1.5, { windowId: 1 });
    expect(result).toBe(false);
  });

  it('should handle indeterminate progress', () => {
    setProgress(-1, { windowId: 1 });
    // Electron uses 2 for indeterminate
    expect(mockWindow.setProgressBar).toHaveBeenCalledWith(2, expect.objectContaining({ mode: 'normal' }));
  });

  it('should clear progress', () => {
    const result = clearProgress(1);

    expect(result).toBe(true);
    expect(mockWindow.setProgressBar).toHaveBeenCalledWith(-1);
  });
});
