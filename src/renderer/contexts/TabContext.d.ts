import React from 'react';
export declare const TabContext: React.Context<{
    tabs: any[];
    activeTabId: any;
    addTab: () => void;
    closeTab: () => void;
    setActiveTab: () => void;
    updateTab: () => void;
    resetTabs: () => void;
}>;
export declare const useTabContext: () => {
    tabs: any[];
    activeTabId: any;
    addTab: () => void;
    closeTab: () => void;
    setActiveTab: () => void;
    updateTab: () => void;
    resetTabs: () => void;
};
export declare const TabProvider: {
    ({ children }: {
        children: any;
    }): import("react/jsx-runtime").JSX.Element;
    propTypes: {
        children: any;
    };
};
