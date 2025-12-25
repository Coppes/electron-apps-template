import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../contexts/SettingsContext';
import { useStatusBar } from './useStatusBar';
import { Globe } from '@phosphor-icons/react';
import * as ContextMenu from '../components/ui/ContextMenu';
/**
 * Updates the status bar with the current language.
 */
export function useLanguageStatus() {
    const { i18n } = useTranslation();
    const { updateSetting, settings } = useSettings();
    // Use settings as source of truth if available, fall back to i18n
    const currentLang = settings?.language || i18n.language;
    // No need for local state syncing listener if we rely on settings
    // But settings update is async. i18n might update faster.
    // actually SettingsContext syncs i18n. 
    const changeLanguage = (lng) => {
        updateSetting('language', lng);
    };
    /* eslint-disable-next-line react-hooks/preserve-manual-memoization */
    const languageItem = React.useMemo(() => ({
        id: 'language',
        content: (_jsxs(ContextMenu.ContextMenu, { children: [_jsx(ContextMenu.ContextMenuTrigger, { children: _jsxs("div", { className: "flex items-center gap-1.5 cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded", title: "Right click to change language", children: [_jsx(Globe, { className: "w-3 h-3" }), _jsx("span", { children: currentLang?.startsWith('pt') ? 'PT-BR' : 'EN' })] }) }), _jsx(ContextMenu.ContextMenuContent, { side: "top", align: "end", children: _jsxs(ContextMenu.ContextMenuRadioGroup, { value: currentLang, onValueChange: changeLanguage, children: [_jsx(ContextMenu.ContextMenuRadioItem, { value: "en", children: "English" }), _jsx(ContextMenu.ContextMenuRadioItem, { value: "pt-BR", children: "Portugu\u00EAs (Brasil)" })] }) })] })),
        position: 'right',
        priority: 20
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [currentLang, i18n]); // Added i18n to dep array for changeLanguage stability (though i18n instance is stable)
    useStatusBar(languageItem);
}
