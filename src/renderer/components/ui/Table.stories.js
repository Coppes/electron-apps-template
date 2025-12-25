import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from './Table';
export default {
    title: 'UI/Table',
    component: Table,
    tags: ['autodocs'],
};
export const Default = {
    render: (args) => (_jsxs(Table, { className: "max-w-[800px] border rounded-md", ...args, children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "w-[100px]", children: "Invoice" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Method" }), _jsx(TableHead, { className: "text-right", children: "Amount" })] }) }), _jsxs(TableBody, { children: [_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "INV001" }), _jsx(TableCell, { children: "Paid" }), _jsx(TableCell, { children: "Credit Card" }), _jsx(TableCell, { className: "text-right", children: "$250.00" })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "INV002" }), _jsx(TableCell, { children: "Pending" }), _jsx(TableCell, { children: "PayPal" }), _jsx(TableCell, { className: "text-right", children: "$150.00" })] }), _jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: "INV003" }), _jsx(TableCell, { children: "Unpaid" }), _jsx(TableCell, { children: "Bank Transfer" }), _jsx(TableCell, { className: "text-right", children: "$350.00" })] })] })] })),
};
