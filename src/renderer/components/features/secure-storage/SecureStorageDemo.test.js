import { jsx as _jsx } from "react/jsx-runtime";
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
        render(_jsx(SecureStorageDemo, {}));
        await waitFor(() => {
            expect(screen.getByText('secure_storage.title')).toBeInTheDocument();
        });
        expect(screen.getByLabelText('secure_storage.demo.key_label')).toBeInTheDocument();
        expect(screen.getByLabelText('secure_storage.demo.value_label')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'secure_storage.demo.store' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'secure_storage.demo.retrieve' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'secure_storage.demo.delete' })).toBeInTheDocument();
    });
    it('should show warning when encryption is not available', async () => {
        mockSecureStore.isAvailable.mockResolvedValue(false);
        render(_jsx(SecureStorageDemo, {}));
        await waitFor(() => {
            expect(screen.getByText('secure_storage.demo.requirements')).toBeInTheDocument();
        });
        expect(screen.queryByRole('button', { name: 'secure_storage.demo.store' })).not.toBeInTheDocument();
    });
    it('should store a value when Store button is clicked', async () => {
        mockSecureStore.isAvailable.mockResolvedValue(true);
        mockSecureStore.set.mockResolvedValue(undefined);
        render(_jsx(SecureStorageDemo, {}));
        await waitFor(() => {
            expect(screen.getByLabelText('secure_storage.demo.key_label')).toBeInTheDocument();
        });
        const keyInput = screen.getByLabelText('secure_storage.demo.key_label');
        const valueInput = screen.getByLabelText('secure_storage.demo.value_label');
        const storeButton = screen.getByRole('button', { name: 'secure_storage.demo.store' });
        fireEvent.change(keyInput, { target: { value: 'apiKey' } });
        fireEvent.change(valueInput, { target: { value: 'secret123' } });
        fireEvent.click(storeButton);
        await waitFor(() => {
            expect(mockSecureStore.set).toHaveBeenCalledWith('apiKey', 'secret123');
            // The message involves interpolation: "stored {key: 'apiKey'}" -> mock returns raw key?
            // Mock returns "key", so we expect "secure_storage.demo.messages.stored"
            // Wait, mock returns `key`. So t('foo', { x: 1 }) -> 'foo'.
            expect(screen.getByText('secure_storage.demo.messages.stored')).toBeInTheDocument();
        });
    });
    it('should retrieve a value when Retrieve button is clicked', async () => {
        mockSecureStore.isAvailable.mockResolvedValue(true);
        mockSecureStore.get.mockResolvedValue('retrieved-secret');
        render(_jsx(SecureStorageDemo, {}));
        await waitFor(() => {
            expect(screen.getByLabelText('secure_storage.demo.key_label')).toBeInTheDocument();
        });
        const keyInput = screen.getByLabelText('secure_storage.demo.key_label');
        const retrieveButton = screen.getByRole('button', { name: 'secure_storage.demo.retrieve' });
        fireEvent.change(keyInput, { target: { value: 'apiKey' } });
        fireEvent.click(retrieveButton);
        await waitFor(() => {
            expect(mockSecureStore.get).toHaveBeenCalledWith('apiKey');
            expect(screen.getByText('retrieved-secret')).toBeInTheDocument();
            expect(screen.getByText('secure_storage.demo.messages.retrieved_success')).toBeInTheDocument();
        });
    });
    it('should delete a value when Delete button is clicked', async () => {
        mockSecureStore.isAvailable.mockResolvedValue(true);
        mockSecureStore.delete.mockResolvedValue(undefined);
        render(_jsx(SecureStorageDemo, {}));
        await waitFor(() => {
            expect(screen.getByLabelText('secure_storage.demo.key_label')).toBeInTheDocument();
        });
        const keyInput = screen.getByLabelText('secure_storage.demo.key_label');
        const deleteButton = screen.getByRole('button', { name: 'secure_storage.demo.delete' });
        fireEvent.change(keyInput, { target: { value: 'apiKey' } });
        fireEvent.click(deleteButton);
        await waitFor(() => {
            expect(mockSecureStore.delete).toHaveBeenCalledWith('apiKey');
            expect(screen.getByText('secure_storage.demo.messages.deleted')).toBeInTheDocument();
        });
    });
    it('should check if key exists when Check Exists button is clicked', async () => {
        mockSecureStore.isAvailable.mockResolvedValue(true);
        mockSecureStore.has.mockResolvedValue(true);
        render(_jsx(SecureStorageDemo, {}));
        await waitFor(() => {
            expect(screen.getByLabelText('secure_storage.demo.key_label')).toBeInTheDocument();
        });
        const keyInput = screen.getByLabelText('secure_storage.demo.key_label');
        const checkButton = screen.getByRole('button', { name: 'secure_storage.demo.check' });
        fireEvent.change(keyInput, { target: { value: 'apiKey' } });
        fireEvent.click(checkButton);
        await waitFor(() => {
            expect(mockSecureStore.has).toHaveBeenCalledWith('apiKey');
            expect(screen.getByText('secure_storage.demo.messages.exists')).toBeInTheDocument();
        });
    });
    it('should show error when key is empty', async () => {
        mockSecureStore.isAvailable.mockResolvedValue(true);
        render(_jsx(SecureStorageDemo, {}));
        await waitFor(() => {
            expect(screen.getByLabelText('secure_storage.demo.key_label')).toBeInTheDocument();
        });
        const storeButton = screen.getByRole('button', { name: 'secure_storage.demo.store' });
        fireEvent.click(storeButton);
        await waitFor(() => {
            expect(screen.getByText('secure_storage.demo.messages.enter_both')).toBeInTheDocument();
        });
        expect(mockSecureStore.set).not.toHaveBeenCalled();
    });
    it('should handle API errors gracefully', async () => {
        mockSecureStore.isAvailable.mockResolvedValue(true);
        mockSecureStore.set.mockRejectedValue(new Error('Storage error'));
        render(_jsx(SecureStorageDemo, {}));
        await waitFor(() => {
            expect(screen.getByLabelText('secure_storage.demo.key_label')).toBeInTheDocument();
        });
        const keyInput = screen.getByLabelText('secure_storage.demo.key_label');
        const valueInput = screen.getByLabelText('secure_storage.demo.value_label');
        const storeButton = screen.getByRole('button', { name: 'secure_storage.demo.store' });
        fireEvent.change(keyInput, { target: { value: 'apiKey' } });
        fireEvent.change(valueInput, { target: { value: 'secret123' } });
        fireEvent.click(storeButton);
        await waitFor(() => {
            expect(screen.getByText('secure_storage.demo.messages.store_error')).toBeInTheDocument();
        });
    });
    it('should show message when retrieving non-existent key', async () => {
        mockSecureStore.isAvailable.mockResolvedValue(true);
        mockSecureStore.get.mockResolvedValue(null);
        render(_jsx(SecureStorageDemo, {}));
        await waitFor(() => {
            expect(screen.getByLabelText('secure_storage.demo.key_label')).toBeInTheDocument();
        });
        const keyInput = screen.getByLabelText('secure_storage.demo.key_label');
        const retrieveButton = screen.getByRole('button', { name: 'secure_storage.demo.retrieve' });
        fireEvent.change(keyInput, { target: { value: 'nonexistent' } });
        fireEvent.click(retrieveButton);
        await waitFor(() => {
            expect(screen.getByText('secure_storage.demo.messages.not_found')).toBeInTheDocument();
        });
    });
});
