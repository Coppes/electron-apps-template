/**
 * DropZone Component
 * Provides a visual drop zone for file drag-and-drop operations
 */
/**
 * DropZone component with drag-and-drop support
 */
export declare function DropZone({ onDrop, onError, multiple, accept, children, className, activeClassName, disabled }: {
    onDrop: any;
    onError: any;
    multiple?: boolean;
    accept?: any[];
    children: any;
    className?: string;
    activeClassName?: string;
    disabled?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export declare namespace DropZone {
    var propTypes: {
        onDrop: any;
        onError: any;
        multiple: any;
        accept: any;
        children: any;
        className: any;
        activeClassName: any;
        disabled: any;
    };
}
export default DropZone;
