# ⚡ Quick Reference

## 🚀 Comandos Essenciais

```bash
# Desenvolvimento
npm start              # Inicia em modo dev com DevTools
npm test              # Executa testes
npm run lint          # Verifica problemas de linting
npm run lint:fix      # Corrige automaticamente

# Build
npm run build         # Compila a aplicação
npm run package       # Empacota para distribuição

# Utilitários
npm run test:ui       # Abre interface do Vitest
npm run test:coverage # Gera relatório de cobertura
```

## 📁 Adição Rápida de Componentes

### Novo Componente React

```javascript
// src/renderer/components/MyComponent.tsx
import { useState } from 'react';

export default function MyComponent() {
  const [state, setState] = useState('');

  return (
    <div className="p-4">
      <h1>My Component</h1>
    </div>
  );
}
```

### Novo Componente UI

```javascript
// src/renderer/components/ui/MyUIComponent.tsx
import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const MyUIComponent = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('base-classes', className)}
    {...props}
  />
));

export default MyUIComponent;
```

## 🔐 Adicionar IPC Handler

### No Main Process

```javascript
// src/main.js
ipcMain.handle('my-event', async (event, data) => {
  // Processar dados
  return { success: true, result: data };
});
```

### No Preload

```javascript
// src/preload.js
const electronAPI = {
  myEvent: (data) => ipcRenderer.invoke('my-event', data),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
```

### No Renderer

```javascript
// src/renderer/components/MyComponent.tsx
const result = await window.electronAPI.myEvent(data);
```

## 🎨 Tailwind Classes Úteis

```javascript
// Layout
className="flex items-center justify-center"
className="grid grid-cols-2 gap-4"

// Espaçamento
className="p-4 m-2 mb-8"

// Cores
className="bg-primary text-foreground"
className="border border-border rounded-md"

// Responsividade
className="md:grid-cols-2 lg:grid-cols-3"

// Estados
className="hover:bg-accent disabled:opacity-50"
```

## 🧪 Template de Teste

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('deve renderizar', () => {
    render(<MyComponent />);
    expect(screen.getByText(/text/i)).toBeInTheDocument();
  });

  it('deve responder a cliques', () => {
    render(<MyComponent />);
    fireEvent.click(screen.getByRole('button'));
    // Assert resultado
  });
});
```

## 🔍 Debugging

```javascript
// Console logs
console.log('debug:', value);

// Debugger (abra DevTools)
debugger;

// React DevTools
// Instale a extensão do Chrome

// Vitest UI
npm run test:ui
```

## 📦 Estrutura de Pastas Recomendada

```
src/
├── main.js
├── preload.js
├── css/
│   ├── globals.css
│   └── custom.css
└── renderer/
    ├── index.html
    ├── index.js
    ├── App.tsx
    ├── components/
    │   ├── Feature1/
    │   │   ├── Feature1.tsx
    │   │   └── Feature1.test.tsx
    │   └── ui/
    │       ├── Button.tsx
    │       └── Input.tsx
    ├── hooks/
    │   └── useCustomHook.js
    ├── utils/
    │   ├── cn.js
    │   └── helpers.js
    ├── constants/
    │   └── config.js
    └── styles/
        └── variables.css
```

## 🌐 Variáveis CSS (Tailwind)

```css
/* Dark/Light Mode */
--background
--foreground
--primary
--secondary
--accent
--destructive
--muted
--border
--input
```

## 📋 Checklist de Deploy

- [ ] Executar `npm run lint` com sucesso
- [ ] Executar `npm test` com sucesso
- [ ] Testar manualmente a aplicação
- [ ] Verificar versão em `package.json`
- [ ] Atualizar changelog
- [ ] Executar `npm run build`
- [ ] Testar instalador gerado
- [ ] Assinar o pacote (se necessário)

## 🐛 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Módulo não encontrado | `rm -rf node_modules && npm install` |
| Testes falhando | `npm test -- --no-coverage` |
| DevTools não abre | Verificar `isDev` em main.js |
| Componente não renderiza | Verificar imports e JSX syntax |
| Tailwind não aplica estilos | Verificar `content` em tailwind.config.js |

## 📚 Documentação Rápida

- **Electron**: https://www.electronjs.org/docs
- **React**: https://react.dev
- **Tailwind**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Vitest**: https://vitest.dev/guide/

## 🎯 Dicas Pro

1. Use `React.memo()` para otimizar renderizações
2. Use `useCallback()` para memoizar funções
3. Implemente error boundaries para melhor UX
4. Use lazy loading para chunks grandes
5. Mantenha preload.js simples e seguro
6. Valide dados no main process
7. Use variáveis de ambiente para config

---

**Precisando de ajuda? Veja README.md, DEVELOPMENT.md ou SECURITY.md**
