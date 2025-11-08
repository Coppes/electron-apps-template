import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('deve renderizar o componente App sem erros', () => {
    render(<App />);

    expect(screen.getByText(/Electron \+ React Template/i)).toBeInTheDocument();
  });

  it('deve exibir o header com título', () => {
    render(<App />);

    const heading = screen.getByRole('heading', {
      name: /Electron \+ React Template/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it('deve exibir características da aplicação', () => {
    render(<App />);

    expect(screen.getByText(/Context Isolation habilitado/i)).toBeInTheDocument();
    expect(screen.getByText(/Node Integration desabilitado/i)).toBeInTheDocument();
    expect(screen.getByText(/shadcn\/ui pré-configurado/i)).toBeInTheDocument();
  });

  it('deve mostrar status da Electron API', () => {
    render(<App />);

    expect(screen.getByText(/Electron API Status:/i)).toBeInTheDocument();
  });

  it('deve renderizar a seção Demo', () => {
    render(<App />);

    const demoTitle = screen.getByText(/Demo - Electron IPC/i);
    expect(demoTitle).toBeInTheDocument();
  });
});
