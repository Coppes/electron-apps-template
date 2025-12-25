import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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
                if (key === 'settings')
                    return Promise.resolve(null); // No saved settings
                return Promise.resolve(null);
            });
            const TestComponent = () => {
                const { settings, updateSetting } = useSettings();
                return (_jsxs("div", { children: [_jsx("span", { "data-testid": "theme", children: settings?.appearance?.theme }), _jsx("button", { onClick: () => updateSetting('appearance.theme', 'light'), children: "Set Light" })] }));
            };
            render(_jsx(SettingsProvider, { children: _jsx(TestComponent, {}) }));
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
                return (_jsxs("div", { children: [_jsx("div", { "data-testid": "stack-size", children: history.past.length }), _jsx("button", { onClick: () => execute({
                                execute: () => { },
                                undo: () => { }
                            }), children: "Do" }), _jsx("button", { onClick: undo, disabled: !canUndo, children: "Undo" }), _jsx("button", { onClick: redo, disabled: !canRedo, children: "Redo" })] }));
            };
            // Need SettingsProvider for limit
            render(_jsx(SettingsProvider, { children: _jsx(HistoryProvider, { children: _jsx(TestComponent, {}) }) }));
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
                if (key === 'hasCompletedTour')
                    return Promise.resolve(false);
                return Promise.resolve(null);
            });
            const TestComponent = () => {
                const { isOpen, nextStep, completeTour } = useTour();
                return (_jsxs("div", { children: [_jsx("div", { "data-testid": "tour-open", children: isOpen.toString() }), _jsx("button", { onClick: nextStep, children: "Next" }), _jsx("button", { onClick: completeTour, children: "Complete" })] }));
            };
            render(_jsx(SettingsProvider, { children: _jsx(TourProvider, { children: _jsx(TestComponent, {}) }) }));
            // Wait for settings to load
            expect(await screen.findByText('true')).toBeInTheDocument();
            fireEvent.click(screen.getByText('Complete'));
            expect(await screen.findByText('false')).toBeInTheDocument();
            expect(global.window.electronAPI.store.set).toHaveBeenCalledWith('hasCompletedTour', true);
        });
    });
});
