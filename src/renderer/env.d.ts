/// <reference types="vite/client" />
/// <reference types="@testing-library/jest-dom" />

import { ElectronAPI } from '../preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    api: ElectronAPI; // Legacy support if needed
    appPlugin: {
      registerCommand: (command: any) => void;
    };
  }
}

// Ensure this file is treated as a module
export { };
