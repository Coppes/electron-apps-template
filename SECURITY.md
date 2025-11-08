# 🔐 Guia de Segurança - Electron Template

Este documento descreve as práticas de segurança implementadas neste template.

## Context Isolation

O template usa **Context Isolation** habilitado em `src/main.js`:

```javascript
webPreferences: {
  contextIsolation: true,
  nodeIntegration: false,
  enableRemoteModule: false,
  preload: path.join(__dirname, 'preload.js'),
  sandbox: true,
}
```

### Por quê?
- **Isolamento de Contexto**: Renderer e main process rodam em contextos separados
- **Sem Node Integration**: O renderer não tem acesso direto a APIs do Node.js
- **Sandbox**: O renderer é executado em um sandbox, limitando acesso ao sistema

## Preload Script

O arquivo `src/preload.js` expõe uma API segura usando `contextBridge`:

```javascript
contextBridge.exposeInMainWorld('electronAPI', {
  setTitle: (title) => ipcRenderer.invoke('set-title', title),
  onUpdateCounter: (callback) => { /* ... */ }
});
```

### Por quê?
- **Controle de Acesso**: Apenas métodos explicitamente expostos estão disponíveis
- **Validação**: Permite validação de dados no preload antes de enviar ao main
- **Tipo-Safe**: Fornece uma API clara e tipada para o renderer

## IPC Communication

Toda comunicação usa IPC handlers (`ipcMain.handle`):

```javascript
ipcMain.handle('set-title', async (event, title) => {
  // Validação aqui
  mainWindow.setTitle(title);
  return { success: true, title };
});
```

### Boas Práticas
1. ✅ Sempre usar `invoke` (promisses) em vez de `send`
2. ✅ Validar dados no main process
3. ✅ Sanitizar strings de usuário
4. ✅ Nunca usar `eval()` ou similar
5. ✅ Usar HTTPS para comunicação externa

## Segurança de Navegação

O template desabilita navegação para URLs não autorizada:

```javascript
contents.on('will-navigate', (event, navigationUrl) => {
  const parsedUrl = new URL(navigationUrl);
  if (parsedUrl.origin !== 'http://localhost:3000') {
    event.preventDefault();
  }
});
```

## Content Security Policy

Para reforçar segurança, adicione CSP headers no HTML:

```html
<meta 
  http-equiv="Content-Security-Policy" 
  content="default-src 'self'; 
           script-src 'self' 'unsafe-inline'; 
           style-src 'self' 'unsafe-inline';"
/>
```

## Boas Práticas Gerais

### ✅ Faça
- Use HTTPS para APIs externas
- Valide todos os dados do usuário
- Use tokens JWT com expiração
- Implemente rate limiting
- Mantenha Electron e dependências atualizadas
- Revise o código regularmente
- Use variáveis de ambiente para secrets

### ❌ Não Faça
- Não exponha o objeto Electron inteiro
- Não use `eval()` ou `Function()` com dados do usuário
- Não armazene secrets no código-fonte
- Não desabilite sandbox
- Não use `nodeIntegration: true`
- Não envie dados sensíveis em plain text

## Auditoria de Segurança

Para verificar vulnerabilidades nas dependências:

```bash
npm audit
npm audit fix
```

## Atualizações

Mantenha as dependências atualizadas:

```bash
npm update
npm outdated
```

## Referências

- [Electron Security Checklist](https://www.electronjs.org/docs/tutorial/security)
- [OWASP Security Guidelines](https://owasp.org/)
- [Secure Coding Practices](https://cwe.mitre.org/)

---

**Segurança é uma responsabilidade contínua. Revise este documento regularmente.**
