/**
 * Unit tests for IPC Bridge validation
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ipcMain } from 'electron';

// Mock electron before importing bridge
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

// Mock logger
vi.mock('../../../src/main/logger.ts', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Import after mocking
const { registerHandler, registerHandlers } = await import('../../../src/main/ipc/bridge.ts');

describe('IPC Bridge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should validate required fields', async () => {
      const schema = {
        input: {
          name: { type: 'string', required: true },
          age: { type: 'number', required: true },
        },
        output: {
          success: { type: 'boolean', required: true },
        },
      };

      const handler = vi.fn().mockResolvedValue({ success: true });
      registerHandler('test:channel', schema, handler);

      // Get the registered handler
      const registeredHandler = ipcMain.handle.mock.calls[0][1];

      // Test with missing required field
      const result = await registeredHandler({}, { name: 'John' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should validate field types', async () => {
      const schema = {
        input: {
          count: { type: 'number', required: true },
        },
        output: {
          success: { type: 'boolean', required: true },
        },
      };

      const handler = vi.fn().mockResolvedValue({ success: true });
      registerHandler('test:channel', schema, handler);

      const registeredHandler = ipcMain.handle.mock.calls[0][1];

      // Test with wrong type
      const result = await registeredHandler({}, { count: 'not a number' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
      expect(result.details).toBeDefined();
    });

    it('should allow optional fields to be missing', async () => {
      const schema = {
        input: {
          required: { type: 'string', required: true },
          optional: { type: 'string', required: false },
        },
        output: {
          success: { type: 'boolean', required: true },
        },
      };

      const handler = vi.fn().mockResolvedValue({ success: true });
      registerHandler('test:channel', schema, handler);

      const registeredHandler = ipcMain.handle.mock.calls[0][1];

      // Test without optional field
      const result = await registeredHandler({}, { required: 'value' });

      expect(result.success).toBe(true);
      // Handler is called with (event, input), event is the first arg
      expect(handler).toHaveBeenCalledWith(expect.anything(), { required: 'value' });
    });

    it('should validate array types', async () => {
      const schema = {
        input: {
          items: { type: 'array', required: true },
        },
        output: {
          success: { type: 'boolean', required: true },
        },
      };

      const handler = vi.fn().mockResolvedValue({ success: true });
      registerHandler('test:channel', schema, handler);

      const registeredHandler = ipcMain.handle.mock.calls[0][1];

      // Test with valid array
      const result = await registeredHandler({}, { items: ['a', 'b'] });
      expect(result.success).toBe(true);

      // Test with non-array
      const result2 = await registeredHandler({}, { items: 'not an array' });
      expect(result2.success).toBe(false);
    });

    it('should accept any type when specified', async () => {
      const schema = {
        input: {
          data: { type: 'any', required: true },
        },
        output: {
          success: { type: 'boolean', required: true },
        },
      };

      const handler = vi.fn().mockResolvedValue({ success: true });
      registerHandler('test:channel', schema, handler);

      const registeredHandler = ipcMain.handle.mock.calls[0][1];

      // Test with different types
      await registeredHandler({}, { data: 'string' });
      expect(handler).toHaveBeenCalledTimes(1);

      await registeredHandler({}, { data: 123 });
      expect(handler).toHaveBeenCalledTimes(2);

      await registeredHandler({}, { data: { obj: true } });
      expect(handler).toHaveBeenCalledTimes(3);
    });
  });

  describe('Output Validation', () => {
    it('should validate output has required fields', async () => {
      const schema = {
        input: {},
        output: {
          success: { type: 'boolean', required: true },
          data: { type: 'string', required: true },
        },
      };

      // Handler returns incomplete output
      const handler = vi.fn().mockResolvedValue({ success: true });
      registerHandler('test:channel', schema, handler);

      const registeredHandler = ipcMain.handle.mock.calls[0][1];
      const result = await registeredHandler({}, {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Handler returned invalid output');
      expect(result.details).toBeDefined();
    });

    it('should allow output with all required fields', async () => {
      const schema = {
        input: {},
        output: {
          success: { type: 'boolean', required: true },
          message: { type: 'string', required: true },
        },
      };

      const handler = vi.fn().mockResolvedValue({
        success: true,
        message: 'Done'
      });
      registerHandler('test:channel', schema, handler);

      const registeredHandler = ipcMain.handle.mock.calls[0][1];
      const result = await registeredHandler({}, {});

      expect(result.success).toBe(true);
      expect(result.message).toBe('Done');
    });
  });

  describe('Error Handling', () => {
    it('should catch and format handler errors', async () => {
      const schema = {
        input: {},
        output: {
          success: { type: 'boolean', required: true },
        },
      };

      const handler = vi.fn().mockRejectedValue(new Error('Handler error'));
      registerHandler('test:channel', schema, handler);

      const registeredHandler = ipcMain.handle.mock.calls[0][1];
      const result = await registeredHandler({}, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('Handler error');
    });

    it('should handle synchronous handler errors', async () => {
      const schema = {
        input: {},
        output: {
          success: { type: 'boolean', required: true },
        },
      };

      const handler = vi.fn().mockImplementation(() => {
        throw new Error('Sync error');
      });
      registerHandler('test:channel', schema, handler);

      const registeredHandler = ipcMain.handle.mock.calls[0][1];
      const result = await registeredHandler({}, {});

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('registerHandlers', () => {
    it('should register multiple handlers from schemas', () => {
      const schemas = {
        'test:one': {
          input: {},
          output: { success: { type: 'boolean', required: true } },
        },
        'test:two': {
          input: {},
          output: { success: { type: 'boolean', required: true } },
        },
      };

      const handlers = {
        'test:one': vi.fn().mockResolvedValue({ success: true }),
        'test:two': vi.fn().mockResolvedValue({ success: true }),
      };

      registerHandlers(schemas, handlers);

      expect(ipcMain.handle).toHaveBeenCalledTimes(2);
      expect(ipcMain.handle).toHaveBeenCalledWith('test:one', expect.any(Function));
      expect(ipcMain.handle).toHaveBeenCalledWith('test:two', expect.any(Function));
    });

    it('should skip handlers without corresponding schema', () => {
      const schemas = {
        'test:one': {
          input: {},
          output: { success: { type: 'boolean', required: true } },
        },
      };

      const handlers = {
        'test:one': vi.fn().mockResolvedValue({ success: true }),
        'test:missing': vi.fn().mockResolvedValue({ success: true }),
      };

      registerHandlers(schemas, handlers);

      // Should only register the one with a schema
      expect(ipcMain.handle).toHaveBeenCalledTimes(1);
      expect(ipcMain.handle).toHaveBeenCalledWith('test:one', expect.any(Function));
    });
  });

  describe('Schema Edge Cases', () => {
    it('should handle empty schema gracefully', async () => {
      const schema = {
        input: {},
        output: {},
      };

      const handler = vi.fn().mockResolvedValue({});
      registerHandler('test:channel', schema, handler);

      const registeredHandler = ipcMain.handle.mock.calls[0][1];
      await registeredHandler({}, { anything: 'goes' });

      expect(handler).toHaveBeenCalled();
    });

    it('should handle null/undefined inputs correctly', async () => {
      const schema = {
        input: {
          value: { type: 'string', required: false },
        },
        output: {
          success: { type: 'boolean', required: true },
        },
      };

      const handler = vi.fn().mockResolvedValue({ success: true });
      registerHandler('test:channel', schema, handler);

      const registeredHandler = ipcMain.handle.mock.calls[0][1];

      // Test with undefined
      await registeredHandler({}, { value: undefined });
      expect(handler).toHaveBeenCalledTimes(1);

      // Test with null
      await registeredHandler({}, { value: null });
      expect(handler).toHaveBeenCalledTimes(2);

      // Test with missing field
      await registeredHandler({}, {});
      expect(handler).toHaveBeenCalledTimes(3);
    });
  });
});
