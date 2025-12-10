import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TabProvider, useTabContext } from '../contexts/TabContext';
import TabContent from '../components/TabContent';
import TabBar from '../components/TabBar';
import { StatusBarProvider } from '../contexts/StatusBarContext';
import { CommandProvider } from '../contexts/CommandContext';

// Mock child components to avoid full rendering complexity
vi.mock('../pages/HomePage', () => ({ default: () => <div data-testid="HomePage">Home Content</div> }));
vi.mock('../pages/SettingsPage', () => ({ default: () => <div data-testid="SettingsPage">Settings Content</div> }));
vi.mock('../pages/DemoPage', () => ({ default: () => <div data-testid="DemoPage">Demo Content</div> }));

// Helper component to drive tests
const TestDriver = () => {
  const { addTab, closeTab, activeTabId, closeAllTabs, closeOtherTabs } = useTabContext();
  return (
    <div>
      <div data-testid="active-tab">{activeTabId}</div>
      <button onClick={() => addTab({ id: 'settings', title: 'Settings', type: 'settings' })}>Open Settings</button>
      <button onClick={() => addTab({ id: 'demo-1', title: 'Demo 1', type: 'demo' })}>Open Demo 1</button>
      <button onClick={() => addTab({ id: 'demo-2', title: 'Demo 2', type: 'demo' })}>Open Demo 2</button>
      <button onClick={() => closeTab('settings')}>Close Settings</button>
      <button onClick={() => closeAllTabs()}>Close All</button>
      <button onClick={() => closeOtherTabs('home')}>Close Others (Keep Home)</button>
    </div>
  );
};

const TestApp = () => (
  <StatusBarProvider>
    <CommandProvider>
      <TabProvider>
        <TabBar />
        <TabContent />
        <TestDriver />
      </TabProvider>
    </CommandProvider>
  </StatusBarProvider>
);

describe('Tab System Integration', () => {
  beforeEach(() => {
    // Reset mocks/store if needed
    vi.clearAllMocks();
  });

  it('renders Home tab by default', async () => {
    render(<TestApp />);
    await waitFor(() => {
      expect(screen.getByText('Home Content')).toBeInTheDocument();
    });
    expect(screen.getByTestId('active-tab')).toHaveTextContent('home');
  });

  it('can open and switch to new tabs', async () => {
    render(<TestApp />);

    // Open Settings
    fireEvent.click(screen.getByText('Open Settings'));

    await waitFor(() => {
      expect(screen.getByText('Settings Content')).toBeInTheDocument();
    });
    expect(screen.getByTestId('active-tab')).toHaveTextContent('settings');
    expect(screen.queryByText('Home Content')).not.toBeInTheDocument(); // Unmounted
  });

  it('can handle multiple tabs of same type', async () => {
    render(<TestApp />);

    fireEvent.click(screen.getByText('Open Demo 1'));
    fireEvent.click(screen.getByText('Open Demo 2'));

    await waitFor(() => {
      // With lazy loading/unmounting, only the active tab should be in the DOM
      expect(screen.getAllByText('Demo Content')).toHaveLength(1);
    });
    expect(screen.getByTestId('active-tab')).toHaveTextContent('demo-2');
  });

  it('can close tabs', async () => {
    render(<TestApp />);
    fireEvent.click(screen.getByText('Open Settings'));
    expect(screen.getByTestId('active-tab')).toHaveTextContent('settings');

    fireEvent.click(screen.getByText('Close Settings'));

    // Should fallback to Home
    await waitFor(() => {
      expect(screen.getByTestId('active-tab')).toHaveTextContent('home');
    });
  });

  it('can close all tabs (resets to Home)', async () => {
    render(<TestApp />);
    fireEvent.click(screen.getByText('Open Settings'));
    fireEvent.click(screen.getByText('Open Demo 1'));

    fireEvent.click(screen.getByText('Close All'));

    await waitFor(() => {
      expect(screen.getByTestId('active-tab')).toHaveTextContent('home');
      // Should only have 1 tab (Home) in bar - checking text presence
      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });
  });
});
