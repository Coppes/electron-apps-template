import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Slider from './Slider';
import { useState } from 'react';
export default {
    title: 'UI/Slider',
    component: Slider,
    tags: ['autodocs'],
};
export const Default = {
    render: (args) => {
        const [value, setValue] = useState(50);
        return (_jsxs("div", { className: "w-[300px]", children: [_jsx(Slider, { value: value, onChange: setValue, ...args }), _jsxs("div", { className: "mt-2 text-sm text-muted-foreground", children: ["Value: ", value] })] }));
    },
};
export const MinMax = {
    render: (args) => {
        const [value, setValue] = useState(25);
        return (_jsxs("div", { className: "w-[300px]", children: [_jsx(Slider, { min: 0, max: 50, step: 5, value: value, onChange: setValue, ...args }), _jsxs("div", { className: "mt-2 text-sm text-muted-foreground", children: ["Value: ", value, " (0-50, step 5)"] })] }));
    },
};
