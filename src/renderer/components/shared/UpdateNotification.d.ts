/**
 * Update notification banner component
 * Displays update availability and download progress to users
 *
 * @param {Object} props - Component props
 * @param {Object} props.updateInfo - Update information
 * @param {string} props.updateInfo.version - New version number
 * @param {string} [props.updateInfo.releaseNotes] - Release notes/changelog
 * @param {string} props.status - Update status ('available', 'downloading', 'ready')
 * @param {Object} [props.progress] - Download progress
 * @param {number} [props.progress.percent] - Download percentage (0-100)
 * @param {Function} props.onInstall - Handler for install action
 * @param {Function} props.onDismiss - Handler for dismiss action
 */
export declare function UpdateNotification({ updateInfo, status, progress, onInstall, onDismiss }: {
    updateInfo: any;
    status: any;
    progress: any;
    onInstall: any;
    onDismiss: any;
}): import("react/jsx-runtime").JSX.Element;
export declare namespace UpdateNotification {
    var propTypes: {
        updateInfo: any;
        status: any;
        progress: any;
        onInstall: any;
        onDismiss: any;
    };
}
