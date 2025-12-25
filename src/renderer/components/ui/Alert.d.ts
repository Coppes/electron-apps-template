import * as React from 'react';
/**
 * Alert component for displaying notifications
 * @param {Object} props - Component props
 * @param {string} [props.variant] - Alert variant (default, info, success, warning, error)
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Alert content
 */
declare const Alert: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
/**
 * Alert title component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Title content
 */
declare const AlertTitle: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
/**
 * Alert description component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Description content
 */
declare const AlertDescription: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export { Alert, AlertTitle, AlertDescription };
