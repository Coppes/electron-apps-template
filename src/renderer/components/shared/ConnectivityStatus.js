import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';
import { useStatusBar } from '../../hooks/useStatusBar';
import { CloudCheck, WifiSlash } from '@phosphor-icons/react';
/**
 * ConnectivityStatus Component
 * Displays network connectivity status in the global status bar
 */
export default function ConnectivityStatus() {
    const { t } = useTranslation('common');
    const { isOnline } = useOfflineStatus();
    const { update } = useStatusBar({
        id: 'connectivity-status',
        position: 'right',
        priority: 100,
        content: null,
    });
    useEffect(() => {
        update({
            content: (_jsx("div", { className: "flex items-center gap-2 px-2", title: isOnline ? t('status.online') : t('status.offline'), children: isOnline ? (_jsxs(_Fragment, { children: [_jsx(CloudCheck, { className: "w-3 h-3 text-green-300" }), _jsx("span", { className: "hidden sm:inline", children: t('status.online') })] })) : (_jsxs(_Fragment, { children: [_jsx(WifiSlash, { className: "w-3 h-3 text-red-300" }), _jsx("span", { className: "text-red-300 font-bold", children: t('status.offline') })] })) }))
        });
    }, [isOnline, update, t]);
    return null; // This component doesn't render anything itself, it injects into StatusBar
}
