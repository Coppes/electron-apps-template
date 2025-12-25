import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTab } from '../hooks/useTab';
import { useSettings } from '../contexts/SettingsContext';
import { useShortcutContext } from '../contexts/ShortcutContext';
import { useHistory } from '../contexts/HistoryContext';
import Button from '../components/ui/Button';
import Switch from '../components/ui/Switch';
import Label from '../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { cn } from '../utils/cn';
import { Monitor, Sun, Moon, SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react';
import ThemeEditor from '../components/ThemeEditor';
const SettingsPage = () => {
    const { settings, updateSetting, loading } = useSettings();
    const { userOverrides, importOverrides } = useShortcutContext();
    const { execute, undo, redo, canUndo, canRedo } = useHistory();
    const { t } = useTranslation(['settings', 'common']);
    const { openTab } = useTab();
    const [saveMessage, setSaveMessage] = useState('');
    const [testText, setTestText] = useState("");
    // Sync testText if history actions affect it?
    // Actually, the `undo` and `redo` functions in handleTestChange call setTestText directly.
    // So the input *should* update if those functions are called.
    // The issue might be that Redo isn't calling `execute` properly or maintaining the closure state.
    // Debug toggle
    // useEffect(() => {
    //   console.log('Test Text Updated:', testText);
    // }, [testText]);
    if (loading) {
        return _jsx("div", { className: "p-6", children: t('loading') });
    }
    const changeLanguage = (lng) => {
        updateSetting('language', lng);
    };
    const handleExportSettings = async () => {
        try {
            // 1. Select save location
            const filePath = await window.electronAPI.dialog.showSaveDialog({
                defaultPath: 'settings-export.json',
                filters: [{ name: 'JSON', extensions: ['json'] }]
            });
            if (!filePath)
                return;
            // 2. Export data (including shortcuts)
            const exportData = {
                settings,
                shortcuts: userOverrides
            };
            const result = await window.electronAPI.data.export(filePath, exportData);
            if (result.success) {
                setSaveMessage(t('messages.export_success', { path: result.filePath }));
            }
            else {
                setSaveMessage(t('messages.export_fail', { error: result.error }));
            }
        }
        catch (error) {
            // console.error('Export error:', error);
            setSaveMessage(t('messages.export_error', { error: error.message }));
        }
        finally {
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };
    const handleImportSettings = async () => {
        try {
            // 1. Select file to import
            const filePath = await window.electronAPI.dialog.showOpenDialog({
                filters: [{ name: 'JSON', extensions: ['json'] }],
                properties: ['openFile']
            });
            if (!filePath)
                return;
            // 2. Import data
            const result = await window.electronAPI.data.import(filePath, {
                format: 'json'
            });
            if (result.success && result.data) {
                let importedCount = 0;
                // Import settings
                if (result.data.settings) {
                    // Flatten/iterate settings to update context
                    // Note context doesn't expose bulk update yet, so we iterate known keys or recursive
                    // Just handling top level for now or specific keys we know of effectively
                    // Improvements: Add bulkUpdate to SettingsContext
                    // For now, let's just blindly update the structure
                    Object.keys(result.data.settings).forEach(section => {
                        if (typeof result.data.settings[section] === 'object') {
                            Object.keys(result.data.settings[section]).forEach(key => {
                                updateSetting(`${section}.${key} `, result.data.settings[section][key]);
                            });
                        }
                        else {
                            updateSetting(section, result.data.settings[section]);
                        }
                    });
                    importedCount++;
                }
                // Import shortcuts
                if (result.data.shortcuts) {
                    await importOverrides(result.data.shortcuts);
                    importedCount++;
                }
                if (importedCount > 0) {
                    setSaveMessage(t('messages.import_success'));
                }
                else {
                    setSaveMessage(t('messages.import_fail'));
                }
            }
        }
        catch (error) {
            // console.error('Import error:', error);
            setSaveMessage(t('messages.import_error', { error: error.message }));
        }
        finally {
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };
    const handleTestChange = (e) => {
        const newValue = e.target.value;
        const oldValue = testText; // Capture current state in closure
        // Use execute to create undoable action
        execute({
            execute: () => {
                setTestText(newValue);
            },
            undo: () => {
                setTestText(oldValue);
            },
            label: `Type "${newValue}"`
        });
    };
    return (_jsxs("div", { className: "p-6 max-w-4xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h1", { className: "text-3xl font-bold", children: t('title', 'Settings') }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: handleImportSettings, variant: "outline", children: t('import') }), _jsx(Button, { onClick: handleExportSettings, variant: "outline", children: t('export') })] })] }), saveMessage && (_jsx("div", { className: cn('p-3 rounded text-sm font-medium', saveMessage.startsWith('✓') ? 'bg-green-100 text-green-800' :
                    saveMessage.startsWith('⚠') ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'), children: saveMessage })), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('appearance.title', 'Appearance') }), _jsx(CardDescription, { children: t('appearance.description', 'Customize the look and feel.') })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: t('appearance.theme', 'Theme') }), _jsxs("div", { className: "flex gap-1 bg-muted p-1 rounded-lg", children: [_jsxs(Button, { size: "sm", variant: settings.appearance.theme === 'system' ? 'default' : 'ghost', onClick: () => updateSetting('appearance.theme', 'system'), title: "Follow System", children: [_jsx(Monitor, { className: "h-4 w-4" }), " System"] }), _jsxs(Button, { size: "sm", variant: settings.appearance.theme === 'light' ? 'default' : 'ghost', onClick: () => updateSetting('appearance.theme', 'light'), title: "Light Mode", children: [_jsx(Sun, { className: "h-4 w-4" }), " Light"] }), _jsxs(Button, { size: "sm", variant: settings.appearance.theme === 'dark' ? 'default' : 'ghost', onClick: () => updateSetting('appearance.theme', 'dark'), title: "Dark Mode", children: [_jsx(Moon, { className: "h-4 w-4" }), " Dark"] })] })] }), _jsx("div", { className: "mt-6 pt-4 border-t border-border", children: _jsx(ThemeEditor, {}) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Audio & Sound" }), _jsx(CardDescription, { children: "Manage sound effects and volume." })] }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [settings.audio?.muted ? _jsx(SpeakerSlash, { className: "w-5 h-5" }) : _jsx(SpeakerHigh, { className: "w-5 h-5" }), _jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { children: "Mute All Sounds" }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Disable all application sound effects" })] })] }), _jsx(Switch, { checked: settings.audio?.muted || false, onCheckedChange: (checked) => updateSetting('audio', { ...settings.audio, muted: checked }) })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('language.title', 'Language') }), _jsx(CardDescription, { children: t('language.description', 'Select display language.') })] }), _jsx(CardContent, { children: _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: settings.language === 'en' ? 'default' : 'outline', onClick: () => changeLanguage('en'), children: "English" }), _jsx(Button, { variant: settings.language === 'pt-BR' ? 'default' : 'outline', onClick: () => changeLanguage('pt-BR'), children: "Portugu\u00EAs (Brasil)" })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('history.title', 'History & Undo') }), _jsx(CardDescription, { children: t('history.description', 'Manage undo/redo limits and test functionality.') })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { children: t('history.max_undo_steps', 'Max Undo Steps') }), _jsx("div", { className: "text-sm text-muted-foreground", children: t('history.max_undo_help', 'Maximum number of actions to keep in history') })] }), _jsx("input", { type: "number", className: "w-20 p-2 border rounded bg-background", value: settings.history?.maxStackSize || 50, onChange: (e) => updateSetting('history.maxStackSize', parseInt(e.target.value) || 50) })] }), _jsxs("div", { className: "p-4 border rounded-lg bg-muted/20 space-y-3", children: [_jsx("h4", { className: "text-sm font-semibold", children: t('history.test_zone', 'Test Zone') }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: undo, disabled: !canUndo, variant: "outline", size: "sm", children: [t('history.undo', 'Undo'), " (Cmd+Z)"] }), _jsxs(Button, { onClick: redo, disabled: !canRedo, variant: "outline", size: "sm", children: [t('history.redo', 'Redo'), " (Cmd+Shift+Z)"] })] }), _jsx("input", { className: "w-full p-2 border rounded bg-background", value: testText, onChange: handleTestChange, placeholder: t('history.type_here', 'Type here then Undo/Redo...') }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [t('history.history_stack', 'History Stack'), ": ", canUndo ? t('history.has_items', 'Has items') : t('history.empty', 'Empty'), " | ", t('history.future_stack', 'Future Stack'), ": ", canRedo ? t('history.has_items', 'Has items') : t('history.empty', 'Empty')] })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('shortcuts.title', 'Keyboard Shortcuts') }), _jsx(CardDescription, { children: t('shortcuts.description', 'View and customize keyboard shortcuts.') })] }), _jsx(CardContent, { children: _jsx(Button, { onClick: () => openTab({ id: 'shortcuts', title: 'Shortcuts', type: 'shortcuts' }), children: t('shortcuts.view') }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('system.title', 'System') }), _jsx(CardDescription, { children: t('system.description', 'System configurations.') })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { children: t('system.notifications') }), _jsx("div", { className: "text-sm text-muted-foreground", children: t('system.notifications_desc') })] }), _jsx(Switch, { checked: settings.notifications, onCheckedChange: (checked) => updateSetting('notifications', checked) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { children: t('system.autostart') }), _jsx("div", { className: "text-sm text-muted-foreground", children: t('system.autostart_desc') })] }), _jsx(Switch, { checked: settings.autoStart, onCheckedChange: (checked) => updateSetting('autoStart', checked) })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('about.title', 'About') }) }), _jsx(CardContent, { children: _jsxs("p", { className: "text-sm text-muted-foreground", children: [t('common:version'), " 1.0.0"] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Development Tools" }), _jsx(CardDescription, { children: "Helpers for testing and debugging." })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { children: "Reset \"What's New\"" }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Force the \"What's New\" modal to appear on next restart." })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: async () => {
                                        if (window.electronAPI?.store) {
                                            await window.electronAPI.store.set('pendingWhatsNew', '1.0.0-test');
                                            alert("Flag set! Restart the app to see the modal.");
                                        }
                                    }, children: "Reset Status" })] }) })] })] }));
};
export default SettingsPage;
