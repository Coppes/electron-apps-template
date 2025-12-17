import { renderHook } from '@testing-library/react';
import { useIpcListener } from '../../src/hooks/useIpcListener';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useIpcListener', () => {
  let removeListenerMock;
  let removeAllListenersMock;
  let onMock;

  beforeEach(() => {
    removeListenerMock = vi.fn();
    removeAllListenersMock = vi.fn();
    onMock = vi.fn();

    window.electron = {
      ipcRenderer: {
        on: onMock,
        removeListener: removeListenerMock,
        removeAllListeners: removeAllListenersMock
      }
    };
  });

  afterEach(() => {
    delete window.electron;
  });

  it('should register a listener on mount', () => {
    const handler = vi.fn();
    renderHook(() => useIpcListener('test-channel', handler));

    expect(onMock).toHaveBeenCalledWith('test-channel', expect.any(Function));
  });

  it('should remove the listener on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useIpcListener('test-channel', handler));

    // Get the internal handler that was passed to 'on'
    const internalHandler = onMock.mock.calls[0][1];

    unmount();

    expect(removeListenerMock).toHaveBeenCalledWith('test-channel', internalHandler);
  });

  it('should call the handler when event is received', () => {
    const handler = vi.fn();
    renderHook(() => useIpcListener('test-channel', handler));

    const internalHandler = onMock.mock.calls[0][1];
    internalHandler({}, 'arg1');

    expect(handler).toHaveBeenCalledWith({}, 'arg1');
  });
});
