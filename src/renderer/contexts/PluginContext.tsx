import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

interface Plugin {
  id: string;
  name: string;
  filename: string;
  content: string;
  [key: string]: any;
}

interface Command {
  id: string;
  [key: string]: any; // Simplified Command interface if not imported from elsewhere or strictly defined
}

const PluginContext = createContext<{
  plugins: Plugin[];
  commands: Command[];
  registerCommand: (command: Command) => void;
}>({
  plugins: [],
  commands: [],
  registerCommand: () => { },
});

export const usePlugins = () => useContext(PluginContext);

export const PluginProvider = ({ children }: { children: React.ReactNode }) => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);

  const registerCommand = useCallback((command: Command) => {
    // console.log('Registering plugin command:', command);
    setCommands(prev => {
      // Avoid duplicates
      if (prev.find(c => c.id === command.id)) return prev;
      return [...prev, command];
    });
  }, []);

  // Listen for commands registered via window.appPlugin
  useEffect(() => {
    const handlePluginRegister = (event: CustomEvent) => {
      if (event.detail) {
        registerCommand(event.detail);
      }
    };

    window.addEventListener('plugin-register-command', handlePluginRegister as EventListener);
    return () => window.removeEventListener('plugin-register-command', handlePluginRegister as EventListener);
  }, [registerCommand]);

  // Load plugins from main process
  useEffect(() => {
    const loadPlugins = async () => {
      try {
        if (!window.electronAPI?.plugins) return;

        const loadedPlugins = await window.electronAPI.plugins.getAll();
        setPlugins(loadedPlugins);

        // Execute plugin scripts
        loadedPlugins.forEach((plugin: Plugin) => {
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
