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
      app: mockApp as any,
      window: mockWindow as any,
      store: mockStorage as any,
      dialog: {
        showOpenDialog: vi.fn(), // Replaced openFolder
        showSaveDialog: vi.fn(), // Replaced saveFile
        openFile: vi.fn(),
      } as any,
      data: {
        createBackup: vi.fn(),
        validateBackup: vi.fn(),
        onConnectivityChanged: vi.fn(() => () => { }),
      } as any,
    } as any;
  });

  it('renders app APIs by default', () => {
    render(<IPCDemo />);
    expect(screen.getByRole('heading', { name: 'demo.app.title' })).toBeInTheDocument();
    expect(screen.getByText('demo.app.get_version')).toBeInTheDocument();
  });

  it('calls app version API', async () => {
    mockApp.getVersion.mockResolvedValue('1.0.0');
    render(<IPCDemo />);

    fireEvent.click(screen.getByText('demo.app.get_version'));

    await waitFor(() => {
      expect(mockApp.getVersion).toHaveBeenCalled();
      expect(screen.getByText(/1.0.0/)).toBeInTheDocument();
    });
  });

  it('switches to Window APIs and calls minimize', async () => {
    render(<IPCDemo />);

    fireEvent.click(screen.getByText('demo.sections.window'));
    expect(screen.getByText('demo.window.minimize')).toBeInTheDocument();

    fireEvent.click(screen.getByText('demo.window.minimize'));

    await waitFor(() => {
      expect(mockWindow.minimize).toHaveBeenCalled();
    });
  });

  it('switches to Storage APIs and handles set/get', async () => {
    render(<IPCDemo />);

    fireEvent.click(screen.getByText('demo.sections.storage'));

    const setBtn = screen.getByText('demo.storage.set_val');
    fireEvent.click(setBtn);

    await waitFor(() => {
      expect(mockStorage.set).toHaveBeenCalled();
    });
  });
});
