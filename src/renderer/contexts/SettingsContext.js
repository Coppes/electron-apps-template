import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
const SettingsContext = createContext(null);
export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        appearance: { theme: 'system', density: 'normal' },
        history: { maxStackSize: 50 },
        language: 'en',
        notifications: true,
        autoStart: false,
        hasCompletedTour: false,
        audio: { muted: false, volume: 100 },
        customThemes: {}
    });
    const [loading, setLoading] = useState(true);
    const { i18n } = useTranslation();
    // Load settings on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                if (window.electronAPI?.store) {
                    // Flattened/merged load logic to support potentially mixed legacy/new keys
                    // But our store definition now defaults to the structured schema.
                    // Let's just get the whole object? electron-store 'get' without args returns valid config?
                    // Or we get specific keys.
                    // Let's try to get all known keys.
                    const savedApp = await window.electronAPI.store.get('appearance') || { theme: 'system', density: 'normal' };
                    const savedHist = await window.electronAPI.store.get('history') || { maxStackSize: 50 };
                    const savedLang = await window.electronAPI.store.get('language') || 'en';
                    const savedNotif = await window.electronAPI.store.get('notifications');
                    const savedAuto = await window.electronAPI.store.get('autoStart');
                    const savedTour = await window.electronAPI.store.get('hasCompletedTour');
                    const savedAudio = await window.electronAPI.store.get('audio');
                    const savedCustomThemes = await window.electronAPI.store.get('customThemes');
                    // Legacy support (if migration didn't run or verify)
                    const legacyTheme = await window.electronAPI.store.get('theme');
                    setSettings({
                        appearance: legacyTheme ? { ...savedApp, theme: legacyTheme } : savedApp,
                        history: savedHist,
                        language: savedLang,
                        notifications: savedNotif ?? true,
                        autoStart: savedAuto ?? false,
                        hasCompletedTour: savedTour ?? false,
                        audio: savedAudio || { muted: false, volume: 100 },
                        customThemes: savedCustomThemes || {}
                    });
                    // Sync i18n
                    if (savedLang && savedLang !== i18n.language) {
                        i18n.changeLanguage(savedLang);
                    }
                }
            }
            catch (err) {
                // console.error('Failed to load settings:', err);
            }
            finally {
                setLoading(false);
            }
        };
        loadSettings();
        // Listen for remote changes
        let cleanupListener = () => { };
        if (window.electronAPI?.store?.onStoreChanged) {
            cleanupListener = window.electronAPI.store.onStoreChanged(() => {
                loadSettings();
            });
        }
        return () => {
            cleanupListener();
        };
    }, [i18n]);
    // Apply Theme
    useEffect(() => {
        const theme = settings.appearance?.theme || 'system';
        const root = document.documentElement;
        const applyTheme = (t) => {
            // Clear custom properties
            const cssVars = [
                '--background', '--foreground', '--card', '--card-foreground',
                '--popover', '--popover-foreground', '--primary', '--primary-foreground',
                '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
                '--accent', '--accent-foreground', '--destructive', '--destructive-foreground',
                '--border', '--input', '--ring'
            ];
            cssVars.forEach(v => root.style.removeProperty(v));
            if (['light', 'dark', 'system'].includes(t)) {
                const isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                root.classList.toggle('dark', isDark);
            }
            else {
                // Custom theme
                const customTheme = settings.customThemes?.[t];
                if (customTheme && customTheme.colors) {
                    Object.entries(customTheme.colors).forEach(([key, val]) => {
                        root.style.setProperty(key, val);
                    });
                    // Ensure dark mode class is handled if custom theme specifies a base
                    // For now, let's assume custom themes handle their own contrast or we default to light base?
                    // removing 'dark' class to let CSS vars take over completely on top of light base
                    root.classList.remove('dark');
                }
            }
        };
        applyTheme(theme);
        // Listen for system changes if system
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = () => applyTheme('system');
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, [settings.appearance, settings.customThemes]);
    const updateSetting = async (path, value) => {
        // path could be 'appearance.theme' or 'notifications'
        setSettings(prev => {
            // Deep update helper needed? Or just handle 1-level deep for now.
            const keys = path.split('.');
            if (keys.length === 1) {
                return { ...prev, [path]: value };
            }
            if (keys.length === 2) {
                return {
                    ...prev,
                    [keys[0]]: {
                        ...prev[keys[0]],
                        [keys[1]]: value
                    }
                };
            }
            return prev;
        });
        try {
            if (window.electronAPI?.store) {
                await window.electronAPI.store.set(path, value);
                // Side effects
                if (path === 'language') {
                    i18n.changeLanguage(value);
                }
            }
        }
        catch (err) {
            // console.error('Failed to persist setting:', path, err);
        }
    };
    return (_jsx(SettingsContext.Provider, { value: { settings, updateSetting, loading }, children: children }));
};
SettingsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
