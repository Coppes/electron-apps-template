import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Select from './Select';
export default {
    title: 'UI/Select',
    component: Select,
    tags: ['autodocs'],
};
export const Default = {
    render: (args) => (_jsxs(Select, { ...args, children: [_jsx("option", { value: "", children: "Select an option..." }), _jsx("option", { value: "1", children: "Option 1" }), _jsx("option", { value: "2", children: "Option 2" }), _jsx("option", { value: "3", children: "Option 3" })] })),
};
export const Disabled = {
    render: (args) => (_jsxs(Select, { ...args, disabled: true, children: [_jsx("option", { value: "", children: "Select an option..." }), _jsx("option", { value: "1", children: "Option 1" })] })),
};
