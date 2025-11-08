import React from 'react';
import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/cn';

const Slider = forwardRef(
  ({ className, min = 0, max = 100, step = 1, value, onChange, ...props }, ref) => {
    return (
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className={cn(
          'w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer',
          '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Slider.displayName = 'Slider';

Slider.propTypes = {
  className: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  value: PropTypes.number,
  onChange: PropTypes.func,
};

export default Slider;
