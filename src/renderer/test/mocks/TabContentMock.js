import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTabContext } from '../../contexts/TabContext';
const TabContentMock = () => {
    const { activeTabId, tabs } = useTabContext();
    const activeTab = tabs.find(t => t.id === activeTabId);
    return (_jsxs("div", { "data-testid": "TabContent", children: ["Active Tab: ", activeTabId, activeTab && _jsx("div", { "data-testid": "tab-type", children: activeTab.type })] }));
};
export default TabContentMock;
