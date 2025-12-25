/**
 * FeatureTestTemplate Component
 * Reusable template for testing new features
 *
 * @example
 * <FeatureTestTemplate
 *   featureName="My Feature"
 *   description="Test my new feature"
 *   testCases={[
 *     {
 *       name: 'Basic Test',
 *       run: async () => {
 *         const result = await window.electronAPI.myFeature.test();
 *         return { success: true, data: result };
 *       }
 *     }
 *   ]}
 * />
 */
declare function FeatureTestTemplate({ featureName, description, testCases, onTestComplete, }: {
    featureName: any;
    description: any;
    testCases?: any[];
    onTestComplete: any;
}): import("react/jsx-runtime").JSX.Element;
declare namespace FeatureTestTemplate {
    var propTypes: {
        featureName: any;
        description: any;
        testCases: any;
        onTestComplete: any;
    };
}
export default FeatureTestTemplate;
