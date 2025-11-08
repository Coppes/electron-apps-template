import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('deve renderizar o componente App sem erros', () => {
    render(<App />);

    expect(screen.getByText(/Welcome to Electron Apps Template/i)).toBeInTheDocument();
  });

  it('deve exibir o header com título', () => {
    render(<App />);

    const heading = screen.getByRole('heading', {
      name: /Welcome to Electron Apps Template/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it('deve exibir características da aplicação', () => {
    render(<App />);

    expect(screen.getByText(/Context isolation enabled/i)).toBeInTheDocument();
    expect(screen.getByText(/Node integration disabled/i)).toBeInTheDocument();
    expect(screen.getByText(/shadcn\/ui component library/i)).toBeInTheDocument();
  });

  it('deve mostrar botões de navegação', () => {
    render(<App />);

    const homeButtons = screen.getAllByText(/🏠 Home/i);
    expect(homeButtons.length).toBeGreaterThan(0);
    
    const demoButtons = screen.getAllByText(/🔧 Demo/i);
    expect(demoButtons.length).toBeGreaterThan(0);
    
    const settingsButtons = screen.getAllByText(/⚙️ Settings/i);
    expect(settingsButtons.length).toBeGreaterThan(0);
    
    const aboutButtons = screen.getAllByText(/ℹ️ About/i);
    expect(aboutButtons.length).toBeGreaterThan(0);
  });

  it('deve renderizar a página inicial por padrão', () => {
    render(<App />);

    const heading = screen.getByText(/Welcome to Electron Apps Template/i);
    expect(heading).toBeInTheDocument();
  });
});
