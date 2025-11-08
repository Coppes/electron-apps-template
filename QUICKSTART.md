# Quick Start Guide

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development**
   ```bash
   npm start
   ```
   The app will open with Hot Module Replacement enabled.

3. **Navigate the app**
   - Use the sidebar to switch between pages
   - Try the Demo page to test file opening
   - Configure settings (they persist!)
   - Check About for version info

## Development Workflow

### Adding a New Page

1. Create the page component in `src/renderer/components/pages/`:
   ```jsx
   const MyPage = () => {
     return (
       <div className="p-8">
         <h1>My Page</h1>
       </div>
     );
   };
   export default MyPage;
   ```

2. Import and add to `App.jsx`:
   ```jsx
   import MyPage from './components/pages/MyPage';
   
   // In the switch statement:
   case 'mypage':
     return <MyPage />;
   ```

3. Add navigation button in `AppShell.jsx`:
   ```jsx
   <Button
     variant={currentPage === 'mypage' ? 'default' : 'ghost'}
     className="w-full justify-start"
     onClick={() => setCurrentPage('mypage')}
   >
     🎯 My Page
   </Button>
   ```

### Adding IPC Handlers

1. **Main process** (`src/main.js`):
   ```javascript
   ipcMain.handle('my-action', async (event, arg) => {
     // Perform action
     return { result: 'success' };
   });
   ```

2. **Preload script** (`src/preload.js`):
   ```javascript
   const electronAPI = {
     // ... existing APIs
     myAction: (arg) => ipcRenderer.invoke('my-action', arg),
   };
   ```

3. **Renderer** (React component):
   ```jsx
   const result = await window.electronAPI.myAction('argument');
   ```

### Using electron-store

Store data persistently:

```jsx
// Save
await window.electronAPI.store.set('key', value);

// Load
const value = await window.electronAPI.store.get('key');

// Delete
await window.electronAPI.store.delete('key');
```

### Using UI Components

```jsx
import Button from './components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card';
import Input from './components/ui/Input';
import Switch from './components/ui/Switch';

<Card>
  <CardHeader>
    <CardTitle>My Card</CardTitle>
  </CardHeader>
  <CardContent>
    <Input placeholder="Enter text..." />
    <Switch checked={enabled} onCheckedChange={setEnabled} />
    <Button onClick={handleClick}>Click me</Button>
  </CardContent>
</Card>
```

## Testing

```bash
# Run tests
npm test

# Watch mode
npm test -- --watch

# UI mode
npm run test:ui

# Coverage
npm run test:coverage
```

## Building

```bash
# Package for current OS
npm run package

# Create installers
npm run make
```

## Security Best Practices

1. **Never expose Node.js APIs directly to renderer**
   - Always use IPC with specific handlers
   - Validate all inputs in main process

2. **Keep preload script minimal**
   - Only expose necessary APIs
   - Use `contextBridge.exposeInMainWorld`

3. **Validate external content**
   - Use CSP headers
   - Sanitize user inputs
   - Don't load remote content without validation

## Troubleshooting

### App won't start
- Check `npm install` completed successfully
- Clear cache: `rm -rf node_modules/.cache`
- Check for port conflicts (default: 3000)

### IPC not working
- Verify handler is registered in `main.js`
- Check preload script exposes the API
- Confirm `window.electronAPI` exists in renderer

### Styles not applying
- Check Tailwind classes are spelled correctly
- Verify `globals.css` is imported
- Clear webpack cache

## Resources

- [Electron Security](https://www.electronjs.org/docs/tutorial/security)
- [IPC Communication](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [Packaging Apps](https://www.electronforge.io/core-concepts/build-lifecycle)
- [React Hooks](https://react.dev/reference/react)
- [Tailwind Docs](https://tailwindcss.com/docs)
