/**
 * Update Notification Component
 * Displays update status (available, downloading, ready) and actions.
 */
declare const UpdateNotification: {
    ({ updateInfo, status, onInstall, onDismiss }: {
        updateInfo: any;
        status: any;
        onInstall: any;
        onDismiss: any;
    }): import("react/jsx-runtime").JSX.Element;
    propTypes: {
        updateInfo: any;
        status: any;
        onInstall: any;
        onDismiss: any;
    };
};
export default UpdateNotification;
