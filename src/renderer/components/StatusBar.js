import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext } from 'react';
import { StatusBarContext } from '../contexts/StatusBarContext';
import { cn } from '../utils/cn.ts';
const StatusBar = () => {
    const { items } = useContext(StatusBarContext);
    const leftItems = items
        .filter((item) => item.position === 'left')
        .sort((a, b) => (b.priority || 0) - (a.priority || 0));
    const centerItems = items
        .filter((item) => item.position === 'center')
        .sort((a, b) => (b.priority || 0) - (a.priority || 0));
    const rightItems = items
        .filter((item) => !item.position || item.position === 'right')
        .sort((a, b) => (b.priority || 0) - (a.priority || 0));
    return (_jsxs("div", { className: "h-6 bg-primary text-primary-foreground flex items-center justify-between px-2 text-xs select-none border-t border-border/20", children: [_jsx("div", { className: "flex items-center gap-4 min-w-[30%]", children: leftItems.map((item) => (_jsx("div", { className: cn("flex items-center", item.className), children: item.content }, item.id))) }), _jsx("div", { className: "flex items-center gap-4 justify-center min-w-[30%]", children: centerItems.map((item) => (_jsx("div", { className: cn("flex items-center", item.className), children: item.content }, item.id))) }), _jsx("div", { className: "flex items-center gap-4 justify-end min-w-[30%]", children: rightItems.map((item) => (_jsx("div", { className: cn("flex items-center", item.className), children: item.content }, item.id))) })] }));
};
export default StatusBar;
