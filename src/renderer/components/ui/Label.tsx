import React from 'react';
import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/cn';

const Label = forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          className
        )}
        {...props}
      />
    );
  }
);

Label.displayName = 'Label';

Label.propTypes = {
  className: PropTypes.string,
};

export default Label;
