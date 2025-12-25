import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PropTypes from 'prop-types';
import TabBar from '../TabBar';
import TabContent from '../TabContent';
import { TitleBar } from './TitleBar';
const PopoutLayout = ({ children }) => {
    return (_jsxs("div", { className: "h-screen w-screen bg-background text-foreground flex flex-col overflow-hidden", children: [_jsx(TitleBar, { className: "relative bg-background border-b border-border" }), _jsxs("div", { className: "flex flex-col flex-1 overflow-hidden min-w-0", children: [_jsx(TabBar, { group: "primary" }), _jsx("main", { className: "flex-1 relative overflow-hidden", children: _jsx(TabContent, { group: "primary" }) })] })] }));
};
PopoutLayout.propTypes = {
    children: PropTypes.node
};
export default PopoutLayout;
