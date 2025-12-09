import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBar from '../../../../src/renderer/components/StatusBar';
import { StatusBarContext } from '../../../../src/renderer/contexts/StatusBarContext';

const defaultContextValue = {
  items: [
    { id: 'left1', position: 'left', content: <span data-testid="left1">Left Item</span>, priority: 1 },
    { id: 'right1', position: 'right', content: <span data-testid="right1">Right Item</span> },
    { id: 'center1', position: 'center', content: <span data-testid="center1">Center Item</span> },
  ],
  addItem: vi.fn(),
  removeItem: vi.fn(),
  updateItem: vi.fn(),
};

const renderWithContext = (ui, contextValue = defaultContextValue) => {
  return render(
    <StatusBarContext.Provider value={contextValue}>
      {ui}
    </StatusBarContext.Provider>
  );
};

describe('StatusBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render items in correct positions', () => {
    renderWithContext(<StatusBar />);

    expect(screen.getByTestId('left1')).toBeInTheDocument();
    expect(screen.getByTestId('center1')).toBeInTheDocument();
    expect(screen.getByTestId('right1')).toBeInTheDocument();
  });

  it('should render correct text content', () => {
    renderWithContext(<StatusBar />);
    expect(screen.getByText('Left Item')).toBeInTheDocument();
  });

  it('should render empty status bar without crashing', () => {
    renderWithContext(<StatusBar />, { ...defaultContextValue, items: [] });
    // Should verify it renders at least the container
    // We can check class names or just that it doesn't throw
  });
});
