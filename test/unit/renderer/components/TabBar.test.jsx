import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TabBar from '../../../../src/renderer/components/TabBar';
import { TabContext } from '../../../../src/renderer/contexts/TabContext';

// Mock hooks
const mockSetActiveTab = vi.fn();
const mockCloseTab = vi.fn();

const defaultContextValue = {
  tabs: [
    { id: 'home', title: 'Home', type: 'page' },
    { id: 'settings', title: 'Settings', type: 'page' },
  ],
  activeTabId: 'home',
  setActiveTab: mockSetActiveTab,
  closeTab: mockCloseTab,
};

const renderWithContext = (ui, contextValue = defaultContextValue) => {
  return render(
    <TabContext.Provider value={contextValue}>
      {ui}
    </TabContext.Provider>
  );
};

describe('TabBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all open tabs', () => {
    renderWithContext(<TabBar />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should highlight the active tab', () => {
    // We can check for class names or style
    const { container } = renderWithContext(<TabBar />);

    // The active tab should have 'border-b-primary' or similar class based on implementation
    const homeTab = screen.getByText('Home').closest('div');
    const settingsTab = screen.getByText('Settings').closest('div');

    expect(homeTab).toHaveClass('border-b-primary');
    expect(settingsTab).not.toHaveClass('border-b-primary');
  });

  it('should switch tabs on click', () => {
    renderWithContext(<TabBar />);

    fireEvent.click(screen.getByText('Settings'));
    expect(mockSetActiveTab).toHaveBeenCalledWith('settings');
  });

  it('should close tab when close button is clicked', () => {
    renderWithContext(<TabBar />);

    // Find the close button for the Home tab. 
    // The structure is a button inside the tab div.
    // We can assume the button has an X icon.
    // Or we can query by role 'button' inside the element.
    const homeTab = screen.getByText('Home').closest('div');
    const closeButton = homeTab.querySelector('button');

    fireEvent.click(closeButton);
    expect(mockCloseTab).toHaveBeenCalledWith('home');
  });

  // Verify that clicking close button DOES NOT trigger setActiveTab (event propagation check)
  it('should not switch tab when closing', () => {
    renderWithContext(<TabBar />);

    const homeTab = screen.getByText('Home').closest('div');
    const closeButton = homeTab.querySelector('button');

    fireEvent.click(closeButton);
    expect(mockSetActiveTab).not.toHaveBeenCalled();
  });
});
