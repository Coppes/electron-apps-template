import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock electron-log before importing logger
const mockLog = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  transports: {
    file: {
      resolvePathFn: null,
      format: '',
      level: 'info',
      maxSize: 0,
      getFile: vi.fn(() => ({ path: '/mock/logs/main.log' })),
    },
    console: {
      format: '',
      level: 'info',
    },
  },
};

vi.mock('electron-log', () => ({
  default: mockLog,
}));

vi.mock('../../../src/main/config.js', () => ({
  isDevelopment: vi.fn(() => false),
}));

describe('Logger', () => {
  let logger;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Dynamically import logger after mocks are set up
    const loggerModule = await import('../../../src/main/logger.js');
    logger = loggerModule.logger;
  });

  describe('info', () => {
    it('should log info message without metadata', () => {
      logger.info('Test message');

      expect(mockLog.info).toHaveBeenCalledWith('Test message');
    });

    it('should log info message with metadata', () => {
      const meta = { userId: 123, action: 'login' };
      logger.info('User logged in', meta);

      expect(mockLog.info).toHaveBeenCalledWith('User logged in', meta);
    });
  });

  describe('error', () => {
    it('should log error message without error object', () => {
      logger.error('An error occurred');

      expect(mockLog.error).toHaveBeenCalledWith('An error occurred');
    });

    it('should log error with Error instance', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);

      expect(mockLog.error).toHaveBeenCalledWith(
        'Error occurred',
        expect.objectContaining({
          message: 'Test error',
          stack: expect.any(String),
        })
      );
    });

    it('should log error with metadata object', () => {
      const meta = { code: 'ERR_001', details: 'Something failed' };
      logger.error('Error occurred', meta);

      expect(mockLog.error).toHaveBeenCalledWith('Error occurred', meta);
    });
  });

  describe('warn', () => {
    it('should log warning message without metadata', () => {
      logger.warn('Warning message');

      expect(mockLog.warn).toHaveBeenCalledWith('Warning message');
    });

    it('should log warning message with metadata', () => {
      const meta = { threshold: 90, current: 95 };
      logger.warn('Threshold exceeded', meta);

      expect(mockLog.warn).toHaveBeenCalledWith('Threshold exceeded', meta);
    });
  });

  describe('debug', () => {
    it('should log debug message without metadata', () => {
      logger.debug('Debug message');

      expect(mockLog.debug).toHaveBeenCalledWith('Debug message');
    });

    it('should log debug message with metadata', () => {
      const meta = { request: 'GET /api/users', duration: 150 };
      logger.debug('API call', meta);

      expect(mockLog.debug).toHaveBeenCalledWith('API call', meta);
    });
  });

  describe('getLogPath', () => {
    it('should return log file path', () => {
      const path = logger.getLogPath();

      expect(path).toBe('/mock/logs/main.log');
      expect(mockLog.transports.file.getFile).toHaveBeenCalled();
    });
  });

  describe('setConsoleLevel', () => {
    it('should set console log level to debug', () => {
      logger.setConsoleLevel('debug');

      expect(mockLog.transports.console.level).toBe('debug');
    });

    it('should set console log level to warn', () => {
      logger.setConsoleLevel('warn');

      expect(mockLog.transports.console.level).toBe('warn');
    });

    it('should log info message when level is changed', () => {
      logger.setConsoleLevel('error');

      expect(mockLog.info).toHaveBeenCalledWith('Console log level set to: error');
    });
  });
});
