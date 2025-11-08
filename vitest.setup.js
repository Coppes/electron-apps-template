import '@testing-library/jest-dom';

// Mock do Electron API para testes
global.electronAPI = {
  setTitle: () => Promise.resolve(),
  onUpdateCounter: () => {},
};
