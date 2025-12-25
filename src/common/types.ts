/**
 * TypeScript definitions for IPC schemas and application types
 */

export interface IPCSchema {
  input: Record<string, any>;
  output: Record<string, any>;
  handler?: Function;
}

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  isFullScreen: boolean;
}

export interface WindowOptions extends Electron.BrowserWindowConstructorOptions {
  type: string;
}

export interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface ValidationError {
  field: string;
  expected: string;
  received: any;
  message: string;
}

export interface FileDialogResult {
  canceled: boolean;
  filePath?: string;
  content?: string;
  error?: string;
}

export interface VersionInfo {
  electron: string;
  chrome: string;
  node: string;
  v8: string;
  app: string;
}

export interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes?: string;
  size?: number;
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  meta?: Record<string, any>;
  timestamp: string;
}

export interface ErrorReport {
  message: string;
  stack: string;
  version: string;
  platform: string;
  context?: Record<string, any>;
}

export interface CSPPolicy {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'font-src': string[];
  'connect-src': string[];
  [key: string]: string[];
}

export interface TrayMenuItem {
  id: string;
  label: string;
  type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';
  accelerator?: string;
  enabled?: boolean;
  visible?: boolean;
  checked?: boolean;
  submenu?: TrayMenuItem[];
  click?: () => void; // Added for usage in Renderer
}

export interface ShortcutInfo {
  accelerator: string;
  description: string;
  registered: boolean;
}

export interface ProgressOptions {
  windowId?: number;
  value: number;
  state?: 'normal' | 'paused' | 'error' | 'indeterminate';
}

export interface NotificationAction {
  type: string;
  text: string;
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  silent?: boolean;
  tag?: string;
  actions?: NotificationAction[];
  timeoutMs?: number;
  urgency?: 'normal' | 'critical' | 'low';
  timeoutType?: 'default' | 'never';
}

export interface NotificationInfo {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  clicked: boolean;
}


export interface DeepLinkData {
  url: string;
  protocol: string;
  host: string;
  path: string;
  params: Record<string, string>;
  pathParams: Record<string, string>;
}

// Data Management Types
export interface BackupManifest {
  version: string;
  type: string;
  timestamp: string;
  platform: string;
  includes: string[];
  checksum?: string;
  size?: number;
}

export interface BackupOptions {
  type?: 'manual' | 'auto';
  includeDatabase?: boolean;
  useWorker?: boolean;
  includeUserFiles?: boolean;
  backupDir?: string;
  maxBackups?: number;
}

export interface BackupMetadata extends BackupManifest {
  filename: string;
  path?: string;
}

export interface SyncOperation {
  id: string;
  type: string;
  entity: string;
  data?: any;
  timestamp: number;
}

export interface SyncResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface DataAdapter {
  sync(operation: SyncOperation): Promise<SyncResult>;
}
