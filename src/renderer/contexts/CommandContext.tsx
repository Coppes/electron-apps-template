import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

export interface Command {
  id: string;
  [key: string]: any;
}

export const CommandContext = createContext<{
  commands: Command[];
  registerCommand: (command: Command) => void;
  unregisterCommand: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggle: () => void;
}>({
  commands: [],
  registerCommand: () => { },
  unregisterCommand: () => { },
  isOpen: false,
  setIsOpen: () => { },
  toggle: () => { },
});

export const useCommandContext = () => useContext(CommandContext);

export const CommandProvider = ({ children }: { children: React.ReactNode }) => {
  const [commands, setCommands] = useState<Command[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const registerCommand = useCallback((command: Command) => {
    setCommands((prev) => {
      // Remove existing with same id if any
      const filtered = prev.filter((c) => c.id !== command.id);
      return [...filtered, command];
    });
  }, []);

  const unregisterCommand = useCallback((id: string) => {
    setCommands((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <CommandContext.Provider
      value={{
        commands,
        registerCommand,
        unregisterCommand,
        isOpen,
        setIsOpen,
        toggle,
      }}
    >
      {children}
    </CommandContext.Provider>
  );
};

CommandProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
