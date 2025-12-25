import { jsx as _jsx } from "react/jsx-runtime";
import Tooltip from './Tooltip';
import Button from './Button';
export default {
    title: 'UI/Tooltip',
    component: Tooltip,
    tags: ['autodocs'],
    argTypes: {
        side: {
            control: 'select',
            options: ['top', 'bottom', 'left', 'right'],
        },
        content: {
            control: 'text',
        },
    },
};
export const Default = {
    args: {
        content: 'Add to library',
        side: 'top',
        children: _jsx(Button, { variant: "outline", children: "Hover me" }),
    },
};
export const Bottom = {
    args: {
        content: 'Tooltip on bottom',
        side: 'bottom',
        children: _jsx(Button, { variant: "outline", children: "Bottom" }),
    },
};
export const Left = {
    args: {
        content: 'Tooltip on left',
        side: 'left',
        children: _jsx(Button, { variant: "outline", children: "Left" }),
    },
};
export const Right = {
    args: {
        content: 'Tooltip on right',
        side: 'right',
        children: _jsx(Button, { variant: "outline", children: "Right" }),
    },
};
