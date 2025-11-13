/**
 * Tests for SecureStorageDemo Component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SecureStorageDemo from './SecureStorageDemo';

// Mock window.api.secureStore
const mockSecureStore = {
  isAvailable: vi.fn(),
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  has: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  
  // Setup window.api mock
  global.window = global.window || {};
  global.window.api = {
    secureStore: mockSecureStore,
  };
});

describe('SecureStorageDemo', () => {
  it('should render component when encryption is available', async () => {
    mockSecureStore.isAvailable.mockResolvedValue(true);

    render(<SecureStorageDemo />);

    await waitFor(() => {
      expect(screen.getByText(/Secure Storage Demo/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Key:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Value/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Store/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retrieve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
  });

  it('should show warning when encryption is not available', async () => {
    mockSecureStore.isAvailable.mockResolvedValue(false);

    render(<SecureStorageDemo />);

    await waitFor(() => {
      expect(screen.getByText(/not available/i)).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /Store/i })).not.toBeInTheDocument();
  });

  it('should store a value when Store button is clicked', async () => {
    mockSecureStore.isAvailable.mockResolvedValue(true);
    mockSecureStore.set.mockResolvedValue(undefined);

    render(<SecureStorageDemo />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Key:/i)).toBeInTheDocument();
    });

    const keyInput = screen.getByLabelText(/Key:/i);
    const valueInput = screen.getByLabelText(/Value/i);
    const storeButton = screen.getByRole('button', { name: /Store/i });

    fireEvent.change(keyInput, { target: { value: 'apiKey' } });
    fireEvent.change(valueInput, { target: { value: 'secret123' } });
    fireEvent.click(storeButton);

    await waitFor(() => {
      expect(mockSecureStore.set).toHaveBeenCalledWith('apiKey', 'secret123');
      expect(screen.getByText(/Successfully stored/i)).toBeInTheDocument();
    });
  });

  it('should retrieve a value when Retrieve button is clicked', async () => {
    mockSecureStore.isAvailable.mockResolvedValue(true);
    mockSecureStore.get.mockResolvedValue('retrieved-secret');

    render(<SecureStorageDemo />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Key:/i)).toBeInTheDocument();
    });

    const keyInput = screen.getByLabelText(/Key:/i);
    const retrieveButton = screen.getByRole('button', { name: /Retrieve/i });

    fireEvent.change(keyInput, { target: { value: 'apiKey' } });
    fireEvent.click(retrieveButton);

    await waitFor(() => {
      expect(mockSecureStore.get).toHaveBeenCalledWith('apiKey');
      expect(screen.getByText('retrieved-secret')).toBeInTheDocument();
      expect(screen.getByText(/Retrieved value for "apiKey"/i)).toBeInTheDocument();
    });
  });

  it('should delete a value when Delete button is clicked', async () => {
    mockSecureStore.isAvailable.mockResolvedValue(true);
    mockSecureStore.delete.mockResolvedValue(undefined);

    render(<SecureStorageDemo />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Key:/i)).toBeInTheDocument();
    });

    const keyInput = screen.getByLabelText(/Key:/i);
    const deleteButton = screen.getByRole('button', { name: /Delete/i });

    fireEvent.change(keyInput, { target: { value: 'apiKey' } });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockSecureStore.delete).toHaveBeenCalledWith('apiKey');
      expect(screen.getByText(/Deleted/i)).toBeInTheDocument();
    });
  });

  it('should check if key exists when Check Exists button is clicked', async () => {
    mockSecureStore.isAvailable.mockResolvedValue(true);
    mockSecureStore.has.mockResolvedValue(true);

    render(<SecureStorageDemo />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Key:/i)).toBeInTheDocument();
    });

    const keyInput = screen.getByLabelText(/Key:/i);
    const checkButton = screen.getByRole('button', { name: /Check Exists/i });

    fireEvent.change(keyInput, { target: { value: 'apiKey' } });
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(mockSecureStore.has).toHaveBeenCalledWith('apiKey');
      expect(screen.getByText(/exists/i)).toBeInTheDocument();
    });
  });

  it('should show error when key is empty', async () => {
    mockSecureStore.isAvailable.mockResolvedValue(true);

    render(<SecureStorageDemo />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Key:/i)).toBeInTheDocument();
    });

    const storeButton = screen.getByRole('button', { name: /Store/i });
    fireEvent.click(storeButton);

    await waitFor(() => {
      expect(screen.getByText(/Please enter both key and value/i)).toBeInTheDocument();
    });

    expect(mockSecureStore.set).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    mockSecureStore.isAvailable.mockResolvedValue(true);
    mockSecureStore.set.mockRejectedValue(new Error('Storage error'));

    render(<SecureStorageDemo />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Key:/i)).toBeInTheDocument();
    });

    const keyInput = screen.getByLabelText(/Key:/i);
    const valueInput = screen.getByLabelText(/Value/i);
    const storeButton = screen.getByRole('button', { name: /Store/i });

    fireEvent.change(keyInput, { target: { value: 'apiKey' } });
    fireEvent.change(valueInput, { target: { value: 'secret123' } });
    fireEvent.click(storeButton);

    await waitFor(() => {
      expect(screen.getByText(/Error storing/i)).toBeInTheDocument();
    });
  });

  it('should show message when retrieving non-existent key', async () => {
    mockSecureStore.isAvailable.mockResolvedValue(true);
    mockSecureStore.get.mockResolvedValue(null);

    render(<SecureStorageDemo />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Key:/i)).toBeInTheDocument();
    });

    const keyInput = screen.getByLabelText(/Key:/i);
    const retrieveButton = screen.getByRole('button', { name: /Retrieve/i });

    fireEvent.change(keyInput, { target: { value: 'nonexistent' } });
    fireEvent.click(retrieveButton);

    await waitFor(() => {
      expect(screen.getByText(/No value found/i)).toBeInTheDocument();
    });
  });
});
