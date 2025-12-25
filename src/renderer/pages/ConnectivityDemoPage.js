import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import ConnectivityDemo from '../components/demo/ConnectivityDemo';
/**
 * ConnectivityDemoPage
 * Page wrapper for connectivity and sync queue demonstration
 */
export default function ConnectivityDemoPage() {
    const { t } = useTranslation('connectivity');
    return (_jsxs("div", { className: "container mx-auto p-6 max-w-6xl", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold mb-2", children: t('title') }), _jsx("p", { className: "text-muted-foreground", children: t('description') })] }), _jsx(ConnectivityDemo, {}), _jsxs("div", { className: "mt-8 p-4 bg-muted rounded-lg", children: [_jsx("h2", { className: "text-lg font-semibold mb-2", children: t('features.title') }), _jsx("p", { className: "text-sm text-muted-foreground mb-4", children: t('features.intro') }), _jsxs("ul", { className: "list-disc list-inside text-sm space-y-1 text-muted-foreground", children: [_jsx("li", { children: t('features.queue') }), _jsx("li", { children: t('features.retry') }), _jsx("li", { children: t('features.persist') }), _jsx("li", { children: t('features.feedback') })] })] })] }));
}
