import React from 'react';
import AppShell from './components/layout/AppShell';
import HomePage from './components/pages/HomePage';
import DemoPage from './components/pages/DemoPage';
import SettingsPage from './components/pages/SettingsPage';
import AboutPage from './components/pages/AboutPage';

function App() {
  return (
    <AppShell>
      {(currentPage) => {
        switch (currentPage) {
          case 'home':
            return <HomePage />;
          case 'demo':
            return <DemoPage />;
          case 'settings':
            return <SettingsPage />;
          case 'about':
            return <AboutPage />;
          default:
            return <HomePage />;
        }
      }}
    </AppShell>
  );
}

export default App;
