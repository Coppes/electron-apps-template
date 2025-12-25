import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import IPCDemo from '../components/demo/IPCDemo';
/**
 * IPCDemoPage
 * Page wrapper for IPC communication demonstration
 */
export default function IPCDemoPage() {
    const { t } = useTranslation('ipc');
    return (_jsxs("div", { className: "container mx-auto p-6 max-w-6xl", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold mb-2", children: t('title') }), _jsx("p", { className: "text-muted-foreground", children: t('description') })] }), _jsx(IPCDemo, {}), _jsxs("div", { className: "mt-8 p-4 bg-muted rounded-lg", children: [_jsx("h2", { className: "text-lg font-semibold mb-2", children: t('architecture.title') }), _jsx("p", { className: "text-sm text-muted-foreground mb-4", children: t('architecture.intro') }), _jsxs("ul", { className: "list-disc list-inside text-sm space-y-1 text-muted-foreground", children: [_jsx("li", { children: t('architecture.exposed') }), _jsx("li", { children: t('architecture.validation') }), _jsx("li", { children: t('architecture.error_handling') }), _jsx("li", { children: t('architecture.no_node') }), _jsx("li", { children: t('architecture.context') })] }), _jsx("h3", { className: "text-md font-semibold mt-4 mb-2", children: t('security.title') }), _jsxs("ul", { className: "list-disc list-inside text-sm space-y-1 text-muted-foreground", children: [_jsx("li", { children: t('security.no_exec') }), _jsx("li", { children: t('security.validate') }), _jsx("li", { children: t('security.allow_lists') }), _jsx("li", { children: t('security.errors') }), _jsx("li", { children: t('security.logging') })] })] })] }));
}
