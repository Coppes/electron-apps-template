import '@testing-library/jest-dom';
import { mockElectronAPI } from './test/setup/electron-mocks.js';

// Mock window.electronAPI for renderer tests
if (typeof window !== 'undefined') {
  window.electronAPI = mockElectronAPI;
}
global.electronAPI = mockElectronAPI;
