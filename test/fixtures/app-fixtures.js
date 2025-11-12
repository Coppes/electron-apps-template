/**
 * Test fixtures for application states
 */

// App lifecycle states
export const appLifecycleStates = {
  starting: {
    isReady: false,
    isQuitting: false,
    windows: [],
  },
  ready: {
    isReady: true,
    isQuitting: false,
    windows: [{ id: 1, type: 'main' }],
  },
  quitting: {
    isReady: true,
    isQuitting: true,
    windows: [],
  },
};

// App info
export const appInfo = {
  development: {
    version: '1.0.0-dev',
    name: 'Test App Dev',
    env: 'development',
    isPackaged: false,
  },
  production: {
    version: '1.0.0',
    name: 'Test App',
    env: 'production',
    isPackaged: true,
  },
};

// App paths
export const appPaths = {
  home: '/home/user',
  appData: '/home/user/.config/test-app',
  userData: '/home/user/.config/test-app',
  cache: '/home/user/.cache/test-app',
  temp: '/tmp',
  exe: '/usr/bin/test-app',
  module: '/usr/lib/test-app',
  desktop: '/home/user/Desktop',
  documents: '/home/user/Documents',
  downloads: '/home/user/Downloads',
  music: '/home/user/Music',
  pictures: '/home/user/Pictures',
  videos: '/home/user/Videos',
  logs: '/home/user/.config/test-app/logs',
};

// App configuration
export const appConfig = {
  default: {
    theme: 'system',
    autoUpdate: true,
    notifications: true,
    startMinimized: false,
    openAtLogin: false,
  },
  custom: {
    theme: 'dark',
    autoUpdate: false,
    notifications: false,
    startMinimized: true,
    openAtLogin: true,
    customSettings: {
      fontSize: 14,
      language: 'en-US',
    },
  },
};

// User data
export const userData = {
  empty: {},
  withUser: {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      preferences: {
        theme: 'dark',
        notifications: true,
      },
    },
  },
  withMultipleUsers: {
    users: [
      { id: 1, name: 'User 1', email: 'user1@example.com' },
      { id: 2, name: 'User 2', email: 'user2@example.com' },
    ],
    currentUserId: 1,
  },
};

// Session data
export const sessionData = {
  active: {
    isLoggedIn: true,
    userId: 1,
    sessionId: 'abc123',
    expiresAt: Date.now() + 3600000, // 1 hour from now
  },
  expired: {
    isLoggedIn: true,
    userId: 1,
    sessionId: 'xyz789',
    expiresAt: Date.now() - 3600000, // 1 hour ago
  },
  inactive: {
    isLoggedIn: false,
    userId: null,
    sessionId: null,
    expiresAt: null,
  },
};

// Update states
export const updateStates = {
  idle: {
    checking: false,
    available: false,
    downloading: false,
    downloaded: false,
    error: null,
  },
  checking: {
    checking: true,
    available: false,
    downloading: false,
    downloaded: false,
    error: null,
  },
  available: {
    checking: false,
    available: true,
    downloading: false,
    downloaded: false,
    error: null,
    version: '1.1.0',
  },
  downloading: {
    checking: false,
    available: true,
    downloading: true,
    downloaded: false,
    error: null,
    version: '1.1.0',
    progress: 45.5,
  },
  downloaded: {
    checking: false,
    available: true,
    downloading: false,
    downloaded: true,
    error: null,
    version: '1.1.0',
  },
  error: {
    checking: false,
    available: false,
    downloading: false,
    downloaded: false,
    error: 'Network error: Failed to fetch update',
  },
};

// Error states
export const errorStates = {
  networkError: {
    code: 'NETWORK_ERROR',
    message: 'Failed to connect to server',
    recoverable: true,
  },
  fileNotFound: {
    code: 'FILE_NOT_FOUND',
    message: 'The requested file was not found',
    recoverable: false,
  },
  permissionDenied: {
    code: 'PERMISSION_DENIED',
    message: 'Permission denied to access resource',
    recoverable: false,
  },
  unknownError: {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
    recoverable: false,
  },
};
