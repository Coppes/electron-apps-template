import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';
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
export default function FeatureTestTemplate({ featureName, description, testCases = [], onTestComplete, }) {
    const [results, setResults] = useState({});
    const [running, setRunning] = useState(null);
    const runTest = async (testCase) => {
        const testId = testCase.name;
        try {
            setRunning(testId);
            setResults(prev => ({
                ...prev,
                [testId]: { status: 'running', message: 'Running...' }
            }));
            const result = await testCase.run();
            setResults(prev => ({
                ...prev,
                [testId]: {
                    status: result.success ? 'success' : 'failure',
                    message: result.message || 'Test completed',
                    data: result.data,
                    timestamp: new Date().toISOString(),
                }
            }));
            if (onTestComplete) {
                onTestComplete(testId, result);
            }
        }
        catch (error) {
            setResults(prev => ({
                ...prev,
                [testId]: {
                    status: 'error',
                    message: error.message,
                    timestamp: new Date().toISOString(),
                }
            }));
        }
        finally {
            setRunning(null);
        }
    };
    const runAllTests = async () => {
        for (const testCase of testCases) {
            await runTest(testCase);
        }
    };
    const clearResults = () => {
        setResults({});
    };
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: featureName }), _jsx(CardDescription, { children: description })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: runAllTests, disabled: running !== null, children: "Run All Tests" }), _jsx(Button, { variant: "outline", onClick: clearResults, disabled: running !== null, children: "Clear Results" })] }), _jsx("div", { className: "space-y-2", children: testCases.map((testCase) => {
                            const testId = testCase.name;
                            const result = results[testId];
                            return (_jsxs("div", { className: "border border-border rounded p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("div", { className: "font-medium", children: testCase.name }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => runTest(testCase), disabled: running !== null, children: running === testId ? 'Running...' : 'Run' })] }), testCase.description && (_jsx("p", { className: "text-sm text-muted-foreground mb-2", children: testCase.description })), result && (_jsxs("div", { className: `text-sm p-2 rounded ${result.status === 'running' ? 'bg-blue-50 text-blue-800' :
                                            result.status === 'success' ? 'bg-green-50 text-green-800' :
                                                result.status === 'failure' ? 'bg-yellow-50 text-yellow-800' :
                                                    'bg-red-50 text-red-800'}`, children: [_jsxs("div", { className: "font-semibold", children: [result.status === 'running' ? '⏳' :
                                                        result.status === 'success' ? '✅' :
                                                            result.status === 'failure' ? '⚠️' :
                                                                '❌', ' ', result.message] }), result.timestamp && (_jsx("div", { className: "text-xs opacity-75 mt-1", children: new Date(result.timestamp).toLocaleTimeString() })), result.data && (_jsx("pre", { className: "text-xs bg-background p-2 rounded mt-2 overflow-x-auto", children: JSON.stringify(result.data, null, 2) }))] }))] }, testId));
                        }) }), testCases.length === 0 && (_jsx("p", { className: "text-muted-foreground text-sm", children: "No test cases defined" }))] })] }));
}
FeatureTestTemplate.propTypes = {
    featureName: PropTypes.string.isRequired,
    description: PropTypes.string,
    testCases: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        run: PropTypes.func.isRequired,
    })),
    onTestComplete: PropTypes.func,
};
