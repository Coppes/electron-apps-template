import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStatusBar } from '../../../../src/renderer/hooks/useStatusBar';
import { StatusBarContext } from '../../../../src/renderer/contexts/StatusBarContext';

describe('useStatusBar Hook', () => {
  const mockAddItem = vi.fn();
  const mockRemoveItem = vi.fn();
  const mockUpdateItem = vi.fn();

  const wrapper = ({ children }) => (
    <StatusBarContext.Provider
      value={{
        addItem: mockAddItem,
        removeItem: mockRemoveItem,
        updateItem: mockUpdateItem,
        items: [],
      }}
    >
      {children}
    </StatusBarContext.Provider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should register item on mount', () => {
    const item = { id: 'test1', content: 'Test' };
    renderHook(() => useStatusBar(item), { wrapper });
    expect(mockAddItem).toHaveBeenCalledWith(item);
  });

  it('should unregister item on unmount', () => {
    const item = { id: 'test1', content: 'Test' };
    const { unmount } = renderHook(() => useStatusBar(item), { wrapper });
    unmount();
    expect(mockRemoveItem).toHaveBeenCalledWith(item.id);
  });

  it('should throttle updates to max 1 per second', () => {
    const item = { id: 'test1', content: 'Initial' };
    const { result } = renderHook(() => useStatusBar(item), { wrapper });

    // Initial render triggers updateItem logic (via useEffect) with 'Initial'
    // This consumes the first throttle slot.
    expect(mockUpdateItem).toHaveBeenCalledWith('test1', item);
    mockUpdateItem.mockClear();

    // Advance timer to clear cooldown from initial render
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Now we can test manual updates
    // First manual update should happen immediately
    act(() => {
      result.current.update({ content: 'Update 1' });
    });
    expect(mockUpdateItem).toHaveBeenCalledWith('test1', { content: 'Update 1' });
    mockUpdateItem.mockClear();

    // Second update within 1s should be throttled
    act(() => {
      result.current.update({ content: 'Update 2' });
    });
    expect(mockUpdateItem).not.toHaveBeenCalled();

    // Third update within 1s should also be throttled (overwrites pending)
    act(() => {
      result.current.update({ content: 'Update 3' });
    });
    expect(mockUpdateItem).not.toHaveBeenCalled();

    // Fast forward 1s
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should have called with the latest update (Update 3)
    expect(mockUpdateItem).toHaveBeenCalledWith('test1', { content: 'Update 3' });
  });
});
