import React from 'react';
import { useTabContext } from '../../contexts/TabContext';

const TabContentMock = () => {
  const { activeTabId, tabs } = useTabContext();
  const activeTab = tabs.find(t => t.id === activeTabId);
  return (
    <div data-testid="TabContent">
      Active Tab: {activeTabId}
      {activeTab && <div data-testid="tab-type">{activeTab.type}</div>}
    </div>
  );
};

export default TabContentMock;
