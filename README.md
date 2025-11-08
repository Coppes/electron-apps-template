# Electron + React Template Boilerplate

Um template boilerplate seguro, escalável e moderno para criar aplicações desktop com Electron e React.

## 🎯 Características

- ✅ **Segurança de Primeira Prioridade**
  - Context Isolation habilitado
  - Node Integration desabilitado
  - Sandbox ativado
  - Preload script robusto com contextBridge

- ✅ **Stack Moderno**
  - React 18.3.1
  - Tailwind CSS 3.4
  - shadcn/ui components
  - Electron 32.0.0

- ✅ **Ferramentas de Desenvolvimento**
  - ESLint configurado
  - Vitest + React Testing Library
  - Webpack para build
  - Electron Forge para packaging

## 📦 Instalação

```bash
# Clone o repositório
git clone <repository>
cd electron-apps-template

# Instale as dependências
npm install
```

## 🚀 Scripts Disponíveis

```bash
# Inicia a aplicação em modo desenvolvimento
npm start

# Executa o linter
npm run lint

# Corrige automaticamente os problemas de lint
npm run lint:fix

# Executa os testes
npm test

# Abre a interface do Vitest
npm run test:ui

# Gera relatório de cobertura
npm run test:coverage

# Faz o build da aplicação
npm run build

# Empacota a aplicação
npm run package
```

## 📁 Estrutura de Pastas

```
src/
├── main.js              # Processo principal do Electron
├── preload.js           # Script de isolamento (contextBridge)
├── css/
│   └── globals.css      # Estilos globais + variáveis Tailwind
└── renderer/
    ├── index.html       # Arquivo HTML raiz
    ├── index.js         # Ponto de entrada React
    ├── App.jsx          # Componente raiz
    ├── components/
    │   ├── Demo.jsx     # Componente de exemplo
    │   └── ui/
    │       ├── Button.jsx   # Componente Button
    │       └── Input.jsx    # Componente Input
    ├── utils/
    │   └── cn.js        # Utilitário para merge de classes
    └── App.test.jsx     # Testes do App
```

## 🔐 Segurança

### Context Isolation
O template usa `contextIsolation: true` por padrão, garantindo que o código do renderer e main process sejam executados em contextos separados.

### Preload Script
O arquivo `src/preload.js` expõe uma API segura via `contextBridge`:

```javascript
// Alterar título da janela
await window.electronAPI.setTitle('Novo Título');

// Listener para updates
window.electronAPI.onUpdateCounter((count) => {
  console.log('Counter:', count);
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
