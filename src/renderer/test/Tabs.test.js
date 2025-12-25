import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const { addTab, closeTab, activeTabId, closeAllTabs, closeOtherTabs, tabs } = useTabContext();
    const activeTab = tabs.find(t => t.id === activeTabId);
    return (_jsxs("div", { children: [_jsx("div", { "data-testid": "active-tab-id", children: activeTabId }), _jsx("div", { "data-testid": "active-tab-type", children: activeTab ? activeTab.type : 'none' }), _jsx("div", { "data-testid": "tab-count", children: tabs.length }), tabs.map(tab => (_jsx("div", { "data-testid": `tab-content-${tab.id}`, children: activeTabId === tab.id ? `${tab.title} Content` : 'Hidden' }, tab.id))), _jsx("button", { onClick: () => addTab({ id: 'settings', title: 'Settings', type: 'settings' }), children: "Open Settings" }), _jsx("button", { onClick: () => addTab({ id: 'settings-1', title: 'Settings 1', type: 'settings' }), children: "Open Settings 1" }), _jsx("button", { onClick: () => addTab({ id: 'settings-2', title: 'Settings 2', type: 'settings' }), children: "Open Settings 2" }), _jsx("button", { onClick: () => closeTab('settings'), children: "Close Settings" }), _jsx("button", { onClick: () => closeAllTabs(), children: "Close All" }), _jsx("button", { onClick: () => closeOtherTabs('home'), children: "Close Others (Keep Home)" })] }));
};
const TestApp = () => (_jsx(StatusBarProvider, { children: _jsx(SettingsProvider, { children: _jsx(CommandProvider, { children: _jsx(TabProvider, { children: _jsx(TestDriver, {}) }) }) }) }));
describe('Tab System Logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('initializes with Home tab by default', async () => {
        render(_jsx(TestApp, {}));
        expect(screen.getByTestId('active-tab-id')).toHaveTextContent('home');
        expect(screen.getByTestId('active-tab-type')).toHaveTextContent('page'); // Home has type 'page' by default in context
        expect(screen.getByTestId('tab-count')).toHaveTextContent('1');
    });
    it('can open and switch to new tabs', async () => {
        render(_jsx(TestApp, {}));
        // Open Settings
        fireEvent.click(screen.getByText('Open Settings'));
        await waitFor(() => {
            expect(screen.getByTestId('active-tab-id')).toHaveTextContent('settings');
        });
        expect(screen.getByTestId('tab-count')).toHaveTextContent('2');
        expect(screen.getByTestId('tab-content-settings')).toHaveTextContent('Settings Content');
    });
    it('can handle multiple tabs of same type', async () => {
        render(_jsx(TestApp, {}));
        fireEvent.click(screen.getByText('Open Settings 1'));
        fireEvent.click(screen.getByText('Open Settings 2'));
        await waitFor(() => {
            expect(screen.getByTestId('active-tab-id')).toHaveTextContent('settings-2');
        });
        expect(screen.getByTestId('tab-count')).toHaveTextContent('3'); // Home + Set1 + Set2
    });
    it('can close tabs', async () => {
        render(_jsx(TestApp, {}));
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
        render(_jsx(TestApp, {}));
        fireEvent.click(screen.getByText('Open Settings'));
        fireEvent.click(screen.getByText('Open Settings 1'));
        fireEvent.click(screen.getByText('Close All'));
        await waitFor(() => {
            expect(screen.getByTestId('active-tab-id')).toHaveTextContent('home');
        });
        expect(screen.getByTestId('tab-count')).toHaveTextContent('1');
    });
});
