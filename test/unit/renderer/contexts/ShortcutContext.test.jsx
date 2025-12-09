import React, { useEffect } from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShortcutProvider, useShortcutContext } from '@/contexts/ShortcutContext.jsx';

// Mock electron API
const mockStoreGet = vi.fn();
const mockStoreSet = vi.fn();
const mockStoreDelete = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  window.electronAPI = {
    store: {
      get: mockStoreGet,
      set: mockStoreSet,
      delete: mockStoreDelete,
    },
  };
});

const TestComponent = ({ onRegister }) => {
  const { registerShortcut } = useShortcutContext();
  useEffect(() => {
    if (onRegister) onRegister(registerShortcut);
  }, [registerShortcut, onRegister]);
  return <div>Test</div>;
};

const TestConsumer = () => {
  const { shortcuts, updateShortcut, resetToDefaults } = useShortcutContext();
  return (
    <div>
      <div data-testid="shortcuts-length">{shortcuts.length}</div>
      <button onClick={() => updateShortcut('test-id', 'Ctrl+B')}>Update</button>
      <button onClick={() => resetToDefaults()}>Reset</button>
    </div>
  );
};

describe('ShortcutContext', () => {
  it('should load user overrides on mount', async () => {
    mockStoreGet.mockResolvedValue({ 'test-id': 'Ctrl+U' });

    await act(async () => {
      render(
        <ShortcutProvider>
          <TestComponent />
        </ShortcutProvider>
      );
    });

    expect(mockStoreGet).toHaveBeenCalledWith('keyboard-shortcuts');
  });

  it('should register shortcuts correctly', () => {
    let capturedShortcuts = [];
    const Consumer = () => {
      const { shortcuts } = useShortcutContext();
      capturedShortcuts = shortcuts;
      return null;
    };

    const Register = () => {
      const { registerShortcut } = useShortcutContext();
      useEffect(() => {
        registerShortcut({ id: 's1', keys: 'Ctrl+A', action: () => { } });
      }, [registerShortcut]);
      return null;
    };

    render(
      <ShortcutProvider>
        <Register />
        <Consumer />
      </ShortcutProvider>
    );

    expect(capturedShortcuts).toHaveLength(1);
    expect(capturedShortcuts[0].id).toBe('s1');
  });

  it('should detect conflicts (console warn)', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

    const RegisterConflict = () => {
      const { registerShortcut } = useShortcutContext();
      useEffect(() => {
        registerShortcut({ id: 's1', keys: 'Ctrl+A', action: () => { } });
        registerShortcut({ id: 's2', keys: 'Ctrl+A', action: () => { } }); // Conflict
      }, [registerShortcut]);
      return null;
    };

    render(
      <ShortcutProvider>
        <RegisterConflict />
      </ShortcutProvider>
    );

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('conflict detected'));
    consoleSpy.mockRestore();
  });

  it('should update shortcut and persist', async () => {
    const Register = () => {
      const { registerShortcut } = useShortcutContext();
      useEffect(() => {
        registerShortcut({ id: 'test-id', keys: 'Ctrl+A', action: () => { } });
      }, [registerShortcut]);
      return null;
    };

    await act(async () => {
      render(
        <ShortcutProvider>
          <Register />
          <TestConsumer />
        </ShortcutProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Update'));
    });

    expect(mockStoreSet).toHaveBeenCalledWith('keyboard-shortcuts', { 'test-id': 'Ctrl+B' });
  });

  it('should reset shortcuts to defaults', async () => {
    await act(async () => {
      render(
        <ShortcutProvider>
          <TestConsumer />
        </ShortcutProvider>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Reset'));
    });

    expect(mockStoreDelete).toHaveBeenCalledWith('keyboard-shortcuts');
  });

  it('should reject system shortcuts', async () => {
    const Register = () => {
      const { registerShortcut } = useShortcutContext();
      useEffect(() => {
        registerShortcut({ id: 'test-id', keys: 'Ctrl+A', action: () => { } });
      }, [registerShortcut]);
      return null;
    };

    await act(async () => {
      render(
        <ShortcutProvider>
          <Register />
          <TestConsumer />
        </ShortcutProvider>
      );
    });

    // We expect the promise to reject, but since updateShortcut is likely called in an event handler in real app, we iterate via the hook.
    // However, our TestConsumer exposes updateShortcut directly.
    // To catch async error here we can modify TestConsumer or wrap in try/catch in test?
    // Actually TestConsumer just calls it. The error is thrown from updateShortcut.

    // We will simulate it by rendering a component that calls it.

    // Easier way: Spy on console.error if we can't catch it easily from UI event, or handle the promise rejection.
    // Vitest expect can handle async rejections if we had access to the function.
    // But we are accessing via context hook inside a component.

    // Let's modify TestConsumer to display error to make it testable?
    // Or just rely on the implementation being correct and test logic in isolation if possible.
    // Accessing context values in test directly is hard without a wrapper.

    // Let's rely on the already proven pattern: render and interact.
    // The previous implementation of TestConsumer doesn't catch errors. 
    // We can assume it will bubble up or be unhandled rejection.

    // Actually, let's just make a dedicated smaller test for this logic.
    let context;
    const Exposer = () => {
      context = useShortcutContext();
      return null;
    };

    await act(async () => {
      render(
        <ShortcutProvider>
          <Register />
          <Exposer />
        </ShortcutProvider>
      );
    });

    await expect(context.updateShortcut('test-id', 'Cmd+Q')).rejects.toThrow('reserved');
  });
});
