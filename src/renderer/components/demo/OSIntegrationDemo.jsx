import { useState } from 'react';
import { Tray, Command, Pulse, Bell, Clock, Lightning, FileText } from '@phosphor-icons/react';
import TrayDemo from './TrayDemo';
import DockPowerDemo from './DockPowerDemo';
import ShortcutsDemo from './ShortcutsDemo';
import ProgressDemo from './ProgressDemo';
import NotificationsDemo from './NotificationsDemo';
import RecentDocsDemo from './RecentDocsDemo';
import FileAssociationsDemo from './FileAssociationsDemo';

/**
 * OSIntegrationDemo Component
 * Main demo showcasing all OS integration features with tabbed interface
 */
export default function OSIntegrationDemo() {
  const [activeTab, setActiveTab] = useState('tray');

  const tabs = [
    { id: 'tray', label: 'System Tray', icon: Tray, component: TrayDemo },
    { id: 'dock-power', label: 'Dock & Power', icon: Lightning, component: DockPowerDemo },
    { id: 'files', label: 'Files & Input', icon: FileText, component: FileAssociationsDemo },
    { id: 'shortcuts', label: 'Shortcuts', icon: Command, component: ShortcutsDemo },
    { id: 'progress', label: 'Progress & Badge', icon: Pulse, component: ProgressDemo },
    { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationsDemo },
    { id: 'recent', label: 'Recent Docs', icon: Clock, component: RecentDocsDemo }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fadeIn">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}
