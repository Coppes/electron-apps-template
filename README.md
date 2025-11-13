# Electron + React Template Boilerplate

A secure, scalable, and modern boilerplate template for creating desktop applications with Electron and React.

## 🎯 Features

- ✅ **Security First**
  - Context Isolation enabled
  - Node Integration disabled
  - Sandbox activated
  - Robust preload script with contextBridge
  - Content Security Policy (CSP) configured
  - Navigation guards for external links
  - Permission management system
  - Security audit logging
  - Encrypted storage for sensitive data (OS-level encryption)

- ✅ **Production-Ready Core Features**
  - Window state persistence and restoration
  - Multi-window management
  - Application lifecycle hooks (startup/shutdown)
  - Single instance lock
  - Auto-updater scaffolding (electron-updater)
  - Deep linking support (custom protocol handlers)
  - Crash recovery detection
  - Native notifications support
  - System tray integration
  - Dock/taskbar badge management
  - Power management utilities

- ✅ **Type-Safe IPC Bridge**
  - Schema-based IPC validation
  - Request/response validation
  - Comprehensive error handling
  - JSDoc type annotations throughout
  - Self-documenting API channels

- ✅ **Modern Stack**
  - React 18 with hooks
  - Tailwind CSS 4
  - shadcn/ui components
  - Electron 39
  - electron-store for persistence
  - electron-log for enhanced logging

- ✅ **Developer Experience**
  - ESLint configured
  - Vitest + React Testing Library
  - Comprehensive test coverage (>80%)
  - Hot Module Replacement (HMR)
  - Auto-reload for main process
  - Structured logging with levels
  - DevTools extensions support
  - Performance monitoring

- ✅ **UI Components**
  - Resizable sidebar layout
  - Pre-built pages (Home, Demo, Settings, About)
  - Form components (Button, Input, Select, Switch, Textarea)
  - Cards, Labels, Separators
  - Native file dialog integration
  - Error boundaries for graceful failures

- ✅ **Data Management** ([See full docs](docs/DATA_MANAGEMENT.md))
  - Drag & drop file handling
  - Backup & restore with ZIP compression
  - Import/export (JSON, CSV, Markdown)
  - File watching with change detection
  - Offline mode with sync queue
  - Worker threads for CPU-intensive tasks

## 📦 Installation

```bash
# Clone the repository
git clone <repository>
cd electron-apps-template

# Install dependencies
npm install
```

## 🚀 Available Scripts

```bash
# Start the application in development mode
npm start

# Package the application
npm run package

# Create distributables (installers)
npm run make

# Run linter
npm run lint

# Run tests
npm test

# Open Vitest UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## 📁 Project Structure

```
src/
├── main.js              # Electron main process
├── preload.js           # Isolation script (contextBridge)
├── css/
│   └── globals.css      # Global styles + Tailwind variables
└── renderer/
    ├── index.html       # Root HTML file
    ├── index.js         # React entry point
    ├── App.jsx          # Root component
    ├── components/
    │   ├── layout/
    │   │   └── AppShell.jsx    # Main layout with sidebar
    │   ├── pages/
    │   │   ├── HomePage.jsx     # Home page
    │   │   ├── DemoPage.jsx     # Demo with file opener
    │   │   ├── SettingsPage.jsx # Settings with persistence
    │   │   └── AboutPage.jsx    # About with version info
    │   ├── ui/
    │   │   ├── Button.jsx
    │   │   ├── Input.jsx
    │   │   ├── Textarea.jsx
    │   │   ├── Select.jsx
    │   │   ├── Switch.jsx
    │   │   ├── Label.jsx
    │   │   ├── Card.jsx
    │   │   └── Separator.jsx
    │   └── Demo.jsx     # Legacy demo component
    └── utils/
        └── cn.js        # Class merge utility
```

## 🔐 Security

### Context Isolation
The template uses `contextIsolation: true` by default, ensuring that renderer and main process code run in separate contexts.

### Preload Script
The `src/preload.js` file exposes a secure API via `contextBridge`:

```javascript
// Get version information
const versions = await window.electronAPI.getVersion();

// Open file dialog and read file
const result = await window.electronAPI.openFile();

// Store API - persist settings
await window.electronAPI.store.set('theme', 'dark');
const theme = await window.electronAPI.store.get('theme');
```

### Content Security Policy
A CSP meta tag is configured in `index.html` to restrict resource loading.

## 💾 Persistent Storage

The template includes electron-store for easy data persistence:

```javascript
// In renderer process
await window.electronAPI.store.set('settings', {
  theme: 'dark',
  notifications: true
});

const settings = await window.electronAPI.store.get('settings');
```

Settings are automatically saved in a JSON file in the user's app data directory.

## 🎨 UI Components

### AppShell Layout
The main layout uses a resizable sidebar pattern common in desktop applications:

```jsx
<AppShell>
  {(currentPage) => {
    // Render different pages based on currentPage
  }}
</AppShell>
```

### shadcn/ui Components
Pre-configured components ready to use:
- **Button**: Multiple variants (default, destructive, outline, secondary, ghost, link)
- **Input/Textarea**: Form inputs with proper styling
- **Select**: Dropdown selection
- **Switch**: Toggle switch for boolean settings
- **Card**: Container with header, content, and footer
- **Label**: Form labels
- **Separator**: Visual dividers

## 📱 Pages

### Home
Welcome page with feature overview and getting started guide.

### Demo
Interactive demonstration of:
- Native file dialog (IPC communication)
- File reading and display
- Secure main/renderer communication

### Settings
Persistent settings management:
- Theme selection
- Notification preferences
- Auto-start configuration
- Language selection

All settings are automatically saved using electron-store.

### About
Application information:
- Electron version
- Chrome version
- Node.js version
- App version (from IPC)

## 🔧 IPC Communication

The template demonstrates secure IPC patterns:

```javascript
// Main process (main.js)
ipcMain.handle('get-version', async () => {
  return {
    electron: process.versions.electron,
    app: app.getVersion()
  };
});

// Preload script (preload.js)
contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('get-version')
});

// Renderer process (React)
const versions = await window.electronAPI.getVersion();
```

## � Data Management APIs

### Drag & Drop

```jsx
import { useDragDrop } from './hooks/useDragDrop';

function MyComponent() {
  const { isDragging, handleDrop } = useDragDrop({
    onFileDrop: async (files) => {
      console.log('Files dropped:', files);
    }
  });

  return (
    <div onDrop={handleDrop} className={isDragging ? 'opacity-50' : ''}>
      Drop files here
    </div>
  );
}
```

### Backup & Restore

```javascript
// Create backup
const result = await window.electronAPI.data.createBackup({
  includeSecureStorage: true
});

// List backups
const backups = await window.electronAPI.data.listBackups();

// Restore backup
await window.electronAPI.data.restoreBackup({
  filename: 'backup-2025-11-13.zip'
});
```

### Import & Export

```javascript
// Export data as JSON
await window.electronAPI.data.exportData({
  path: '/path/to/export.json',
  format: 'json',
  data: myData
});

// Import data from CSV
const result = await window.electronAPI.data.importData({
  path: '/path/to/import.csv',
  format: 'csv'
});
```

### File Watching

```javascript
// Watch file for changes
await window.electronAPI.files.watchFile('/path/to/file.txt');

// Listen for changes
window.electronAPI.files.onFileChanged((data) => {
  console.log('File changed:', data.path, data.event);
});

// Stop watching
await window.electronAPI.files.unwatchFile('/path/to/file.txt');
```

### Offline Mode & Sync

```javascript
// Check connectivity
const status = await window.electronAPI.connectivity.getStatus();

// Queue operation for sync
await window.electronAPI.sync.enqueue({
  type: 'update',
  data: { id: 1, changes: {...} }
});

// View sync queue
const queue = await window.electronAPI.sync.getQueueStatus();
```

See [Data Management Documentation](docs/DATA_MANAGEMENT.md) for complete API reference.

## �📦 Building & Distribution

The template uses Electron Forge with makers for multiple platforms:

```bash
# Package for current platform
npm run package

# Create distributables
npm run make
```

Supported outputs:
- **Windows**: .exe (Squirrel)
- **macOS**: .dmg, .app
- **Linux**: .deb, .AppImage (via zip)

## 🧪 Testing

Comprehensive test infrastructure with Vitest for unit, integration, and E2E testing:

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run main process tests
npm run test:main

# Run renderer process tests
npm run test:renderer

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage

# Open interactive test UI
npm run test:ui
```

**Test Coverage**: The project maintains >80% test coverage for critical modules including:
- Window management
- IPC communication
- Security features
- React components

For detailed testing documentation, see [TESTING.md](./TESTING.md).

## 📚 Learn More

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [electron-store](https://github.com/sindresorhus/electron-store)

## 📄 License

ISC
});
```

### IPC Communication
Toda comunicação entre renderer e main é feita via IPC handlers seguindo as best practices do Electron.

## 🎨 shadcn/ui + Tailwind

O template vem com:
- ✅ Tailwind CSS totalmente configurado
- ✅ Variáveis CSS do shadcn/ui (dark/light mode)
- ✅ Componentes Button e Input de exemplo
- ✅ Sistema de theme pronto para uso

### Adicionar Novos Componentes

Para adicionar componentes do shadcn/ui:

```bash
# O componente já pode ser importado e customizado
# Exemplo em src/renderer/components/ui/
```

## 🧪 Testes

O template usa **Vitest** + **React Testing Library**:

```javascript
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('deve renderizar', () => {
    render(<App />);
    expect(screen.getByText(/Electron/)).toBeInTheDocument();
  });
});
```

Execute com `npm test`.

## 📝 Versões

- Node.js: 18+
- npm: 9+
- Electron: 32.0.0
- React: 18.3.1
- Tailwind: 3.4.3
- Vitest: 1.6.0

## 🔧 Configuração

### tailwind.config.js
Configurado com suporte a tema dark/light usando variáveis CSS.

### .eslintrc.json
ESLint configurado para React com suporte a React Hooks.

### vitest.config.js
Vitest configurado para ambiente jsdom com suporte a React.

## 📚 Recursos

- [Documentação do Electron](https://www.electronjs.org/docs)
- [Documentação do React](https://react.dev)
- [Documentação do Tailwind](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Vitest](https://vitest.dev)

## 📄 Licença

MIT

## 👨‍💻 Contribuições

Contribuições são bem-vindas! Sinta-se livre para abrir issues e pull requests.

---

**Desenvolvido com ❤️ para criar aplicações desktop seguras e escaláveis.**
