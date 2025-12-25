import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, } from './Card';
import Button from './Button';
import Input from './Input';
import Label from './Label';
export default {
    title: 'UI/Card',
    component: Card,
    tags: ['autodocs'],
};
export const Default = {
    render: (args) => (_jsxs(Card, { className: "w-[350px]", ...args, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Create project" }), _jsx(CardDescription, { children: "Deploy your new project in one-click." })] }), _jsx(CardContent, { children: _jsx("div", { className: "grid w-full items-center gap-4", children: _jsxs("div", { className: "flex flex-col space-y-1.5", children: [_jsx(Label, { htmlFor: "name", children: "Name" }), _jsx(Input, { id: "name", placeholder: "Name of your project" })] }) }) }), _jsxs(CardFooter, { className: "flex justify-between", children: [_jsx(Button, { variant: "outline", children: "Cancel" }), _jsx(Button, { children: "Deploy" })] })] })),
};
