import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CommandPalette from '../../../../src/renderer/components/CommandPalette';
import { CommandContext } from '../../../../src/renderer/contexts/CommandContext';

// Mock hooks
const mockToggle = vi.fn();
const mockSetIsOpen = vi.fn();

// Mock cmdk to avoid ResizeObserver issues in JSDOM
vi.mock('cmdk', () => {
  const Command = ({ children, ...props }) => <div data-testid="command-root" {...props}>{children}</div>;
  Command.Input = (props) => <input data-testid="command-input" {...props} />;
  Command.List = ({ children, ...props }) => <div data-testid="command-list" {...props}>{children}</div>;
  Command.Empty = ({ children, ...props }) => <div data-testid="command-empty" {...props}>{children}</div>;
  Command.Group = ({ children, heading, ...props }) => (
    <div data-testid="command-group" data-heading={heading} {...props}>
      {heading && <div>{heading}</div>}
      {children}
    </div>
  );
  Command.Item = ({ children, onSelect, ...props }) => (
    <div data-testid="command-item" onClick={onSelect} {...props}>
      {children}
    </div>
  );
  return { Command };
});

const defaultContextValue = {
  isOpen: true,
  setIsOpen: mockSetIsOpen,
  toggle: mockToggle,
  commands: [
    { id: 'cmd1', label: 'Test Command 1', group: 'General', action: vi.fn(), shortcut: 'Ctrl+1' },
    { id: 'cmd2', label: 'Test Command 2', group: 'Settings', action: vi.fn() },
  ],
  registerCommand: vi.fn(),
  unregisterCommand: vi.fn(),
};

const renderWithContext = (ui, contextValue = defaultContextValue) => {
  return render(
    <CommandContext.Provider value={contextValue}>
      {ui}
    </CommandContext.Provider>
  );
};

// Mock useKeyboardShortcut since it's used in the component
vi.mock('../../../../src/renderer/hooks/useKeyboardShortcut', () => ({
  useKeyboardShortcut: vi.fn(),
}));

describe('CommandPalette', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    renderWithContext(<CommandPalette />, { ...defaultContextValue, isOpen: false });
    expect(screen.queryByPlaceholderText(/Type a command/i)).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    renderWithContext(<CommandPalette />);
    expect(screen.getByPlaceholderText(/Type a command/i)).toBeInTheDocument();
  });

  it('should display commands grouped by category', () => {
    renderWithContext(<CommandPalette />);
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Test Command 1')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Test Command 2')).toBeInTheDocument();
  });

  it('should execute command action and close palette on selection', () => {
    renderWithContext(<CommandPalette />);

    const commandItem = screen.getByText('Test Command 1');
    fireEvent.click(commandItem);

    expect(defaultContextValue.commands[0].action).toHaveBeenCalled();
    expect(mockSetIsOpen).toHaveBeenCalledWith(false);
  });

  it('should close on backdrop click', () => {
    renderWithContext(<CommandPalette />);

    // The first div is the fixed backdrop in the component
    // We can find it by looking for the parent of the dialog container or just using a class selector if verified
    // Or we can simulate a click on the outer container. 
    // The component structure:
    // <div className="fixed inset-0 ..." onClick={() => setIsOpen(false)}>

    // We can try to click the backdrop. 
    // Since we don't have a test-id, we 'll assume the first child of root is the backdrop
    const backdrop = screen.getByPlaceholderText(/Type a command/i).closest('.fixed');
    fireEvent.click(backdrop);

    expect(mockSetIsOpen).toHaveBeenCalledWith(false);
  });
});
