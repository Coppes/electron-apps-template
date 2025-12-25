import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataManagementDemo from './DataManagementDemo';
// Mock electron API
const mockData = {
    listBackups: vi.fn(),
    createBackup: vi.fn(),
    restoreBackup: vi.fn(),
    export: vi.fn(),
    import: vi.fn(),
    getConnectivityStatus: vi.fn().mockResolvedValue({ success: true, online: true }),
    onConnectivityChanged: vi.fn(() => () => { }),
};
const mockStore = {
    get: vi.fn(),
    set: vi.fn(),
};
const mockDialog = {
    showSaveDialog: vi.fn(),
    showOpenDialog: vi.fn(),
};
const mockFile = {
    watchStart: vi.fn(),
    watchStop: vi.fn(),
    onFileChanged: vi.fn(),
};
describe('DataManagementDemo', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.electronAPI = {
            data: mockData,
            dialog: mockDialog,
            file: mockFile,
            store: mockStore,
        };
        mockData.listBackups.mockResolvedValue({ backups: [] });
    });
    it('renders correctly and loads backups', async () => {
        mockData.listBackups.mockResolvedValue({
            backups: [{ filename: 'backup-1.zip', created: new Date().toISOString(), size: 1024 }]
        });
        render(_jsx(DataManagementDemo, {}));
        expect(screen.getByRole('heading', { name: 'Backup & Restore' })).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('backup-1.zip')).toBeInTheDocument();
        });
    });
    it('handles create backup', async () => {
        // defined locally to capture logs
        const localListBackups = vi.fn().mockResolvedValue({ backups: [] });
        const localCreateBackup = vi.fn().mockResolvedValue({ filename: 'new-backup.zip' });
        // Explicitly set window.electronAPI here to override any global verification
        window.electronAPI = {
            data: {
                ...mockData,
                listBackups: localListBackups,
                createBackup: localCreateBackup,
            },
            dialog: mockDialog,
            file: mockFile,
            store: {
                ...mockStore,
                get: vi.fn().mockResolvedValue('never'),
            },
        };
        render(_jsx(DataManagementDemo, {}));
        await waitFor(() => {
            expect(screen.getByText('demo.backup.create_btn')).toBeInTheDocument();
        });
        const createBtn = screen.getByText('demo.backup.create_btn');
        fireEvent.click(createBtn);
        await waitFor(() => {
            expect(localCreateBackup).toHaveBeenCalled();
            // 'demo.backup.create_success' typically has interpolation, mock returns key only if configured simple
            // Usually mock returns "key" or "key {param: val}".
            // Let's assume standard mock returns key.
            expect(screen.getByText(/demo.backup.create_success/i)).toBeInTheDocument();
        });
    });
    it('switches tabs correctly', () => {
        render(_jsx(DataManagementDemo, {}));
        // Tabs are rendered with keys
        const importExportTab = screen.getByText('demo.tabs.import_export');
        fireEvent.click(importExportTab);
        // Hardcoded titles in CardTitle/CardHeader?
        // DataManagementDemo.jsx Line 379: <CardTitle>{t('demo.import_export.title')}</CardTitle>
        expect(screen.getByText('demo.import_export.title')).toBeInTheDocument();
        // Import button: t('demo.import_export.import_btn')
        // Export button section title: t('demo.import_export.export_section')
        expect(screen.getByText('demo.import_export.export_section')).toBeInTheDocument();
        expect(screen.getByText('demo.import_export.import_section')).toBeInTheDocument();
    });
    it('handles file watching', async () => {
        render(_jsx(DataManagementDemo, {}));
        fireEvent.click(screen.getByText('demo.tabs.file_watch'));
        mockDialog.showOpenDialog.mockResolvedValue('/path/to/watch');
        const watchBtn = screen.getByText('demo.file_watch.select_folder');
        await waitFor(() => {
            expect(watchBtn).not.toBeDisabled();
        });
        fireEvent.click(watchBtn);
        await waitFor(() => {
            expect(mockDialog.showOpenDialog).toHaveBeenCalled();
        });
        await waitFor(() => {
            // "demo.file_watch.watching_label" followed by path
            // Mock returns just the key usually, but if structure is <div>{t(...)} <span>{path}</span></div>
            // they are separate nodes.
            // DataManagementDemo.jsx: {t('demo.file_watch.watching_label')} <span ...>{watchedPath}</span>
            expect(screen.getByText('demo.file_watch.watching_label')).toBeInTheDocument();
            expect(screen.getByText('/path/to/watch')).toBeInTheDocument();
        });
    });
});
