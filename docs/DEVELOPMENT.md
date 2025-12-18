# 🛠️ Guia de Setup para Desenvolvimento

Este guia explica como configurar o ambiente de desenvolvimento do Electron + React Template.

## Pré-requisitos

- Node.js 18.0.0 ou superior
- npm 9.0.0 ou superior
- Git
- Um editor de código (VS Code recomendado)

## Instalação Inicial

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd electron-apps-template
```

### 2. Instale as Dependências

```bash
npm install
```

Esto instalará:
- React e React DOM
- Electron e electron-forge
- Tailwind CSS e PostCSS
- ESLint para linting
- Vitest para testes
- E todas as outras dependências

### 3. Verifique a Instalação

```bash
npm run lint
npm test
npm start
```

## Estrutura do Projeto

```
electron-apps-template/
├── src/
│   ├── main.js                 # Processo principal
│   ├── preload.js              # Script de segurança
│   ├── css/
│   │   └── globals.css         # Estilos globais
│   └── renderer/               # Código React
│       ├── index.html
│       ├── index.js
│       ├── App.jsx
│       ├── App.test.jsx
│       ├── components/
│       │   ├── Demo.jsx
│       │   ├── Demo.test.jsx
│       │   └── ui/
│       │       ├── Button.jsx
│       │       └── Input.jsx
│       └── utils/
│           └── cn.js
├── webpack.main.config.js      # Config Webpack (main)
├── webpack.renderer.config.js  # Config Webpack (renderer)
├── forge.config.js             # Config electron-forge
├── tailwind.config.js          # Config Tailwind
├── vitest.config.js            # Config testes
├── .eslintrc.json              # Config ESLint
├── package.json
├── README.md
└── SECURITY.md
```

## Desenvolvimento

### Iniciar em Modo Dev

```bash
npm start
```

Isso abrirá a aplicação com:
- DevTools automáticamente
- Hot reload habilitado
- Main process pronto para debugging

### Adicionar Novos Componentes

#### 1. Criar arquivo do componente

```bash
# src/renderer/components/MyComponent.jsx
import { useState } from 'react';

export default function MyComponent() {
  return <div>Meu Componente</div>;
}
```

#### 2. Criar arquivo de testes

```bash
# src/renderer/components/MyComponent.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('deve renderizar', () => {
    render(<MyComponent />);
    expect(screen.getByText(/Meu Componente/i)).toBeInTheDocument();
  });
});
```

#### 3. Importar no App.jsx

```javascript
import MyComponent from './components/MyComponent';
```

### Adicionar Componentes shadcn/ui

O template já tem Button e Input prontos. Para criar novos componentes do shadcn/ui:

1. Crie o arquivo em `src/renderer/components/ui/ComponentName.jsx`
2. Use a função `cn` para merge de classes
3. Importe em seus componentes

Exemplo:

```javascript
// src/renderer/components/ui/Card.jsx
import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Card = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
    {...props}
  />
));

export default Card;
```

## Configuração de IDE

### VS Code

Recomendado instalar:
- ESLint extension
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

#### settings.json

```json
{
  "eslint.validate": ["javascript", "javascriptreact"],
  "editor.formatOnSave": true,
  "[javascript]": {
    "editor.defaultFormatter": "eslint.vscode-eslintfix"
  },
  "files.exclude": {
    "**/.webpack": true,
    "**/node_modules": true
  }
}
```

## Scripts Úteis

```bash
# Linting
npm run lint              # Verifica problemas
npm run lint:fix         # Corrige automaticamente

# Testes
npm test                 # Executa testes uma vez
npm run test:ui          # Abre UI do Vitest
npm run test:coverage    # Gera relatório de cobertura

# Build
npm run build            # Compila a aplicação
npm run package          # Empacota para distribuição

# Desenvolvimento
npm start                # Inicia em dev
```

## Debugging

### Debugging do Main Process

1. Abra o VS Code
2. Debug > JavaScript Debug Terminal
3. Execute: `npm start`

### Debugging do Renderer

1. Use as DevTools (F12) dentro da aplicação
2. Use React DevTools extensão

### Console Logs

```javascript
// Main process
import { app } from 'electron';
console.log('Log do main process');

// Renderer process  
console.log('Log do renderer');

// Ver logs
npm start  # Veja no console que abrir
```

### Testando Notificações de Update

Para simular um update disponível em desenvolvimento:

1. Abra o DevTools (F12)
2. No console do Renderer, execute:
   ```javascript
   // Simular update disponível
   window.dispatchEvent(new CustomEvent('update-available', { 
     detail: { version: '2.0.0', releaseNotes: 'New features!' } 
   }));
   ```
   *Nota: O listener no `App.jsx` precisa estar ouvindo eventos do DOM para isso funcionar, ou use o IPC mock se disponível.*
   
   Alternativamente, utilize a API de debug (se implementada) ou chame o handler diretamente via console se exposto.

## Variáveis de Ambiente


Crie um arquivo `.env.local`:

```bash
REACT_APP_API_URL=http://localhost:3000
REACT_APP_DEBUG=true
```

E acesse em seu código:

```javascript
const apiUrl = process.env.REACT_APP_API_URL;
```

## Build & Distribuição

### Windows

```bash
npm run build  # Gera instalador para Windows
```

### macOS

```bash
npm run build  # Gera .dmg e .zip
```

### Linux

```bash
npm run build  # Gera .deb
```

## Troubleshooting

### "Module not found"

```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

### DevTools não abre

Verifique se em `src/main.js`:

```javascript
if (isDev) {
  mainWindow.webContents.openDevTools();
}
```

### Electron não inicia

1. Verifique se Node.js está instalado: `node --version`
2. Verifique se as dependências estão instaladas: `npm install`
3. Limpe o cache: `npm cache clean --force`

### Testes falhando

```bash
# Reinicie vitest
npm test -- --no-coverage --reporter=verbose
```

## Performance

### Otimizações Recomendadas

1. Use `React.memo()` para componentes que não mudam
2. Use `useCallback()` para funções passadas como props
3. Implemente virtualization para listas grandes
4. Use lazy loading com `React.lazy()`

### Análise de Performance

```bash
npm run build  # Verifica tamanho do bundle
```

## Padrões de Gerenciamento de Dados

### Arquitetura de Camadas

O template segue uma arquitetura em camadas para gerenciamento de dados:

```
┌─────────────────────────────────────┐
│   Renderer (React Components)       │  ← UI Layer
├─────────────────────────────────────┤
│   Hooks (useDragDrop, etc)          │  ← State Management
├─────────────────────────────────────┤
│   Preload (contextBridge APIs)      │  ← IPC Bridge
├─────────────────────────────────────┤
│   IPC Handlers (files.js, data.js)  │  ← Request Validation
├─────────────────────────────────────┤
│   Data Services (backup, import)    │  ← Business Logic
├─────────────────────────────────────┤
│   Storage (electron-store, fs)      │  ← Persistence Layer
└─────────────────────────────────────┘
```

### Padrão: Operações de Arquivo

1. **Validação de Segurança**: Sempre valide paths e conteúdo
```javascript
import { validateFilePath, sanitizeContent } from './security/data-security.js';

async function handleFileOperation(filePath, content) {
  // Validar path
  const pathValidation = validateFilePath(filePath);
  if (!pathValidation.valid) {
    throw new Error(pathValidation.error);
  }

  // Sanitizar conteúdo
  const clean = sanitizeContent(content);
  
  // Processar...
}
```

2. **Rate Limiting**: Proteja contra abuso
```javascript
import { fileOperationLimiter } from './security/data-security.js';

if (!fileOperationLimiter.isAllowed(userId)) {
  throw new Error('RATE_LIMIT_EXCEEDED');
}
```

3. **Worker Threads**: Para operações pesadas
```javascript
import { getZipWorkerPool } from './workers/worker-pool.js';

const pool = getZipWorkerPool();
const result = await pool.execute({
  operation: 'create',
  outputPath: zipPath,
  files: filesToBackup
});
```

### Padrão: Sync Queue Offline-First

```javascript
// 1. Enfileirar operação
await syncQueue.enqueue({
  type: 'update',
  data: { id: 1, changes: {...} }
});

// 2. Processar quando online
connectivityManager.addListener((isOnline) => {
  if (isOnline) {
    syncQueue.process();
  }
});

// 3. Monitorar progresso
const status = syncQueue.getStatus();
console.log(`${status.synced}/${status.total} synced`);
```

### Padrão: Streaming para Arquivos Grandes

```javascript
// Import/Export com streaming (>10MB)
import { createReadStream } from 'fs';

if (fileSize > 10 * 1024 * 1024) {
  // Usar streaming
  const stream = createReadStream(filePath);
  const data = await handler.importStream(stream, options);
} else {
  // Leitura direta
  const content = await fs.readFile(filePath, 'utf8');
  const data = await handler.import(content, options);
}
```

### Padrão: Cleanup de Recursos

```javascript
// Sempre limpe watchers e listeners
class MyManager {
  cleanup() {
    // Parar timers
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
    
    // Limpar listeners
    this.listeners.clear();
    
    // Fechar watchers
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
    
    logger.info('Cleanup complete');
  }
}

// Registrar no lifecycle
app.on('before-quit', async () => {
  await myManager.cleanup();
});
```

### Performance Best Practices

1. **Batch Processing**: Processe operações em lotes
```javascript
const BATCH_SIZE = 10;
for (let i = 0; i < items.length; i += BATCH_SIZE) {
  const batch = items.slice(i, i + BATCH_SIZE);
  await processBatch(batch);
}
```

2. **Concurrency Limiting**: Limite operações simultâneas
```javascript
const CONCURRENT_LIMIT = 3;
for (let j = 0; j < batch.length; j += CONCURRENT_LIMIT) {
  const chunk = batch.slice(j, j + CONCURRENT_LIMIT);
  await Promise.all(chunk.map(item => processItem(item)));
}
```

3. **Memory Profiling**: Monitore uso de memória
```javascript
const startMemory = process.memoryUsage();
// ... operação pesada ...
const endMemory = process.memoryUsage();
const delta = endMemory.heapUsed - startMemory.heapUsed;

if (delta > 10 * 1024 * 1024 && global.gc) {
  global.gc(); // Trigger GC se >10MB
}
```

## Recursos Adicionais

- [Documentação Electron](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vitest](https://vitest.dev/guide/)
- [shadcn/ui](https://ui.shadcn.com)

## Suporte

Para problemas ou dúvidas:
1. Verifique o arquivo SECURITY.md
2. Revise a documentação oficial
3. Abra uma issue no repositório

---

**Pronto para começar? Execute `npm start` e divirta-se! 🚀**
