import React from 'react';
import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/cn';

const Separator = forwardRef(
  ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={orientation}
        className={cn(
          'shrink-0 bg-border',
          orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
          className
        )}
        {...props}
      />
    );
  }
);

Separator.displayName = 'Separator';

Separator.propTypes = {
  className: PropTypes.string,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  decorative: PropTypes.bool,
};

export default Separator;
