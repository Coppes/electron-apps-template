import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Separator from '../components/ui/Separator';
import { useTranslation } from 'react-i18next';
const AboutPage = () => {
    const { t } = useTranslation('common');
    const [versionInfo, setVersionInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const loadVersionInfo = async () => {
            try {
                if (window.electronAPI?.app) {
                    const info = await window.electronAPI.app.getVersion();
                    setVersionInfo(info);
                }
            }
            catch (error) {
                // eslint-disable-next-line no-console
                console.error('Error loading version info:', error);
            }
            finally {
                setLoading(false);
            }
        };
        loadVersionInfo();
    }, []);
    return (_jsxs("div", { className: "p-8 max-w-4xl mx-auto", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold", children: t('about.title') }), _jsx("p", { className: "text-muted-foreground mt-2", children: t('about.subtitle') })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('about.template_title') }), _jsx(CardDescription, { children: t('about.template_desc') })] }), _jsx(CardContent, { children: loading ? (_jsx("p", { className: "text-muted-foreground", children: t('about.loading') })) : versionInfo ? (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-medium", children: t('about.app_version') }), _jsx("span", { className: "text-muted-foreground", children: versionInfo.app })] }), _jsx(Separator, {}), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-medium", children: "Electron" }), _jsx("span", { className: "text-muted-foreground", children: versionInfo.electron })] }), _jsx(Separator, {}), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-medium", children: "Chrome" }), _jsx("span", { className: "text-muted-foreground", children: versionInfo.chrome })] }), _jsx(Separator, {}), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-medium", children: "Node.js" }), _jsx("span", { className: "text-muted-foreground", children: versionInfo.node })] }), _jsx(Separator, {}), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-medium", children: "V8" }), _jsx("span", { className: "text-muted-foreground", children: versionInfo.v8 })] })] })) : (_jsx("p", { className: "text-red-600", children: t('about.error') })) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('about.features.title') }), _jsx(CardDescription, { children: t('about.features.description') })] }), _jsx(CardContent, { children: _jsxs("ul", { className: "space-y-2", children: [_jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2", children: "\u2713" }), _jsx("span", { children: t('about.features.ipc') })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2", children: "\u2713" }), _jsx("span", { children: t('about.features.context') })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2", children: "\u2713" }), _jsx("span", { children: t('about.features.react') })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2", children: "\u2713" }), _jsx("span", { children: t('about.features.ui') })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2", children: "\u2713" }), _jsx("span", { children: t('about.features.settings') })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2", children: "\u2713" }), _jsx("span", { children: t('about.features.dialog') })] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "mr-2", children: "\u2713" }), _jsx("span", { children: t('about.features.layout') })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('about.license.title') }) }), _jsx(CardContent, { children: _jsx("p", { className: "text-sm text-muted-foreground", children: t('about.license.text') }) })] })] })] }));
};
export default AboutPage;
