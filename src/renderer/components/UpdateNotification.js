import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { X, CloudArrowDown, Sparkle } from '@phosphor-icons/react';
import Button from './ui/Button';
/**
 * Update Notification Component
 * Displays update status (available, downloading, ready) and actions.
 */
const UpdateNotification = ({ updateInfo, status, onInstall, onDismiss }) => {
    const { t } = useTranslation('common');
    if (!status)
        return null;
    const getIcon = () => {
        switch (status) {
            case 'available':
                return _jsx(Sparkle, { className: "w-5 h-5 text-primary" });
            case 'downloading':
                return _jsx(CloudArrowDown, { className: "w-5 h-5 text-primary animate-bounce" });
            case 'ready':
                return _jsx(Sparkle, { className: "w-5 h-5 text-green-500" });
            default:
                return _jsx(Sparkle, { className: "w-5 h-5" });
        }
    };
    const getTitle = () => {
        switch (status) {
            case 'available':
                return t('update.available_title', 'Update Available');
            case 'downloading':
                return t('update.downloading_title', 'Downloading Update...');
            case 'ready':
                return t('update.ready_title', 'Ready to Install');
            default:
                return '';
        }
    };
    const getDescription = () => {
        if (status === 'downloading')
            return '';
        return `v${updateInfo?.version || ''}`;
    };
    return (_jsxs("div", { className: "fixed top-4 right-4 z-50 w-80 bg-popover border border-border rounded-lg shadow-lg shadow-black/5 dark:shadow-black/20 p-4 animate-in slide-in-from-top-2 fade-in duration-300", children: [_jsx("button", { onClick: onDismiss, className: "absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors", "aria-label": t('common.close', 'Close'), title: t('common.close', 'Close'), children: _jsx(X, { className: "w-4 h-4" }) }), _jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: "mt-0.5 max-w-[20px] max-h-[20px]", children: getIcon() }), _jsxs("div", { className: "flex-1 space-y-1", children: [_jsx("h4", { className: "font-semibold text-sm leading-none", children: getTitle() }), getDescription() && (_jsx("p", { className: "text-xs text-muted-foreground", children: getDescription() })), _jsxs("div", { className: "pt-2 flex gap-2", children: [status === 'available' && (_jsx(Button, { size: "sm", onClick: onInstall, children: t('update.download', 'Download') })), status === 'ready' && (_jsx(Button, { size: "sm", onClick: onInstall, variant: "default", children: t('update.install_restart', 'Install & Restart') }))] })] })] })] }));
};
UpdateNotification.propTypes = {
    updateInfo: PropTypes.shape({
        version: PropTypes.string,
        releaseNotes: PropTypes.string,
    }),
    status: PropTypes.oneOf(['available', 'downloading', 'ready', null]),
    onInstall: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired,
};
export default UpdateNotification;
