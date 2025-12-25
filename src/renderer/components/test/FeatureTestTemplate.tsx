import React, { useState } from 'react';
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
export default function FeatureTestTemplate({
  featureName,
  description,
  testCases = [],
  onTestComplete,
}) {
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
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [testId]: {
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString(),
        }
      }));
    } finally {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{featureName}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={runAllTests}
            disabled={running !== null}
          >
            Run All Tests
          </Button>
          <Button
            variant="outline"
            onClick={clearResults}
            disabled={running !== null}
          >
            Clear Results
          </Button>
        </div>

        {/* Test Cases */}
        <div className="space-y-2">
          {testCases.map((testCase) => {
            const testId = testCase.name;
            const result = results[testId];
            
            return (
              <div
                key={testId}
                className="border border-border rounded p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{testCase.name}</div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runTest(testCase)}
                    disabled={running !== null}
                  >
                    {running === testId ? 'Running...' : 'Run'}
                  </Button>
                </div>

                {testCase.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {testCase.description}
                  </p>
                )}

                {result && (
                  <div
                    className={`text-sm p-2 rounded ${
                      result.status === 'running' ? 'bg-blue-50 text-blue-800' :
                      result.status === 'success' ? 'bg-green-50 text-green-800' :
                      result.status === 'failure' ? 'bg-yellow-50 text-yellow-800' :
                      'bg-red-50 text-red-800'
                    }`}
                  >
                    <div className="font-semibold">
                      {result.status === 'running' ? '⏳' :
                       result.status === 'success' ? '✅' :
                       result.status === 'failure' ? '⚠️' :
                       '❌'}
                      {' '}{result.message}
                    </div>
                    {result.timestamp && (
                      <div className="text-xs opacity-75 mt-1">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                    {result.data && (
                      <pre className="text-xs bg-background p-2 rounded mt-2 overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {testCases.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No test cases defined
          </p>
        )}
      </CardContent>
    </Card>
  );
}

FeatureTestTemplate.propTypes = {
  featureName: PropTypes.string.isRequired,
  description: PropTypes.string,
  testCases: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      run: PropTypes.func.isRequired,
    })
  ),
  onTestComplete: PropTypes.func,
};
