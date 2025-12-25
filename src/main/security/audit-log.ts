import { logger } from '../logger.ts';
import { app } from 'electron';
import { writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';

/**
 * Security Audit Logging
 * Logs all security-relevant events for audit and monitoring
 */

/**
 * Security audit log file path
 * @type {string}
 */
const AUDIT_LOG_PATH = join(app.getPath('logs'), 'security-audit.log');

/**
 * Write audit entry to dedicated security log file
 * @param {Object} entry - Audit entry
 */
function writeAuditLog(entry: Record<string, any>) {
  const logLine = JSON.stringify({
    timestamp: new Date().toISOString(),
    ...entry,
  }) + '\n';

  try {
    appendFileSync(AUDIT_LOG_PATH, logLine, { encoding: 'utf8' });
  } catch (error: any) {
    logger.error('Failed to write to security audit log', { error: error.message });
  }
}

/**
 * Log CSP violation
 * @param {Object} details - Violation details
 */
export function logCSPViolation(details: { windowId: number; violatedDirective: string; blockedUri: string; sourceFile: string; lineNumber: number }) {
  const entry = {
    type: 'csp_violation',
    severity: 'warning',
    windowId: details.windowId,
    violatedDirective: details.violatedDirective || 'unknown',
    blockedUri: details.blockedUri || 'unknown',
    sourceFile: details.sourceFile || 'unknown',
    lineNumber: details.lineNumber || 0,
  };

  logger.warn('CSP Violation', entry);
  writeAuditLog(entry);
}

/**
 * Log navigation block
 * @param {Object} details - Navigation details
 */
export function logNavigationBlock(details: { windowId: number; url: string; reason: string }) {
  const entry = {
    type: 'navigation_blocked',
    severity: 'warning',
    windowId: details.windowId,
    url: details.url,
    reason: details.reason,
  };

  logger.warn('Navigation blocked', entry);
  writeAuditLog(entry);
}

/**
 * Log permission request
 * @param {Object} details - Permission details
 */
export function logPermissionRequest(details: { windowId: number; permission: string; origin: string; granted: boolean }) {
  const entry = {
    type: 'permission_request',
    severity: details.granted ? 'info' : 'warning',
    windowId: details.windowId,
    permission: details.permission,
    origin: details.origin,
    granted: details.granted,
  };

  logger.info('Permission request', entry);
  writeAuditLog(entry);
}

/**
 * Log external link opened
 * @param {Object} details - Link details
 */
export function logExternalLink(details: { url: string; windowId?: number }) {
  const entry = {
    type: 'external_link_opened',
    severity: 'info',
    url: details.url,
    windowId: details.windowId || null,
  };

  logger.info('External link opened', entry);
  writeAuditLog(entry);
}

/**
 * Log security event
 * @param {Object} details - Event details
 */
export function logSecurityEvent(details: { type: string; severity: 'info' | 'warning' | 'error'; message: string; metadata?: Record<string, any> }) {
  const entry = {
    type: details.type,
    severity: details.severity,
    message: details.message,
    metadata: details.metadata || {},
  };

  const logMethod = (logger as any)[details.severity] || logger.info;
  logMethod('Security event', entry);
  writeAuditLog(entry);
}

/**
 * Initialize security audit logging
 * Creates the audit log file if it doesn't exist
 */
export function initSecurityAuditLog() {
  try {
    // Create initial log entry
    writeFileSync(AUDIT_LOG_PATH, '', { flag: 'a' });

    const initEntry = {
      type: 'audit_log_initialized',
      severity: 'info',
      appVersion: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
    };

    writeAuditLog(initEntry);
    logger.info('Security audit log initialized', { path: AUDIT_LOG_PATH });
  } catch (error: any) {
    logger.error('Failed to initialize security audit log', { error: error.message });
  }
}

/**
 * Get audit log file path
 * @returns {string}
 */
export function getAuditLogPath() {
  return AUDIT_LOG_PATH;
}
