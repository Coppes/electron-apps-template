
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import HomePage from '../../../src/renderer/pages/HomePage.jsx';
import SettingsPage from '../../../src/renderer/pages/SettingsPage.jsx';
import { TabProvider } from '../../../src/renderer/contexts/TabContext.jsx';
import { SettingsProvider } from '../../../src/renderer/contexts/SettingsContext.jsx';
import { HistoryProvider } from '../../../src/renderer/contexts/HistoryContext.jsx';
import { ShortcutProvider } from '../../../src/renderer/contexts/ShortcutContext.jsx';

// Mock child components to isolate verification
console.log('Loading DataManagement.test.jsx');
vi.mock('../../../src/renderer/components/ui/card', () => ({
  Card: ({ children }) => <div>{children}</div>,
  CardHeader: ({ children }) => <div>{children}</div>,
  CardTitle: ({ children }) => <div>{children}</div>,
  CardDescription: ({ children }) => <div>{children}</div>,
  CardContent: ({ children }) => <div>{children}</div>,
}));

describe('Data Management UI', () => {
  describe('HomePage Drag & Drop', () => {
    it('should render DropZone on HomePage', () => {
      render(<HomePage />);
      expect(screen.getByRole('button', { name: /File drop zone/i })).toBeInTheDocument();
    });

    it('should handle file drop', async () => {
      render(<HomePage />);
      const dropZone = screen.getByRole('button', { name: /File drop zone/i });

      const file = new File(['{"test":true}'], 'test.json', { type: 'application/json' });
      Object.defineProperty(file, 'path', { value: '/tmp/test.json' });

      // Mock invoke for file:drop
      window.electronAPI.invoke.mockResolvedValueOnce({
        success: true,
        validFiles: [{ path: '/tmp/test.json' }],
        invalidFiles: []
      });

      // Simulate Drop Event
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
          items: [{ kind: 'file', type: 'application/json', getAsFile: () => file }]
        }
      });

      // Expect invoke to be called
      await waitFor(() => {
        expect(window.electronAPI.invoke).toHaveBeenCalledWith('file:drop', expect.any(Object));
      });
    });
  });

  describe('SettingsPage Import/Export', () => {
    it('should render Data Management section', async () => {
      render(
        <TabProvider>
          <SettingsProvider>
            <ShortcutProvider>
              <HistoryProvider>
                <SettingsPage />
              </HistoryProvider>
            </ShortcutProvider>
          </SettingsProvider>
        </TabProvider>
      );
      // Wait for settings to load
      await waitFor(() => {
        expect(screen.getByText(/import/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/export/i)).toBeInTheDocument();
    });

    it('should trigger Export Data flow', async () => {
      render(
        <TabProvider>
          <SettingsProvider>
            <ShortcutProvider>
              <HistoryProvider>
                <SettingsPage />
              </HistoryProvider>
            </ShortcutProvider>
          </SettingsProvider>
        </TabProvider>
      );

      // Mock store.get to ensure it resolves
      window.electronAPI.store.get.mockResolvedValue({ language: 'en' });

      // Wait for button to be available
      const exportBtn = await screen.findByText(/export/i);
      fireEvent.click(exportBtn);

      // Expect showSaveDialog call
      await waitFor(() => {
        expect(window.electronAPI.dialog.showSaveDialog).toHaveBeenCalled();
      });
    });
  });
});
