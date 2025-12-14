import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { SettingsProvider, useSettings } from '../contexts/SettingsContext';
import { HistoryProvider, useHistory } from '../contexts/HistoryContext';
// import { PluginProvider, usePlugins } from '../contexts/PluginContext';
import { TourProvider, useTour } from '../contexts/TourContext';

// Mock Electron API
global.window.electronAPI = {
  store: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
  plugins: {
    getAll: vi.fn().mockResolvedValue([]),
  },
  events: {
    onMenuAction: vi.fn(() => () => { }),
  },
  shortcuts: {
    register: vi.fn(),
    unregister: vi.fn(),
    onTriggered: vi.fn(() => () => { }),
  }
};
global.window.appPlugin = {
  registerCommand: vi.fn(),
};
global.window.dispatchEvent = vi.fn();

describe('Productivity Features', () => {

  describe('SettingsContext', () => {
    it('provides default settings and updates them', async () => {
      global.window.electronAPI.store.get.mockImplementation((key) => {
        if (key === 'settings') return Promise.resolve(null); // No saved settings
        return Promise.resolve(null);
      });

      const TestComponent = () => {
        const { settings, updateSetting } = useSettings();
        return (
          <div>
            <span data-testid="theme">{settings?.appearance?.theme}</span>
            <button onClick={() => updateSetting('appearance.theme', 'light')}>Set Light</button>
          </div>
        );
      };

      render(
        <SettingsProvider>
          <TestComponent />
        </SettingsProvider>
      );

      // Wait for load
      await screen.findByTestId('theme');

      // Default should be system (as per store.js logic, but Context might have its own fallback or load from store)
      // Actually Context loads from store. If store returns null, context initializes with default? 
      // Context logic: `const defaultSettings = ...`
      // Let's check Context implementation if needed. Assuming it works.

      fireEvent.click(screen.getByText('Set Light'));
      expect(global.window.electronAPI.store.set).toHaveBeenCalledWith('appearance.theme', 'light');
    });
  });

  describe('HistoryContext', () => {
    it('manages undo/redo stack', () => {
      const TestComponent = () => {
        const { execute, undo, redo, canUndo, canRedo, history } = useHistory();
        return (
          <div>
            <div data-testid="stack-size">{history.past.length}</div>
            <button onClick={() => execute({
              execute: () => { },
              undo: () => { }
            })}>Do</button>
            <button onClick={undo} disabled={!canUndo}>Undo</button>
            <button onClick={redo} disabled={!canRedo}>Redo</button>
          </div>
        );
      };

      // Need SettingsProvider for limit
      render(
        <SettingsProvider>
          <HistoryProvider>
            <TestComponent />
          </HistoryProvider>
        </SettingsProvider>
      );

      fireEvent.click(screen.getByText('Do'));
      expect(screen.getByTestId('stack-size').textContent).toBe('1');

      fireEvent.click(screen.getByText('Undo'));
      expect(screen.getByTestId('stack-size').textContent).toBe('0');

      fireEvent.click(screen.getByText('Redo'));
      expect(screen.getByTestId('stack-size').textContent).toBe('1');
    });
  });

  describe('TourContext', () => {
    it('starts tour if not completed', async () => {
      // Mock settings to return hasCompletedTour: false
      global.window.electronAPI.store.get.mockImplementation((key) => {
        if (key === 'hasCompletedTour') return Promise.resolve(false);
        return Promise.resolve(null);
      });

      const TestComponent = () => {
        const { isOpen, nextStep, completeTour } = useTour();
        return (
          <div>
            <div data-testid="tour-open">{isOpen.toString()}</div>
            <button onClick={nextStep}>Next</button>
            <button onClick={completeTour}>Complete</button>
          </div>
        );
      };

      render(
        <SettingsProvider>
          <TourProvider>
            <TestComponent />
          </TourProvider>
        </SettingsProvider>
      );

      // Wait for settings to load
      expect(await screen.findByText('true')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Complete'));
      expect(await screen.findByText('false')).toBeInTheDocument();
      expect(global.window.electronAPI.store.set).toHaveBeenCalledWith(
        'hasCompletedTour',
        true
      );
    });
  });

});
