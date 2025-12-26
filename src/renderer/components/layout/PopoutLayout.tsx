import React from 'react';
import PropTypes from 'prop-types';
import TabBar from '../TabBar';
import TabContent from '../TabContent';
import { TitleBar } from './TitleBar';

const PopoutLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen w-screen bg-background text-foreground flex flex-col overflow-hidden">
      <TitleBar className="relative bg-background border-b border-border" />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <TabBar group="primary" />
        <main className="flex-1 relative overflow-hidden">
          <TabContent group="primary" />
        </main>
      </div>
    </div>
  );
};

PopoutLayout.propTypes = {
  children: PropTypes.node
};

export default PopoutLayout;
