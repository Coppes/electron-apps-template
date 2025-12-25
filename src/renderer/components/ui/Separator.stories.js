import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Separator from './Separator';
export default {
    title: 'UI/Separator',
    component: Separator,
    tags: ['autodocs'],
    argTypes: {
        orientation: {
            control: 'select',
            options: ['horizontal', 'vertical'],
        },
    },
};
export const Horizontal = {
    render: () => (_jsxs("div", { className: "w-[300px] bg-background border p-4 rounded text-foreground", children: [_jsx("h4", { className: "text-sm font-medium leading-none", children: "Radix Primitives" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "An open-source UI component library." }), _jsx(Separator, { className: "my-4" }), _jsxs("div", { className: "flex h-5 items-center space-x-4 text-sm", children: [_jsx("div", { children: "Blog" }), _jsx(Separator, { orientation: "vertical" }), _jsx("div", { children: "Docs" }), _jsx(Separator, { orientation: "vertical" }), _jsx("div", { children: "Source" })] })] })),
};
