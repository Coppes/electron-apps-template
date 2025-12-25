import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Monitor, Cards, Chat, Lock, FloppyDisk } from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Separator from '../ui/Separator';
/**
 * IPCDemo Component
 * Demonstrates IPC communication patterns and APIs
 */
export default function IPCDemo() {
    const { t } = useTranslation('ipc');
    const [activeSection, setActiveSection] = useState('app');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [storageKey, setStorageKey] = useState('demo-key');
    const [storageValue, setStorageValue] = useState('demo-value');
    const callAPI = async (apiCall, description) => {
        try {
            setLoading(true);
            setResult({ type: 'loading', text: t('demo.result.loading', { desc: description }) });
            const data = await apiCall();
            setResult({ type: 'success', data, description });
        }
        catch (error) {
            setResult({ type: 'error', text: error.message, description });
        }
        finally {
            setLoading(false);
        }
    };
    const sections = [
        { id: 'app', label: t('demo.sections.app'), icon: Monitor },
        { id: 'window', label: t('demo.sections.window'), icon: Cards },
        { id: 'dialog', label: t('demo.sections.dialog'), icon: Chat },
        { id: 'storage', label: t('demo.sections.storage'), icon: Lock },
        { id: 'data', label: t('demo.sections.data'), icon: FloppyDisk },
    ];
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex gap-2 border-b border-border pb-2 flex-wrap", children: sections.map(section => {
                    const Icon = section.icon;
                    return (_jsxs(Button, { variant: activeSection === section.id ? 'default' : 'ghost', className: "gap-2", onClick: () => setActiveSection(section.id), children: [_jsx(Icon, { className: "w-4 h-4" }), section.label] }, section.id));
                }) }), result && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('demo.result.title', { desc: result.description }) }) }), _jsxs(CardContent, { children: [result.type === 'loading' && (_jsx("div", { className: "text-muted-foreground", children: result.text })), result.type === 'error' && (_jsx("div", { className: "text-red-600", children: t('demo.result.error', { error: result.text }) })), result.type === 'success' && (_jsx("pre", { className: "bg-muted p-3 rounded text-sm overflow-x-auto", children: JSON.stringify(result.data, null, 2) }))] })] })), activeSection === 'app' && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('demo.app.title') }), _jsx(CardDescription, { children: t('demo.app.description') })] }), _jsxs(CardContent, { className: "space-y-2", children: [_jsx(Button, { onClick: () => callAPI(() => window.electronAPI.app.getVersion(), t('demo.app.get_version')), disabled: loading, children: t('demo.app.get_version') }), _jsx(Button, { onClick: () => callAPI(() => window.electronAPI.app.getPath('userData'), t('demo.app.get_path')), disabled: loading, children: t('demo.app.get_path') }), _jsx(Button, { onClick: () => callAPI(() => window.electronAPI.app.getPlatform(), t('demo.app.get_platform')), disabled: loading, children: t('demo.app.get_platform') }), _jsx(Button, { onClick: () => callAPI(() => window.electronAPI.app.isPackaged(), t('demo.app.is_packaged')), disabled: loading, children: t('demo.app.is_packaged') })] })] })), activeSection === 'window' && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('demo.window.title') }), _jsx(CardDescription, { children: t('demo.window.description') })] }), _jsxs(CardContent, { className: "space-y-2", children: [_jsx(Button, { onClick: () => callAPI(async () => {
                                    await window.electronAPI.window.minimize();
                                    return { message: t('demo.window.msg_minimized') };
                                }, t('demo.window.minimize')), disabled: loading, children: t('demo.window.minimize') }), _jsx(Button, { onClick: () => callAPI(async () => {
                                    await window.electronAPI.window.toggleMaximize();
                                    return { message: t('demo.window.msg_maximized') };
                                }, t('demo.window.toggle_max')), disabled: loading, children: t('demo.window.toggle_max') }), _jsx(Button, { onClick: () => callAPI(() => window.electronAPI.window.getBounds(), t('demo.window.get_bounds')), disabled: loading, children: t('demo.window.get_bounds') }), _jsx(Button, { onClick: () => callAPI(() => window.electronAPI.window.getDisplay(), t('demo.window.get_display')), disabled: loading, children: t('demo.window.get_display') })] })] })), activeSection === 'dialog' && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('demo.dialog.title') }), _jsx(CardDescription, { children: t('demo.dialog.description') })] }), _jsxs(CardContent, { className: "space-y-2", children: [_jsx(Button, { onClick: () => callAPI(() => window.electronAPI.dialog.openFile({
                                    title: t('demo.dialog.select_file'),
                                    properties: ['openFile'],
                                }), t('demo.dialog.open_file')), disabled: loading, children: t('demo.dialog.open_file') }), _jsx(Button, { onClick: () => callAPI(() => window.electronAPI.dialog.openFolder({
                                    title: t('demo.dialog.select_folder'),
                                }), t('demo.dialog.open_folder')), disabled: loading, children: t('demo.dialog.open_folder') }), _jsx(Button, { onClick: () => callAPI(() => window.electronAPI.dialog.saveFile({
                                    title: t('demo.dialog.save_file_title'),
                                    defaultPath: 'document.txt',
                                }), t('demo.dialog.save_file')), disabled: loading, children: t('demo.dialog.save_file') })] })] })), activeSection === 'storage' && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('demo.storage.title') }), _jsx(CardDescription, { children: t('demo.storage.description') })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Input, { placeholder: t('demo.storage.key_placeholder'), value: storageKey, onChange: (e) => setStorageKey(e.target.value) }), _jsx(Input, { placeholder: t('demo.storage.value_placeholder'), value: storageValue, onChange: (e) => setStorageValue(e.target.value) })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-2", children: [_jsx(Button, { onClick: () => callAPI(() => window.electronAPI.store.set(storageKey, storageValue), t('demo.storage.action_set', { key: storageKey })), disabled: loading || !storageKey, children: t('demo.storage.set_val') }), _jsx(Button, { onClick: () => callAPI(() => window.electronAPI.store.get(storageKey), t('demo.storage.action_get', { key: storageKey })), disabled: loading || !storageKey, children: t('demo.storage.get_val') }), _jsx(Button, { onClick: () => callAPI(() => window.electronAPI.store.delete(storageKey), t('demo.storage.action_del', { key: storageKey })), disabled: loading || !storageKey, children: t('demo.storage.del_val') }), _jsx(Button, { onClick: () => callAPI(() => window.electronAPI.store.has(storageKey), t('demo.storage.action_has', { key: storageKey })), disabled: loading || !storageKey, children: t('demo.storage.check_exists') })] })] })] })), activeSection === 'data' && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('demo.data.title') }), _jsx(CardDescription, { children: t('demo.data.description') })] }), _jsxs(CardContent, { className: "space-y-2", children: [_jsx(Button, { onClick: () => callAPI(() => window.electronAPI.data.listBackups(), t('demo.data.list_backups')), disabled: loading, children: t('demo.data.list_backups') }), _jsx(Button, { onClick: () => callAPI(() => window.electronAPI.data.createBackup({ includeSecureStorage: false }), t('demo.data.create_backup')), disabled: loading, children: t('demo.data.create_backup') }), _jsx(Button, { onClick: () => callAPI(() => window.electronAPI.data.validateBackup({ filename: 'latest' }), t('demo.data.action_validate')), disabled: loading, children: t('demo.data.validate_backup') })] })] }))] }));
}
