import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Switch from './Switch';
import { useState } from 'react';
import Label from './Label';
export default {
    title: 'UI/Switch',
    component: Switch,
    tags: ['autodocs'],
};
export const Default = {
    render: (args) => {
        const [checked, setChecked] = useState(false);
        return _jsx(Switch, { checked: checked, onCheckedChange: setChecked, ...args });
    },
};
export const Checked = {
    render: (args) => {
        const [checked, setChecked] = useState(true);
        return _jsx(Switch, { checked: checked, onCheckedChange: setChecked, ...args });
    },
};
export const Disabled = {
    render: (args) => _jsx(Switch, { disabled: true, ...args }),
};
export const WithLabel = {
    render: (args) => {
        const [checked, setChecked] = useState(false);
        return (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { id: "airplane-mode", checked: checked, onCheckedChange: setChecked, ...args }), _jsx(Label, { htmlFor: "airplane-mode", children: "Airplane Mode" })] }));
    },
};
