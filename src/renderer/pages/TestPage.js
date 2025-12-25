import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useTranslation } from 'react-i18next';
/**
 * TestPage Component
 * General-purpose test playground for ad-hoc testing
 */
export default function TestPage() {
    const { t } = useTranslation('common');
    const [activeTab, setActiveTab] = useState('quick');
    const [inputValue, setInputValue] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const addResult = (type, message, data = null) => {
        const result = {
            id: Date.now(),
            type,
            message,
            data,
            timestamp: new Date().toISOString(),
        };
        setResults(prev => [result, ...prev].slice(0, 50)); // Keep last 50 results
    };
    const handleQuickTest = async () => {
        try {
            setLoading(true);
            addResult('info', `Testing: ${inputValue}`);
            // Example: test app version
            if (inputValue === 'version') {
                const version = await window.electronAPI.app.getVersion();
                addResult('success', 'App Version', version);
            }
            // Example: test storage
            else if (inputValue.startsWith('storage:')) {
                const key = inputValue.replace('storage:', '');
                const value = await window.electronAPI.storage.get(key);
                addResult('success', `Storage value for '${key}'`, value);
            }
            // Default: echo
            else {
                addResult('success', 'Echo', inputValue);
            }
        }
        catch (error) {
            addResult('error', error.message);
        }
        finally {
            setLoading(false);
        }
    };
    const handleClearResults = () => {
        setResults([]);
    };
    const tabs = [
        { id: 'quick', label: t('test_playground.tabs.quick') },
        { id: 'api', label: t('test_playground.tabs.api') },
        { id: 'console', label: t('test_playground.tabs.console') },
    ];
    return (_jsxs("div", { className: "container mx-auto p-6 max-w-6xl", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold mb-2", children: t('test_playground.title') }), _jsx("p", { className: "text-muted-foreground", children: t('test_playground.description') })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex gap-2 border-b border-border pb-2", children: tabs.map(tab => (_jsx(Button, { variant: activeTab === tab.id ? 'default' : 'ghost', onClick: () => setActiveTab(tab.id), children: tab.label }, tab.id))) }), activeTab === 'quick' && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('test_playground.quick.title') }), _jsx(CardDescription, { children: t('test_playground.quick.description') })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { placeholder: t('test_playground.quick.placeholder'), value: inputValue, onChange: (e) => setInputValue(e.target.value), onKeyPress: (e) => e.key === 'Enter' && handleQuickTest(), className: "flex-1" }), _jsx(Button, { onClick: handleQuickTest, disabled: loading || !inputValue, children: loading ? t('test_playground.quick.testing_btn') : t('test_playground.quick.test_btn') })] }), _jsx("div", { className: "flex gap-2", children: _jsx(Button, { variant: "outline", onClick: handleClearResults, children: t('test_playground.quick.clear_btn') }) })] })] })), activeTab === 'api' && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('test_playground.api.title') }), _jsx(CardDescription, { children: t('test_playground.api.description') })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: t('test_playground.api.hint') }), _jsx(Button, { variant: "outline", children: t('test_playground.api.go_ipc') })] })] })), activeTab === 'console' && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('test_playground.console.title') }), _jsx(CardDescription, { children: t('test_playground.console.description') })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: results.length === 0 ? (_jsx("p", { className: "text-muted-foreground text-sm", children: t('test_playground.console.no_results') })) : (results.map(result => (_jsxs("div", { className: `p-3 rounded border ${result.type === 'error' ? 'border-red-500 bg-red-50' :
                                            result.type === 'success' ? 'border-green-500 bg-green-50' :
                                                'border-border bg-muted'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsxs("span", { className: "font-semibold text-sm", children: [result.type === 'error' ? '❌' : result.type === 'success' ? '✅' : 'ℹ️', ' ', result.message] }), _jsx("span", { className: "text-xs text-muted-foreground", children: new Date(result.timestamp).toLocaleTimeString() })] }), result.data && (_jsx("pre", { className: "text-xs bg-background p-2 rounded mt-2 overflow-x-auto", children: typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2) }))] }, result.id)))) }) })] }))] })] }));
}
