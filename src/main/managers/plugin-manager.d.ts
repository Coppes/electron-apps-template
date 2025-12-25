declare class PluginManager {
    constructor();
    init(): Promise<void>;
    getAllPlugins(): Promise<any>;
}
export declare const pluginManager: PluginManager;
export {};
