import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Minus, Square, X, Copy } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';
/**
 * Window controls component (Minimize, Maximize/Restore, Close)
 * Designed for Windows/Linux custom title bars
 */
import PropTypes from 'prop-types';
export function WindowControls({ className }) {
    const { t } = useTranslation('common');
    const [isMaximized, setIsMaximized] = useState(false);
    useEffect(() => {
        // Check initial state
        const checkState = async () => {
            try {
                const state = await window.electronAPI.window.getState();
                if (state)
                    setIsMaximized(state.isMaximized);
            }
            catch (err) {
                // console.error('Failed to get window state:', err);
            }
        };
        checkState();
        // In a real app, we might want to listen for window state change events from main process
        // For now, we update optimistic or based on user action interaction, 
        // but ideally we should listen to 'window:maximized' / 'window:unmaximized' events if available.
        // Since we don't have explicit events for this in preload yet, we rely on the action to update local state logic 
        // or polling. For simplicity in this template, we toggle state on click.
    }, []);
    const handleMinimize = async () => {
        await window.electronAPI.window.minimize();
    };
    const handleMaximize = async () => {
        const result = await window.electronAPI.window.maximize();
        if (result && typeof result.maximized === 'boolean') {
            setIsMaximized(result.maximized);
        }
        else {
            // Fallback toggle if no return
            setIsMaximized(!isMaximized);
        }
    };
    const handleClose = async () => {
        await window.electronAPI.window.close();
    };
    return (_jsxs("div", { className: cn("flex items-center h-full -mr-2", className), style: { WebkitAppRegion: 'no-drag' }, children: [_jsx("button", { onClick: handleMinimize, className: "h-full px-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none", title: t('window.controls.minimize'), children: _jsx(Minus, { size: 16, className: "text-gray-600 dark:text-gray-300" }) }), _jsx("button", { onClick: handleMaximize, className: "h-full px-4 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none", title: isMaximized ? t('window.controls.restore') : t('window.controls.maximize'), children: isMaximized ? (_jsx(Copy, { size: 16, className: "text-gray-600 dark:text-gray-300" }) // Using Copy as "Restore" look-alike or separate Restore icon
                ) : (_jsx(Square, { size: 16, className: "text-gray-600 dark:text-gray-300" })) }), _jsx("button", { onClick: handleClose, className: "h-full px-4 hover:bg-red-500 hover:text-white transition-colors focus:outline-none group", title: t('window.controls.close'), children: _jsx(X, { size: 16, className: "text-gray-600 dark:text-gray-300 group-hover:text-white" }) })] }));
}
WindowControls.propTypes = {
    className: PropTypes.string
};
