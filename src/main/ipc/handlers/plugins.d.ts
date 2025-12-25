export declare function getPluginsHandler(): () => Promise<{
    success: boolean;
}>;
export declare function createPluginHandlers(): {
    'plugins:get-all': () => Promise<{
        success: boolean;
    }>;
};
