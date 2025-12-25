/**
 * FileConflictDialog Component
 * Modal dialog for resolving file conflicts with diff view
 */
declare function FileConflictDialog({ isOpen, conflict, onResolve, onClose }: {
    isOpen: any;
    conflict: any;
    onResolve: any;
    onClose: any;
}): import("react/jsx-runtime").JSX.Element;
declare namespace FileConflictDialog {
    var propTypes: {
        isOpen: any;
        conflict: any;
        onResolve: any;
        onClose: any;
    };
}
export default FileConflictDialog;
