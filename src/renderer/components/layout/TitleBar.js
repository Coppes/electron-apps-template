import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import { WindowControls } from './WindowControls';
/**
 * Custom Title Bar Component
 * Handles platform-specific rendering (macOS vs Windows/Linux)
 */
import PropTypes from 'prop-types';
export function TitleBar({ className, children }) {
    const [platform, setPlatform] = useState('');
    useEffect(() => {
        const getPlatform = async () => {
            try {
                const p = await window.electronAPI.system.getPlatform();
                if (p && p.platform) {
                    setPlatform(p.platform);
                }
            }
            catch (err) {
                // console.error('Failed to get platform:', err);
            }
        };
        getPlatform();
    }, []);
    const isMacOS = platform === 'darwin';
    // Double-click to maximize/restore (Standard OS behavior)
    const handleDoubleClick = async () => {
        await window.electronAPI.window.maximize();
    };
    return (_jsxs("div", { className: cn("flex items-center justify-between w-full h-10 select-none bg-transparent absolute top-0 left-0 z-50", className), style: { WebkitAppRegion: 'drag' }, onDoubleClick: handleDoubleClick, children: [_jsxs("div", { className: "flex items-center h-full pl-4", children: [isMacOS && (
                    // Spacer for macOS traffic lights
                    _jsx("div", { className: "w-16 h-full" })), children] }), _jsx("div", { className: "flex items-center h-full pr-2", children: !isMacOS && platform !== '' && (_jsx(WindowControls, {})) })] }));
}
TitleBar.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node
};
