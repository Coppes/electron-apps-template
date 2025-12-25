import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
export const CommandContext = createContext({
    commands: [],
    registerCommand: () => { },
    unregisterCommand: () => { },
    isOpen: false,
    setIsOpen: () => { },
    toggle: () => { },
});
export const useCommandContext = () => useContext(CommandContext);
export const CommandProvider = ({ children }) => {
    const [commands, setCommands] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const registerCommand = useCallback((command) => {
        setCommands((prev) => {
            // Remove existing with same id if any
            const filtered = prev.filter((c) => c.id !== command.id);
            return [...filtered, command];
        });
    }, []);
    const unregisterCommand = useCallback((id) => {
        setCommands((prev) => prev.filter((c) => c.id !== id));
    }, []);
    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
    return (_jsx(CommandContext.Provider, { value: {
            commands,
            registerCommand,
            unregisterCommand,
            isOpen,
            setIsOpen,
            toggle,
        }, children: children }));
};
CommandProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
