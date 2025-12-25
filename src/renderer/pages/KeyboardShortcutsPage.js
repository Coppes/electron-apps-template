import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useShortcutContext } from '../contexts/ShortcutContext';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
// Simple key recorder component
const ShortcutRecorder = ({ value, onSave, onCancel, hasError }) => {
    const { t } = useTranslation('common');
    const [keys, setKeys] = useState(value || '');
    const [recording, setRecording] = useState(true);
    useEffect(() => {
        if (!recording)
            return;
        const handleKeyDown = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const pressed = [];
            if (e.ctrlKey)
                pressed.push('Ctrl');
            if (e.metaKey)
                pressed.push('Cmd');
            if (e.altKey)
                pressed.push('Alt');
            if (e.shiftKey)
                pressed.push('Shift');
            // Don't record only modifiers
            if (['Control', 'Meta', 'Alt', 'Shift'].includes(e.key)) {
                // just update display if needed, but here we wait for non-modifier
                return;
            }
            pressed.push(e.key.toUpperCase());
            const combo = pressed.join('+');
            setKeys(combo);
            setRecording(false); // Stop after one combo
            onSave(combo);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [recording, onSave]);
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { onClick: () => !recording && setRecording(true), className: `px-3 py-1 rounded border cursor-pointer select-none min-w-[100px] text-center
          ${hasError ? 'border-destructive text-destructive bg-destructive/10' : 'bg-muted border-input'}
          ${recording ? 'border-primary ring-1 ring-primary animate-pulse bg-background' : ''}
        `, title: hasError ? t('shortcuts.invalid') : t('shortcuts.record_tooltip'), children: recording ? t('shortcuts.press_keys') : (keys || t('shortcuts.press_keys')) }), _jsx(Button, { size: "sm", variant: "ghost", onClick: onCancel, children: t('shortcuts.cancel') })] }));
};
ShortcutRecorder.propTypes = {
    value: PropTypes.string,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    hasError: PropTypes.bool,
};
const KeyboardShortcutsPage = () => {
    const { t } = useTranslation('common');
    const { shortcuts, updateShortcut, resetToDefaults, userOverrides } = useShortcutContext();
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState(null);
    const handleUpdate = async (id, newKeys) => {
        try {
            await updateShortcut(id, newKeys);
            setEditingId(null);
            setError(null);
        }
        catch (err) {
            setError(err.message);
        }
    };
    return (_jsxs("div", { className: "p-8 max-w-4xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold", children: [t('nav.items.settings'), " / ", t('shortcuts.title')] }), _jsx("p", { className: "text-muted-foreground", children: t('shortcuts.subtitle') })] }), _jsx(Button, { variant: "outline", onClick: resetToDefaults, children: t('shortcuts.reset') })] }), error && (_jsx("div", { className: "bg-destructive/10 text-destructive p-3 rounded-md text-sm border border-destructive/20", children: error })), _jsx(Card, { children: _jsx(CardContent, { className: "p-0", children: _jsxs("div", { className: "divide-y divide-border", children: [shortcuts.map((shortcut) => {
                                const currentKeys = userOverrides[shortcut.id] || shortcut.keys;
                                const isEditing = editingId === shortcut.id;
                                return (_jsxs("div", { className: "flex items-center justify-between p-4 hover:bg-muted/50 transition-colors", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: shortcut.description || shortcut.id }), _jsx("div", { className: "text-xs text-muted-foreground font-mono", children: shortcut.id })] }), _jsx("div", { className: "flex items-center gap-4", children: isEditing ? (_jsx(ShortcutRecorder, { value: currentKeys, onSave: (k) => handleUpdate(shortcut.id, k), onCancel: () => { setEditingId(null); setError(null); }, hasError: !!error })) : (_jsx("button", { onClick: () => setEditingId(shortcut.id), className: "px-3 py-1 bg-secondary hover:bg-secondary/80 rounded border border-border text-sm font-mono min-w-[100px] text-center transition-colors", title: "Click to edit", children: currentKeys })) })] }, shortcut.id));
                            }), shortcuts.length === 0 && (_jsx("div", { className: "p-8 text-center text-muted-foreground", children: t('shortcuts.no_shortcuts') }))] }) }) })] }));
};
export default KeyboardShortcutsPage;
