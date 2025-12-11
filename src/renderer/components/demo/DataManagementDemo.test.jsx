import React from 'react';
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

    render(<DataManagementDemo />);

    expect(screen.getByRole('heading', { name: 'Backup & Restore' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('backup-1.zip')).toBeInTheDocument();
    });
  });

  it('handles create backup', async () => {
    mockData.createBackup.mockResolvedValue({ filename: 'new-backup.zip' });



    render(<DataManagementDemo />);

    await waitFor(() => {
      expect(screen.getByText('Create Backup')).toBeInTheDocument();
    });

    const createBtn = screen.getByText('Create Backup');
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(mockData.createBackup).toHaveBeenCalled();
      expect(screen.getByText(/Backup created/i)).toBeInTheDocument();
    });
  });

  it('switches tabs correctly', () => {
    render(<DataManagementDemo />);

    const importExportTab = screen.getByText('Import & Export');
    fireEvent.click(importExportTab);

    expect(screen.getByText('Export Data')).toBeInTheDocument();
    expect(screen.getByText('Import Data')).toBeInTheDocument();
  });

  it('handles file watching', async () => {
    render(<DataManagementDemo />);

    fireEvent.click(screen.getByText('File Watching'));

    mockDialog.showOpenDialog.mockResolvedValue('/path/to/watch');

    const watchBtn = screen.getByText('Select Folder to Watch');

    await waitFor(() => {
      expect(watchBtn).not.toBeDisabled();
    });

    fireEvent.click(watchBtn);

    await waitFor(() => {
      expect(mockDialog.showOpenDialog).toHaveBeenCalled();
    });

    await waitFor(() => {
      // confirm UI updated, which implies success
      expect(screen.getAllByText('Watching: /path/to/watch').length).toBeGreaterThan(0);
    });
  });
});
