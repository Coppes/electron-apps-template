import { renderHook } from '@testing-library/react';
import { useGlobalShortcut } from '../../../../src/hooks/useGlobalShortcut';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useGlobalShortcut', () => {
  let invokeMock;
  let onMock;

  beforeEach(() => {
    invokeMock = vi.fn().mockResolvedValue(undefined);
    onMock = vi.fn();

    window.electron = {
      ipcRenderer: {
        invoke: invokeMock,
        on: onMock,
        removeListener: vi.fn(),
        removeAllListeners: vi.fn()
      }
    };
  });

  afterEach(() => {
    delete window.electron;
  });

  it('should register shortcut on mount', async () => {
    renderHook(() => useGlobalShortcut('CommandOrControl+X', vi.fn()));
    expect(invokeMock).toHaveBeenCalledWith('register-global-shortcut', 'CommandOrControl+X');
  });

  it('should unregister shortcut on unmount', () => {
    const { unmount } = renderHook(() => useGlobalShortcut('CommandOrControl+X', vi.fn()));
    unmount();
    expect(invokeMock).toHaveBeenCalledWith('unregister-global-shortcut', 'CommandOrControl+X');
  });

  it('should trigger callback when shortcut event is received', () => {
    const callback = vi.fn();
    renderHook(() => useGlobalShortcut('CommandOrControl+X', callback));

    // Simulate main process sending the event
    const internalHandler = onMock.mock.calls[0][1];
    internalHandler({}, 'CommandOrControl+X');

    expect(callback).toHaveBeenCalled();
  });
});
