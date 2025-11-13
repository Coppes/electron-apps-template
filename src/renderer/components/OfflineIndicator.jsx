/**
 * OfflineIndicator Component
 * Visual indicator for network connectivity status
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useOfflineStatus } from '../hooks/useOfflineStatus';

/**
 * OfflineIndicator component
 */
export function OfflineIndicator({
  showWhenOnline = false,
  position = 'bottom-right',
  className = ''
}) {
  const { isOnline, isOffline } = useOfflineStatus();

  // Don't show if online and showWhenOnline is false
  if (isOnline && !showWhenOnline) {
    return null;
  }

  // Position classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const baseClasses = `
    fixed
    ${positionClasses[position]}
    px-4
    py-2
    rounded-lg
    shadow-lg
    flex
    items-center
    gap-2
    text-sm
    font-medium
    transition-all
    duration-300
    z-50
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const statusClasses = isOffline
    ? 'bg-red-500 text-white'
    : 'bg-green-500 text-white';

  return (
    <div className={`${baseClasses} ${statusClasses}`}>
      {/* Status dot */}
      <span
        className={`
          w-2
          h-2
          rounded-full
          ${isOffline ? 'bg-white animate-pulse' : 'bg-white'}
        `}
      />
      
      {/* Status text */}
      <span>
        {isOffline ? 'Offline' : 'Online'}
      </span>
    </div>
  );
}

OfflineIndicator.propTypes = {
  showWhenOnline: PropTypes.bool,
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
  className: PropTypes.string
};

export default OfflineIndicator;
