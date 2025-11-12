# Design: Improve Test Infrastructure

## Overview

Esta mudança cria uma infraestrutura completa de testes para o projeto Electron, incluindo testes unitários, integração e E2E, com mocks robustos, fixtures reutilizáveis e CI/CD automatizado.

## Architecture

### Test Structure

```
test/
├── setup/
│   ├── vitest.setup.js          # Setup global do Vitest
│   ├── electron-mocks.js        # Mocks completos do Electron API
│   └── test-helpers.js          # Helpers reutilizáveis
├── fixtures/
│   ├── window-fixtures.js       # Fixtures para BrowserWindow
│   ├── ipc-fixtures.js          # Payloads IPC de teste
│   └── app-fixtures.js          # Estados da aplicação
├── unit/
│   ├── main/
│   │   ├── window-manager.test.js
│   │   ├── logger.test.js
│   │   ├── lifecycle.test.js
│   │   ├── updater.test.js
│   │   └── ipc/
│   │       └── handlers/
│   │           ├── app.test.js
│   │           ├── dialog.test.js
│   │           └── store.test.js
│   ├── renderer/
│   │   ├── components/
│   │   │   ├── Demo.test.jsx
│   │   │   ├── ErrorBoundary.test.jsx
│   │   │   └── UpdateNotification.test.jsx
│   │   └── utils/
│   │       └── cn.test.js
│   └── security/
│       ├── csp.test.js
│       ├── navigation.test.js
│       ├── permissions.test.js
│       └── audit-log.test.js
├── integration/
│   ├── ipc-communication.test.js
│   ├── window-lifecycle.test.js
│   └── security-flow.test.js
├── e2e/
│   ├── app-launch.spec.js
│   ├── window-management.spec.js
│   ├── auto-update.spec.js
│   └── security-features.spec.js
└── .github/
    └── workflows/
        └── test.yml
```

## Key Design Decisions

### 1. Test Infrastructure (test-infrastructure)

**Decision**: Usar Vitest com configurações separadas para main e renderer

**Rationale**:
- Vitest é rápido e moderno, já está configurado
- Configurações separadas permitem ambientes diferentes (Node.js para main, jsdom para renderer)
- Suporta watch mode, coverage, e UI integrada

**Configuration**:
```javascript
// vitest.config.main.js - Para main process
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './test/setup/vitest.setup.main.js',
    include: ['test/unit/main/**/*.test.js', 'src/main/**/*.test.js'],
    coverage: {
      include: ['src/main/**/*.js'],
      exclude: ['src/main.js'], // Entry point
    },
  },
});

// vitest.config.renderer.js - Para renderer process
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup/vitest.setup.renderer.js',
    include: ['test/unit/renderer/**/*.test.{js,jsx}', 'src/renderer/**/*.test.jsx'],
    coverage: {
      include: ['src/renderer/**/*.{js,jsx}'],
    },
  },
});
```

**Alternatives Considered**:
- Jest: Mais lento, configuração mais complexa
- Mocha + Chai: Menos integrado, mais boilerplate

### 2. Electron API Mocks (test-mocks-fixtures)

**Decision**: Criar mocks completos e reutilizáveis do Electron API

**Rationale**:
- Electron APIs não podem ser executadas em ambiente de teste sem setup complexo
- Mocks permitem testar lógica sem dependências externas
- Fixtures reutilizáveis reduzem duplicação

**Implementation**:
```javascript
// test/setup/electron-mocks.js
export const mockBrowserWindow = {
  getAllWindows: vi.fn(() => []),
  fromId: vi.fn(),
  getFocusedWindow: vi.fn(),
};

export const mockDialog = {
  showOpenDialog: vi.fn(() => Promise.resolve({ canceled: false, filePaths: [] })),
  showSaveDialog: vi.fn(() => Promise.resolve({ canceled: false, filePath: '' })),
  showMessageBox: vi.fn(() => Promise.resolve({ response: 0 })),
};

export const mockApp = {
  getPath: vi.fn((name) => `/mock/path/${name}`),
  getVersion: vi.fn(() => '1.0.0'),
  quit: vi.fn(),
  on: vi.fn(),
  whenReady: vi.fn(() => Promise.resolve()),
};

export const mockIpcMain = {
  handle: vi.fn(),
  on: vi.fn(),
  removeHandler: vi.fn(),
};

// Mock completo do electronAPI para renderer
export const mockElectronAPI = {
  setTitle: vi.fn(() => Promise.resolve()),
  openFile: vi.fn(() => Promise.resolve()),
  events: {
    onUpdateAvailable: vi.fn(() => vi.fn()), // Retorna cleanup
    onUpdateDownloaded: vi.fn(() => vi.fn()),
    onUpdateProgress: vi.fn(() => vi.fn()),
    onUpdateError: vi.fn(() => vi.fn()),
  },
  store: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
  },
};
```

**Fixtures**:
```javascript
// test/fixtures/window-fixtures.js
export const windowStates = {
  default: { width: 1200, height: 800, x: 0, y: 0 },
  maximized: { width: 1920, height: 1080, isMaximized: true },
  minimized: { isMinimized: true },
};

// test/fixtures/ipc-fixtures.js
export const ipcPayloads = {
  validSetTitle: { channel: 'SET_TITLE', payload: { title: 'Test' } },
  invalidSetTitle: { channel: 'SET_TITLE', payload: { title: 123 } },
  validOpenFile: { channel: 'OPEN_FILE', payload: {} },
};
```

**Alternatives Considered**:
- @electron/remote: Deprecated e inseguro
- Electron fiddle: Complexo para testes automatizados

### 3. Unit Test Coverage (test-unit-coverage)

**Decision**: Atingir >80% de cobertura nos módulos core

**Rationale**:
- 80% é padrão da indústria para projetos bem testados
- Foco em módulos core críticos (window-manager, IPC, security)
- Excluir entry points (main.js, preload.js) da cobertura obrigatória

**Priority Modules** (ordem de importância):
1. IPC handlers (app, dialog, store) - comunicação crítica
2. Security (CSP, navigation, permissions) - segurança crítica
3. Window manager - gerenciamento de estado
4. Logger - debugging e auditoria
5. Lifecycle - inicialização e shutdown
6. Updater - auto-update (pode ser mockado)

**Coverage Configuration**:
```javascript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  lines: 80,
  functions: 80,
  branches: 75,
  statements: 80,
  exclude: [
    'node_modules/',
    'test/',
    'src/main.js',
    'src/preload.js',
    '**/*.test.{js,jsx}',
  ],
}
```

**Test Patterns**:
```javascript
// Unit test example: window-manager
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { windowManager } from '../../../src/main/window-manager.js';
import { mockBrowserWindow } from '../../setup/electron-mocks.js';

vi.mock('electron', () => ({ BrowserWindow: mockBrowserWindow }));

describe('WindowManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    windowManager.windows.clear();
  });

  describe('createWindow', () => {
    it('should create a new window with default options', () => {
      const win = windowManager.createWindow('main');
      expect(win).toBeDefined();
      expect(mockBrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({ width: 1200, height: 800 })
      );
    });

    it('should not create duplicate windows of same type', () => {
      windowManager.createWindow('main');
      windowManager.createWindow('main');
      expect(mockBrowserWindow).toHaveBeenCalledTimes(1);
    });
  });
});
```

### 4. Integration Tests (test-integration)

**Decision**: Testar comunicação IPC main-renderer e fluxos multi-processo

**Rationale**:
- Testes unitários não capturam problemas de integração entre processos
- IPC é ponto crítico de falha em aplicações Electron
- Validar que contextBridge expõe APIs corretamente

**Approach**:
- Usar Vitest para simular comunicação IPC
- Mockar ipcMain e ipcRenderer
- Validar schemas e validação de payloads

**Example**:
```javascript
// test/integration/ipc-communication.test.js
import { describe, it, expect, vi } from 'vitest';
import { mockIpcMain } from '../setup/electron-mocks.js';
import { registerHandlers } from '../../src/main/ipc/bridge.js';

describe('IPC Communication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registerHandlers();
  });

  it('should handle SET_TITLE with valid payload', async () => {
    const handler = mockIpcMain.handle.mock.calls
      .find(([channel]) => channel === 'SET_TITLE')?.[1];
    
    const result = await handler({}, { title: 'Test Title' });
    expect(result).toEqual({ success: true });
  });

  it('should reject SET_TITLE with invalid payload', async () => {
    const handler = mockIpcMain.handle.mock.calls
      .find(([channel]) => channel === 'SET_TITLE')?.[1];
    
    await expect(handler({}, { title: 123 }))
      .rejects.toThrow('Invalid payload');
  });
});
```

### 5. E2E Tests (test-e2e)

**Decision**: Usar Playwright for Electron para testes E2E

**Rationale**:
- Playwright é mantido ativamente, Spectron está deprecated
- Suporta Electron nativamente via @playwright/test
- Permite testar aplicação completa em ambiente real
- Debugging com Playwright Inspector

**Setup**:
```javascript
// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  timeout: 30000,
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'electron',
      use: {
        browserName: 'chromium',
        launchOptions: {
          executablePath: require('electron'), // Path to Electron
        },
      },
    },
  ],
});
```

**Test Example**:
```javascript
// test/e2e/app-launch.spec.js
import { test, expect, _electron as electron } from '@playwright/test';

test('app launches and shows main window', async () => {
  const app = await electron.launch({ args: ['.'] });
  const window = await app.firstWindow();
  
  await expect(window).toHaveTitle('Electron App');
  await expect(window.locator('text=Welcome')).toBeVisible();
  
  await app.close();
});

test('window can be minimized and restored', async () => {
  const app = await electron.launch({ args: ['.'] });
  const window = await app.firstWindow();
  
  await window.evaluate(() => window.electronAPI.minimize());
  // Validate minimized state
  
  await app.close();
});
```

**Alternatives Considered**:
- Spectron: Deprecated desde 2021
- Selenium: Não suporta Electron nativamente

### 6. CI/CD (test-ci)

**Decision**: GitHub Actions com matrix para 3 plataformas

**Rationale**:
- GitHub Actions gratuito para repos públicos
- Matrix build permite testar em macOS, Windows, Linux
- Cache de dependências acelera builds
- Upload de coverage para Codecov

**Workflow**:
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:coverage
      
      - name: Upload coverage
        if: matrix.os == 'ubuntu-latest'
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
  
  e2e:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18.x
          cache: 'npm'
      
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-traces
          path: test-results/
```

## Testing Strategy

### Unit Tests
- Testar cada módulo isoladamente com mocks
- Cobertura >80% para core modules
- Fast feedback loop (< 5 segundos)

### Integration Tests
- Validar comunicação IPC main-renderer
- Testar fluxos multi-janela
- Validar schemas e validação

### E2E Tests
- Testar fluxos completos de usuário
- Executar em aplicação real (não mockada)
- Rodar em CI apenas para branches principais

## Performance Considerations

- Unit tests devem rodar em < 10 segundos
- Integration tests em < 30 segundos
- E2E tests em < 2 minutos
- Usar watch mode para desenvolvimento rápido
- Cache de node_modules em CI

## Security Considerations

- Mocks não devem expor dados sensíveis
- Testes não devem fazer operações destrutivas
- E2E tests rodam em ambiente isolado
- Não commitar credenciais ou tokens em testes

## Migration Path

1. **Fase 1**: Setup de infraestrutura (vitest configs, mocks)
2. **Fase 2**: Migrar testes existentes para nova estrutura
3. **Fase 3**: Adicionar unit tests para módulos core
4. **Fase 4**: Adicionar integration tests
5. **Fase 5**: Adicionar E2E tests
6. **Fase 6**: Configurar CI/CD

## Rollback Plan

Se testes causarem problemas:
- Manter testes existentes funcionando
- Nova infraestrutura é aditiva, não destrutiva
- Testes podem ser desabilitados individualmente
- CI pode rodar apenas unit tests inicialmente

## Documentation Needs

- Guia de como escrever testes (TESTING.md)
- Convenções de mocks e fixtures
- Como executar testes localmente
- Como debuggar testes que falham
- Guia de CI/CD e coverage reports
