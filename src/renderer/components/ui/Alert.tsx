import * as React from 'react';
import PropTypes from 'prop-types';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

/**
 * Alert variants for different types of notifications
 */
const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        info: 'border-blue-200 bg-blue-50 text-blue-900 [&>svg]:text-blue-600',
        success: 'border-green-200 bg-green-50 text-green-900 [&>svg]:text-green-600',
        warning: 'border-yellow-200 bg-yellow-50 text-yellow-900 [&>svg]:text-yellow-600',
        error: 'border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * Alert component for displaying notifications
 * @param {Object} props - Component props
 * @param {string} [props.variant] - Alert variant (default, info, success, warning, error)
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Alert content
 */
/**
 * Alert component for displaying notifications
 * @param {Object} props - Component props
 * @param {string} [props.variant] - Alert variant (default, info, success, warning, error)
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Alert content
 */

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = 'Alert';
Alert.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'info', 'success', 'warning', 'error']),
  children: PropTypes.node,
};

/**
 * Alert title component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Title content
 */
export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> { }

const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';
AlertTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

/**
 * Alert description component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Description content
 */
export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLDivElement> { }

const AlertDescription = React.forwardRef<HTMLDivElement, AlertDescriptionProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';
AlertDescription.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export { Alert, AlertTitle, AlertDescription };
