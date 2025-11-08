import { useState, useEffect } from 'react';
import Demo from './components/Demo';

function App() {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    // Registra listener para updates de counter
    if (window.electronAPI?.onUpdateCounter) {
      const unsubscribe = window.electronAPI.onUpdateCounter((count) => {
        setCounter(count);
      });

      return unsubscribe;
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold">Electron + React Template</h1>
          <p className="text-muted-foreground mt-2">
            Um template boilerplate seguro e escalável para aplicações desktop
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Características</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ Context Isolation habilitado</li>
                <li>✓ Node Integration desabilitado</li>
                <li>✓ Segurança de primeira prioridade</li>
                <li>✓ shadcn/ui pré-configurado</li>
                <li>✓ Tailwind CSS integrado</li>
                <li>✓ ESLint + Vitest configurados</li>
              </ul>
            </section>
          </div>

          <div>
            <Demo />
          </div>
        </div>

        <section className="mt-12 p-6 bg-card border border-border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Informações do Sistema</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Electron API Status:</strong>{' '}
              {window.electronAPI ? '✓ Disponível' : '✗ Indisponível'}
            </p>
            <p>
              <strong>Counter (IPC):</strong> {counter}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
