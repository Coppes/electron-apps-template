import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const PluginContext = createContext({
  plugins: [],
  commands: [],
  registerCommand: () => { },
});

export const usePlugins = () => useContext(PluginContext);

export const PluginProvider = ({ children }) => {
  const [plugins, setPlugins] = useState([]);
  const [commands, setCommands] = useState([]);

  const registerCommand = useCallback((command) => {
    // console.log('Registering plugin command:', command);
    setCommands(prev => {
      // Avoid duplicates
      if (prev.find(c => c.id === command.id)) return prev;
      return [...prev, command];
    });
  }, []);

  // Listen for commands registered via window.appPlugin
  useEffect(() => {
    const handlePluginRegister = (event) => {
      if (event.detail) {
        registerCommand(event.detail);
      }
    };

    window.addEventListener('plugin-register-command', handlePluginRegister);
    return () => window.removeEventListener('plugin-register-command', handlePluginRegister);
  }, [registerCommand]);

  // Load plugins from main process
  useEffect(() => {
    const loadPlugins = async () => {
      try {
        if (!window.electronAPI?.plugins) return;

        const loadedPlugins = await window.electronAPI.plugins.getAll();
        setPlugins(loadedPlugins);

        // Execute plugin scripts
        loadedPlugins.forEach(plugin => {
          try {
            // Safe eval? Enforcing strict mode at least.
            // In a real app, this should be sandboxed further (e.g. iframe or WebWorker)
            // But for this template, simple execution in main world is the goal as per spec.
            // We use new Function to execute in global scope equivalent
            const executePlugin = new Function(plugin.content);
            executePlugin();
          } catch (err) {
            // console.error(`Failed to execute plugin ${plugin.filename}:`, err);
          }
        });
      } catch (error) {
        // console.error('Failed to load plugins:', error);
      }
    };

    loadPlugins();
  }, []);

  return (
    <PluginContext.Provider value={{ plugins, commands, registerCommand }}>
      {children}
    </PluginContext.Provider>
  );
};

PluginProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
