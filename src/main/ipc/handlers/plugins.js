import { pluginManager } from '../../managers/plugin-manager.js';
import { createSuccessResponse, createErrorResponse } from '../bridge.js';

export function getPluginsHandler() {
  return async () => {
    try {
      await pluginManager.init();
      const plugins = await pluginManager.getAllPlugins();
      return createSuccessResponse({ plugins });
    } catch (error) {
      return createErrorResponse(error.message, 'PLUGINS_GET_FAILED');
    }
  };
}

export function createPluginHandlers() {
  return {
    'plugins:get-all': getPluginsHandler()
  };
}
