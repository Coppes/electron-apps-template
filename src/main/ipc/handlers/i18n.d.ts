import { IPC_CHANNELS } from '../../../common/constants.ts';
/**
 * Handle set language request
 * @param {Object} event - IPC event
 * @param {Object} payload - { language }
 */
declare function handleSetLanguage(event: any, { language }: {
    language: any;
}): Promise<{
    success: boolean;
}>;
/**
 * Handle get language request
 */
declare function handleGetLanguage(): Promise<{
    success: boolean;
}>;
export declare const i18nHandlers: {
    [IPC_CHANNELS.I18N_SET_LANGUAGE]: typeof handleSetLanguage;
    [IPC_CHANNELS.I18N_GET_LANGUAGE]: typeof handleGetLanguage;
};
export {};
