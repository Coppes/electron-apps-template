import React from 'react';
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
      storage: mockStorage,
      dialog: { // Mock dialog to avoid crash when rendering Dialog APIs tab
        openFile: vi.fn(),
        openFolder: vi.fn(),
        saveFile: vi.fn(),
      },
      data: { // Mock data to avoid crash when rendering Data APIs tab
        listBackups: vi.fn(),
        createBackup: vi.fn(),
        validateBackup: vi.fn(),
        getConnectivityStatus: vi.fn().mockResolvedValue({ success: true, online: true }),
        onConnectivityChanged: vi.fn(() => () => { }),
      }
    };
  });

  it('renders app APIs by default', () => {
    render(<IPCDemo />);
    expect(screen.getByRole('heading', { name: 'App APIs' })).toBeInTheDocument();
    expect(screen.getByText('Get App Version')).toBeInTheDocument();
  });

  it('calls app version API', async () => {
    mockApp.getVersion.mockResolvedValue('1.0.0');
    render(<IPCDemo />);

    fireEvent.click(screen.getByText('Get App Version'));

    await waitFor(() => {
      expect(mockApp.getVersion).toHaveBeenCalled();
      expect(screen.getByText(/1.0.0/)).toBeInTheDocument();
    });
  });

  it('switches to Window APIs and calls minimize', async () => {
    render(<IPCDemo />);

    fireEvent.click(screen.getByText('Window APIs'));
    expect(screen.getByText('Minimize Window')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Minimize Window'));

    await waitFor(() => {
      expect(mockWindow.minimize).toHaveBeenCalled();
    });
  });

  it('switches to Storage APIs and handles set/get', async () => {
    render(<IPCDemo />);

    fireEvent.click(screen.getByText('Storage APIs'));

    const setBtn = screen.getByText('Set Value');
    fireEvent.click(setBtn);

    await waitFor(() => {
      expect(mockStorage.set).toHaveBeenCalled();
    });
  });
});
