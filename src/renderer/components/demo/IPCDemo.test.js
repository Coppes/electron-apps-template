import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IPCDemo from './IPCDemo';
const mockApp = {
    getVersion: vi.fn(),
    getPath: vi.fn(),
    getPlatform: vi.fn(),
    isPackaged: vi.fn(),
};
const mockWindow = {
    minimize: vi.fn(),
    toggleMaximize: vi.fn(),
    getBounds: vi.fn(),
    getDisplay: vi.fn(),
};
const mockStorage = {
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
};
describe('IPCDemo', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.electronAPI = {
            app: mockApp,
            window: mockWindow,
            store: mockStorage,
            dialog: {
                openFile: vi.fn(),
                openFolder: vi.fn(),
                saveFile: vi.fn(),
            },
            data: {
                listBackups: vi.fn(),
                createBackup: vi.fn(),
                validateBackup: vi.fn(),
                getConnectivityStatus: vi.fn().mockResolvedValue({ success: true, online: true }),
                onConnectivityChanged: vi.fn(() => () => { }),
            }
        };
    });
    it('renders app APIs by default', () => {
        render(_jsx(IPCDemo, {}));
        expect(screen.getByRole('heading', { name: 'demo.app.title' })).toBeInTheDocument();
        expect(screen.getByText('demo.app.get_version')).toBeInTheDocument();
    });
    it('calls app version API', async () => {
        mockApp.getVersion.mockResolvedValue('1.0.0');
        render(_jsx(IPCDemo, {}));
        fireEvent.click(screen.getByText('demo.app.get_version'));
        await waitFor(() => {
            expect(mockApp.getVersion).toHaveBeenCalled();
            expect(screen.getByText(/1.0.0/)).toBeInTheDocument();
        });
    });
    it('switches to Window APIs and calls minimize', async () => {
        render(_jsx(IPCDemo, {}));
        fireEvent.click(screen.getByText('demo.sections.window'));
        expect(screen.getByText('demo.window.minimize')).toBeInTheDocument();
        fireEvent.click(screen.getByText('demo.window.minimize'));
        await waitFor(() => {
            expect(mockWindow.minimize).toHaveBeenCalled();
        });
    });
    it('switches to Storage APIs and handles set/get', async () => {
        render(_jsx(IPCDemo, {}));
        fireEvent.click(screen.getByText('demo.sections.storage'));
        const setBtn = screen.getByText('demo.storage.set_val');
        fireEvent.click(setBtn);
        await waitFor(() => {
            expect(mockStorage.set).toHaveBeenCalled();
        });
    });
});
