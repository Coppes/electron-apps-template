import OSIntegrationDemo from '../components/demo/OSIntegrationDemo';

/**
 * OSIntegrationDemoPage
 * Full page wrapper for OS integration features demo
 */
export default function OSIntegrationDemoPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">OS Integration Features</h1>
        <p className="text-gray-600 text-lg">
          Explore native operating system integration capabilities including system tray,
          global shortcuts, progress indicators, notifications, and recent documents.
        </p>
      </div>

      <OSIntegrationDemo />
    </div>
  );
}
