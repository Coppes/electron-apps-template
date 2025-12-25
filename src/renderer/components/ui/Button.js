import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../utils/cn';
const Button = forwardRef(({ className, variant = 'default', size = 'md', disabled = false, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    const variants = {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
    };
    const sizes = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
    };
    return (_jsx("button", { className: cn(baseStyles, variants[variant], sizes[size], disabled && 'cursor-not-allowed', className), disabled: disabled, ref: ref, ...props, children: children }));
});
Button.displayName = 'Button';
Button.propTypes = {
    className: PropTypes.string,
    variant: PropTypes.oneOf(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']),
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'icon']),
    disabled: PropTypes.bool,
    children: PropTypes.node,
};
export default Button;
