import { store } from './store.ts';
import { logger } from '../../logger.ts';
import { createSuccessResponse, createErrorResponse } from '../bridge.ts';
import { IPC_CHANNELS } from '../../../common/constants.ts';

/**
 * Handle set language request
 * @param {Object} event - IPC event
 * @param {Object} payload - { language }
 */
async function handleSetLanguage(event, { language }) {
  try {
    store.set('settings.language', language);
    logger.info(`Language set to: ${language}`);
    return createSuccessResponse({ success: true });
  } catch (error) {
    logger.error('Failed to set language', error);
    return createErrorResponse(error.message);
  }
}

/**
 * Handle get language request
 */
async function handleGetLanguage() {
  try {
    const language = store.get('settings.language', 'en');
    return createSuccessResponse({ language });
  } catch (error) {
    logger.error('Failed to get language', error);
    return createErrorResponse(error.message);
  }
}

export const i18nHandlers = {
  [IPC_CHANNELS.I18N_SET_LANGUAGE]: handleSetLanguage,
  [IPC_CHANNELS.I18N_GET_LANGUAGE]: handleGetLanguage,
};
