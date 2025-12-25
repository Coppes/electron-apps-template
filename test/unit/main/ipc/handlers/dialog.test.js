import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dialog, BrowserWindow } from 'electron';
import fs from 'fs/promises';
import { createDialogHandlers } from '../../../../../src/main/ipc/handlers/dialog.ts';
import { IPC_CHANNELS } from '../../../../../src/common/constants.ts';

// Using global electron mock for dialog and BrowserWindow

vi.mock('fs/promises');
vi.mock('../../../../../src/main/logger.ts', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('../../../../../src/main/recent-docs.ts', () => ({
  addRecentDocument: vi.fn(),
  clearRecentDocuments: vi.fn(),
}));

describe('Dialog IPC Handlers', () => {
  let handlers;
  const mockWindow = { id: 1 };
  const mockEvent = { sender: {} };

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = createDialogHandlers();

    BrowserWindow.fromWebContents.mockReturnValue(mockWindow);

    // Default mocks for fs
    fs.readFile.mockResolvedValue('file content');
    fs.writeFile.mockResolvedValue(undefined);
  });

  describe('OPEN_FILE', () => {
    it('should open file dialog and return content', async () => {
      dialog.showOpenDialog.mockResolvedValue({
        canceled: false,
        filePaths: ['/path/to/file.txt'],
      });

      const handler = handlers[IPC_CHANNELS.DIALOG_OPEN_FILE];
      const result = await handler(mockEvent, { options: { title: 'Open' } });

      expect(dialog.showOpenDialog).toHaveBeenCalledWith(
        mockWindow,
        expect.objectContaining({
          title: 'Open',
          properties: expect.arrayContaining(['openFile']),
        })
      );
      expect(fs.readFile).toHaveBeenCalledWith('/path/to/file.txt', 'utf-8');
      expect(result).toEqual({
        canceled: false,
        filePath: '/path/to/file.txt',
        content: 'file content',
      });
    });

    it('should return canceled result', async () => {
      dialog.showOpenDialog.mockResolvedValue({ canceled: true });

      const handler = handlers[IPC_CHANNELS.DIALOG_OPEN_FILE];
      const result = await handler(mockEvent);

      expect(result).toEqual({ canceled: true });
      expect(fs.readFile).not.toHaveBeenCalled();
    });

    it('should handle read errors', async () => {
      dialog.showOpenDialog.mockResolvedValue({
        canceled: false,
        filePaths: ['/path/to/file.txt'],
      });
      fs.readFile.mockRejectedValue(new Error('Read failed'));

      const handler = handlers[IPC_CHANNELS.DIALOG_OPEN_FILE];
      const result = await handler(mockEvent);

      expect(result).toEqual({
        canceled: false,
        error: 'Read failed',
      });
    });
  });

  describe('SAVE_FILE', () => {
    it('should save file dialog and write content', async () => {
      dialog.showSaveDialog.mockResolvedValue({
        canceled: false,
        filePath: '/path/to/save.txt',
      });

      const handler = handlers[IPC_CHANNELS.DIALOG_SAVE_FILE];
      const result = await handler(mockEvent, {
        options: { title: 'Save' },
        content: 'new content',
      });

      expect(dialog.showSaveDialog).toHaveBeenCalledWith(
        mockWindow,
        expect.objectContaining({
          title: 'Save',
        })
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/path/to/save.txt',
        'new content',
        'utf-8'
      );
      expect(result).toEqual({
        canceled: false,
        filePath: '/path/to/save.txt',
      });
    });

    it('should return canceled result', async () => {
      dialog.showSaveDialog.mockResolvedValue({ canceled: true });

      const handler = handlers[IPC_CHANNELS.DIALOG_SAVE_FILE];
      const result = await handler(mockEvent, {});

      expect(result).toEqual({ canceled: true });
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should handle write errors', async () => {
      dialog.showSaveDialog.mockResolvedValue({
        canceled: false,
        filePath: '/path/to/save.txt',
      });
      fs.writeFile.mockRejectedValue(new Error('Write failed'));

      const handler = handlers[IPC_CHANNELS.DIALOG_SAVE_FILE];
      const result = await handler(mockEvent, { content: 'test' });

      expect(result).toEqual({
        canceled: false,
        error: 'Write failed',
      });
    });
  });

  describe('MESSAGE_BOX', () => {
    it('should show message box', async () => {
      dialog.showMessageBox.mockResolvedValue({ response: 1 });

      const handler = handlers[IPC_CHANNELS.DIALOG_MESSAGE];
      const result = await handler(mockEvent, {
        options: { message: 'Hello' },
      });

      expect(dialog.showMessageBox).toHaveBeenCalledWith(
        mockWindow,
        { message: 'Hello' }
      );
      expect(result).toEqual({ response: 1 });
    });
  });

  describe('ERROR_BOX', () => {
    it('should show error box', async () => {
      const handler = handlers[IPC_CHANNELS.DIALOG_ERROR];

      const result = await handler(mockEvent, {
        title: 'Error',
        content: 'Something went wrong',
      });

      expect(dialog.showErrorBox).toHaveBeenCalledWith(
        'Error',
        'Something went wrong'
      );
      expect(result.success).toBe(true);
    });
  });
});
