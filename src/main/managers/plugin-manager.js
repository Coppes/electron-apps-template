import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';
import { logger } from '../logger.ts';
import { isDevelopment } from '../config.ts';
class PluginManager {
    constructor() {
        this.pluginsDir = path.join(app.getPath('userData'), 'plugins');
        // Using process.cwd() might point to project root in dev
        this.devPluginsDir = path.join(process.cwd(), 'plugins');
        this.plugins = [];
    }
    async init() {
        try {
            // Ensure plugins directory exists
            await fs.mkdir(this.pluginsDir, { recursive: true });
        }
        catch (error) {
            logger.error('Failed to create plugins directory', error);
        }
    }
    async getAllPlugins() {
        try {
            const dirs = [this.pluginsDir];
            if (isDevelopment()) {
                dirs.push(this.devPluginsDir);
            }
            const loadedPlugins = [];
            for (const dir of dirs) {
                let files = [];
                try {
                    files = await fs.readdir(dir);
                }
                catch (e) {
                    // Ignore missing dirs (especially dev)
                    continue;
                }
                const jsFiles = files.filter(f => f.endsWith('.ts'));
                for (const file of jsFiles) {
                    try {
                        const content = await fs.readFile(path.join(dir, file), 'utf-8');
                        loadedPlugins.push({
                            filename: file,
                            content: content
                        });
                    }
                    catch (err) {
                        logger.error(`Failed to load plugin ${file} from ${dir}`, err);
                    }
                }
            }
            this.plugins = loadedPlugins;
            return this.plugins;
        }
        catch (error) {
            logger.error('Failed to scan plugins', error);
            return [];
        }
    }
}
export const pluginManager = new PluginManager();
