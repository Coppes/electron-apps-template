import React from 'react';
export declare const StatusBarContext: React.Context<{
    items: any[];
    addItem: () => void;
    removeItem: () => void;
    updateItem: () => void;
}>;
export declare const StatusBarProvider: {
    ({ children }: {
        children: any;
    }): import("react/jsx-runtime").JSX.Element;
    propTypes: {
        children: any;
    };
};
