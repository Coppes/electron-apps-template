import React from 'react';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/cn';

const Tooltip = ({ children, content, side = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && content && (
        <div
          className={cn(
            'absolute z-50 px-3 py-1.5 text-sm text-white bg-gray-900 rounded-md shadow-md whitespace-nowrap pointer-events-none',
            positions[side]
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.node,
  side: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
};

export default Tooltip;
