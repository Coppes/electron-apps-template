import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TabProvider, useTabContext } from '../contexts/TabContext';
import { StatusBarProvider } from '../contexts/StatusBarContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { CommandProvider } from '../contexts/CommandContext';

// We don't need to mock child components if we don't render them.
// We will test the Context Logic directly via a Test Consumer.

// Helper component to drive tests and display state
const TestDriver = () => {
  const {
    addTab,
    closeTab,
    activeTabId,
    closeAllTabs,
    closeOtherTabs,
    tabs
  } = useTabContext();

  const activeTab = tabs.find(t => t.id === activeTabId);

  return (
    <div>
      <div data-testid="active-tab-id">{activeTabId}</div>
      <div data-testid="active-tab-type">{activeTab ? activeTab.type : 'none'}</div>
      <div data-testid="tab-count">{tabs.length}</div>

      {/* Visibility Check helper */}
      {tabs.map(tab => (
        <div key={tab.id} data-testid={`tab-content-${tab.id}`}>
          {activeTabId === tab.id ? `${tab.title} Content` : 'Hidden'}
        </div>
      ))}

      <button onClick={() => addTab({ id: 'settings', title: 'Settings', type: 'settings' })}>Open Settings</button>
      <button onClick={() => addTab({ id: 'settings-1', title: 'Settings 1', type: 'settings' })}>Open Settings 1</button>
      <button onClick={() => addTab({ id: 'settings-2', title: 'Settings 2', type: 'settings' })}>Open Settings 2</button>

      <button onClick={() => closeTab('settings')}>Close Settings</button>
      <button onClick={() => closeAllTabs()}>Close All</button>
      <button onClick={() => closeOtherTabs('home')}>Close Others (Keep Home)</button>
    </div>
  );
};

const TestApp = () => (
  <StatusBarProvider>
    <SettingsProvider>
      <CommandProvider>
        <TabProvider>
          {/* We ONLY render the driver, no real UI components that might cause JSDOM issues */}
          <TestDriver />
        </TabProvider>
      </CommandProvider>
    </SettingsProvider>
  </StatusBarProvider>
);

describe('Tab System Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with Home tab by default', async () => {
    render(<TestApp />);
    expect(screen.getByTestId('active-tab-id')).toHaveTextContent('home');
    expect(screen.getByTestId('active-tab-type')).toHaveTextContent('page'); // Home has type 'page' by default in context
    expect(screen.getByTestId('tab-count')).toHaveTextContent('1');
  });

  it('can open and switch to new tabs', async () => {
    render(<TestApp />);

    // Open Settings
    fireEvent.click(screen.getByText('Open Settings'));

    await waitFor(() => {
      expect(screen.getByTestId('active-tab-id')).toHaveTextContent('settings');
    });

    expect(screen.getByTestId('tab-count')).toHaveTextContent('2');
    expect(screen.getByTestId('tab-content-settings')).toHaveTextContent('Settings Content');
  });

  it('can handle multiple tabs of same type', async () => {
    render(<TestApp />);

    fireEvent.click(screen.getByText('Open Settings 1'));
    fireEvent.click(screen.getByText('Open Settings 2'));

    await waitFor(() => {
      expect(screen.getByTestId('active-tab-id')).toHaveTextContent('settings-2');
    });

    expect(screen.getByTestId('tab-count')).toHaveTextContent('3'); // Home + Set1 + Set2
  });

  it('can close tabs', async () => {
    render(<TestApp />);
    fireEvent.click(screen.getByText('Open Settings'));
    expect(screen.getByTestId('active-tab-id')).toHaveTextContent('settings');

    fireEvent.click(screen.getByText('Close Settings'));

    // Should fallback to Home
    await waitFor(() => {
      expect(screen.getByTestId('active-tab-id')).toHaveTextContent('home');
    });
    expect(screen.getByTestId('tab-count')).toHaveTextContent('1');
  });

  it('can close all tabs (resets to Home)', async () => {
    render(<TestApp />);
    fireEvent.click(screen.getByText('Open Settings'));
    fireEvent.click(screen.getByText('Open Settings 1'));

    fireEvent.click(screen.getByText('Close All'));

    await waitFor(() => {
      expect(screen.getByTestId('active-tab-id')).toHaveTextContent('home');
    });
    expect(screen.getByTestId('tab-count')).toHaveTextContent('1');
  });
});
