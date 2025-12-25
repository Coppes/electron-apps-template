/**
 * Security Utilities for Data Management
 * Centralized security validation and sanitization
 */

import path from 'path';
import { app } from 'electron';

// Security configuration with platform-specific adjustments
const FORBIDDEN_PATHS = process.platform === 'win32'
  ? ['C:\\Windows\\System32', 'C:\\Windows\\SysWOW64', 'C:\\Program Files']
  : ['/etc', '/sys', '/proc', '/dev', '/boot', '/root'];

const ALLOWED_EXTENSIONS = [
  // Text & Data
  '.txt', '.json', '.csv', '.md', '.markdown', '.xml', '.yaml', '.yml',
  // Documents
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  // Images
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp',
  // Archives
  '.zip', '.tar', '.gz', '.bz2', '.7z',
  // Backup
  '.bak', '.backup'
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_PATH_LENGTH = 260; // Windows MAX_PATH limit

export interface SecurityValidationOptions {
  allowedExtensions?: string[];
  maxSize?: number;
  allowAbsolute?: boolean;
  allowRelative?: boolean;
  mustBeInUserData?: boolean;
}

export type SecurityValidationResult =
  | { valid: false; error: string; code: string; allowedExtensions?: string[] }
  | { valid: true; resolvedPath: string; normalizedPath: string; extension: string; maxSize: number };

export interface ImportSchema {
  maxRecords?: number;
  maxStringLength?: number;
}

export interface RateLimiterOptions {
  maxRequests?: number;
  windowMs?: number;
}

/**
 * Validate file path for security vulnerabilities
 */
export function validateFilePath(filePath: string, options: SecurityValidationOptions = {}): SecurityValidationResult {
  const {
    allowedExtensions = ALLOWED_EXTENSIONS,
    maxSize = MAX_FILE_SIZE,
    allowAbsolute = true,
    allowRelative = false,
  } = options;

  // Check path length
  if (filePath.length > MAX_PATH_LENGTH) {
    return {
      valid: false,
      error: 'File path exceeds maximum length',
      code: 'PATH_TOO_LONG'
    };
  }

  // Normalize path
  const normalizedPath = path.normalize(filePath);

  // Check for path traversal
  if (normalizedPath.includes('..')) {
    return {
      valid: false,
      error: 'Path traversal detected',
      code: 'PATH_TRAVERSAL'
    };
  }

  // Check for null bytes (injection attack)
  if (normalizedPath.includes('\0')) {
    return {
      valid: false,
      error: 'Null byte detected in path',
      code: 'NULL_BYTE_INJECTION'
    };
  }

  // Resolve to absolute path
  const resolvedPath = path.resolve(normalizedPath);

  // Check if absolute path when required
  if (!allowAbsolute && path.isAbsolute(filePath)) {
    return {
      valid: false,
      error: 'Absolute paths are not allowed',
      code: 'ABSOLUTE_PATH_FORBIDDEN'
    };
  }

  // Check if relative path when required
  if (!allowRelative && !path.isAbsolute(filePath)) {
    return {
      valid: false,
      error: 'Relative paths are not allowed',
      code: 'RELATIVE_PATH_FORBIDDEN'
    };
  }

  // Check against forbidden system paths
  const isForbidden = FORBIDDEN_PATHS.some(forbiddenPath =>
    resolvedPath.toLowerCase().startsWith(forbiddenPath.toLowerCase())
  );

  if (isForbidden) {
    return {
      valid: false,
      error: 'Access to system paths is forbidden',
      code: 'SYSTEM_PATH_FORBIDDEN'
    };
  }

  // Ensure path is within user data directory (optional security boundary)
  const userDataPath = app.getPath('userData');
  if (options.mustBeInUserData && !resolvedPath.startsWith(userDataPath)) {
    return {
      valid: false,
      error: 'File must be in application data directory',
      code: 'OUTSIDE_USER_DATA'
    };
  }

  // Check file extension
  const ext = path.extname(resolvedPath).toLowerCase();
  if (allowedExtensions.length > 0 && !allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File extension ${ext} is not allowed`,
      code: 'EXTENSION_NOT_ALLOWED',
      allowedExtensions
    };
  }

  // Check for executable extensions (additional security)
  const DANGEROUS_EXTENSIONS = ['.exe', '.bat', '.cmd', '.sh', '.app', '.dll', '.so', '.dylib'];
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: 'Executable files are not allowed',
      code: 'EXECUTABLE_FORBIDDEN'
    };
  }

  return {
    valid: true,
    resolvedPath,
    normalizedPath,
    extension: ext,
    maxSize
  };
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  // Remove path components
  const basename = path.basename(filename);

  // Remove dangerous characters (control characters hex 00-1F and special chars)
  // eslint-disable-next-line no-control-regex
  const sanitized = basename.replace(/[\x00-\x1f<>:"|?*]/g, '')
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\s+/g, '_') // Replace spaces with underscore
    .replace(/_{2,}/g, '_') // Remove duplicate underscores
    .substring(0, 255); // Limit length

  // Ensure not empty
  if (!sanitized) {
    return `file_${Date.now()}`;
  }

  return sanitized;
}

/**
 * Sanitize HTML/Markdown content to prevent XSS
 */
export function sanitizeContent(content: any): string {
  if (typeof content !== 'string') {
    return '';
  }

  // Remove script tags and event handlers
  const sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '');

  return sanitized;
}

/**
 * Validate imported data structure
 */
export function validateImportData(data: any, schema: ImportSchema = {}): { valid: boolean; error?: string; code?: string } {
  const { maxRecords = 10000, maxStringLength = 1000000 } = schema;

  // Check if data is array
  if (Array.isArray(data)) {
    if (data.length > maxRecords) {
      return {
        valid: false,
        error: `Too many records (max: ${maxRecords})`,
        code: 'TOO_MANY_RECORDS'
      };
    }

    // Check each record size
    for (let i = 0; i < data.length; i++) {
      const jsonString = JSON.stringify(data[i]);
      if (jsonString.length > maxStringLength) {
        return {
          valid: false,
          error: `Record ${i} exceeds maximum size`,
          code: 'RECORD_TOO_LARGE'
        };
      }
    }
  } else if (typeof data === 'object' && data !== null) {
    // Check object size
    const jsonString = JSON.stringify(data);
    if (jsonString.length > maxStringLength) {
      return {
        valid: false,
        error: 'Data exceeds maximum size',
        code: 'DATA_TOO_LARGE'
      };
    }
  }

  return { valid: true };
}

/**
 * Rate limiter for file operations
 */
export class RateLimiter {
  private maxRequests: number;
  private windowMs: number;
  private requests: Map<string, number[]>;

  constructor(options: RateLimiterOptions = {}) {
    this.maxRequests = options.maxRequests || 10;
    this.windowMs = options.windowMs || 1000; // 1 second
    this.requests = new Map(); // key -> array of timestamps
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Filter out old requests outside the window
    const validRequests = requests.filter(timestamp =>
      now - timestamp < this.windowMs
    );

    // Check if limit exceeded
    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);

    return true;
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key: string): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(timestamp =>
      now - timestamp < this.windowMs
    );
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.requests.clear();
  }
}

// Export singleton rate limiter instances
export const fileOperationLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 1000 // 10 operations per second
});

export const backupLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60000 // 5 backups per minute
});

export const importExportLimiter = new RateLimiter({
  maxRequests: 3,
  windowMs: 60000 // 3 imports/exports per minute
});
