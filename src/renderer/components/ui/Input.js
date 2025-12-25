import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/cn';
const Input = forwardRef(({ className, type = 'text', disabled = false, placeholder, value, onChange, onKeyPress, ...props }, ref) => {
    return (_jsx("input", { type: type, className: cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', className), placeholder: placeholder, ref: ref, disabled: disabled, value: value, onChange: onChange, onKeyPress: onKeyPress, ...props }));
});
Input.displayName = 'Input';
Input.propTypes = {
    className: PropTypes.string,
    type: PropTypes.string,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func,
    onKeyPress: PropTypes.func,
};
export default Input;
