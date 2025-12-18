import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useDeepLink } from '../../../../src/renderer/hooks/useDeepLink';
import * as TabContext from '../../../../src/renderer/contexts/TabContext';
import * as CommandContext from '../../../../src/renderer/contexts/CommandContext';

describe('useDeepLink', () => {
  const mockAddTab = vi.fn();
  const mockExecuteCommand = vi.fn();
  let mockOnReceivedCallback;

  beforeEach(() => {
    vi.resetAllMocks();

    // Mock contexts
    vi.spyOn(TabContext, 'useTabContext').mockReturnValue({ addTab: mockAddTab });
    vi.spyOn(CommandContext, 'useCommandContext').mockReturnValue({ executeCommand: mockExecuteCommand });

    // Mock electronAPI
    global.window.electronAPI = {
      deepLink: {
        onReceived: vi.fn((callback) => {
          mockOnReceivedCallback = callback;
          return vi.fn(); // cleanup function
        }),
      },
      file: {
        validatePath: vi.fn().mockResolvedValue({ exists: true }),
      },
      notification: {
        show: vi.fn(),
      },
    };
  });

  afterEach(() => {
    delete global.window.electronAPI;
    vi.restoreAllMocks();
  });

  it('should register deep link listener on mount', () => {
    renderHook(() => useDeepLink());
    expect(window.electronAPI.deepLink.onReceived).toHaveBeenCalled();
  });

  it('should handle "new-item" route', () => {
    renderHook(() => useDeepLink());

    act(() => {
      mockOnReceivedCallback({
        route: 'new-item',
        params: {},
        pathParams: {},
      });
    });

    expect(mockAddTab).toHaveBeenCalledWith(expect.objectContaining({
      title: 'New Document',
      type: 'editor',
    }));
  });

  it('should handle "settings-section" route', () => {
    renderHook(() => useDeepLink());

    act(() => {
      mockOnReceivedCallback({
        route: 'settings-section',
        params: {},
        pathParams: { section: 'appearance' },
      });
    });

    expect(mockAddTab).toHaveBeenCalledWith(expect.objectContaining({
      id: 'settings',
      type: 'settings',
      data: { section: 'appearance' },
    }));
  });

  it('should handle "open-file" route', async () => {
    renderHook(() => useDeepLink());

    await act(async () => {
      await mockOnReceivedCallback({
        route: 'open-file',
        params: { file: '/path/to/doc.txt' },
        pathParams: {},
      });
    });

    expect(mockAddTab).toHaveBeenCalledWith(expect.objectContaining({
      title: 'doc.txt',
      type: 'editor',
      data: { filePath: '/path/to/doc.txt' },
    }));
  });

  it('should handle "view-item" route', () => {
    renderHook(() => useDeepLink());

    act(() => {
      mockOnReceivedCallback({
        route: 'view-item',
        params: {},
        pathParams: { id: '123' },
      });
    });

    expect(mockAddTab).toHaveBeenCalledWith(expect.objectContaining({
      id: 'view-123',
      title: 'Item 123',
      type: 'preview',
      data: { id: '123' },
    }));
  });

  it('should ignore unknown routes', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
    renderHook(() => useDeepLink());

    act(() => {
      mockOnReceivedCallback({
        route: 'unknown-route',
        params: {},
        pathParams: {},
      });
    });

    expect(mockAddTab).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Unknown deep link route:', 'unknown-route');
    expect(window.electronAPI.notification.show).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Invalid Link',
      body: expect.stringContaining('Unknown action'),
    }));
    consoleSpy.mockRestore();
  });

  it('should notify on file open error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    window.electronAPI.file.validatePath.mockRejectedValue(new Error('File access denied'));

    renderHook(() => useDeepLink());

    await act(async () => {
      await mockOnReceivedCallback({
        route: 'open-file',
        params: { file: '/protected/doc.txt' },
        pathParams: {},
      });
    });

    expect(window.electronAPI.notification.show).toHaveBeenCalledWith(expect.objectContaining({
      title: 'File Open Error',
      body: expect.stringContaining('File access denied'),
    }));
    consoleSpy.mockRestore();
  });
});
