import React from 'react';
export declare const CommandContext: React.Context<{
    commands: any[];
    registerCommand: () => void;
    unregisterCommand: () => void;
    isOpen: boolean;
    setIsOpen: () => void;
    toggle: () => void;
}>;
export declare const useCommandContext: () => {
    commands: any[];
    registerCommand: () => void;
    unregisterCommand: () => void;
    isOpen: boolean;
    setIsOpen: () => void;
    toggle: () => void;
};
export declare const CommandProvider: {
    ({ children }: {
        children: any;
    }): import("react/jsx-runtime").JSX.Element;
    propTypes: {
        children: any;
    };
};
