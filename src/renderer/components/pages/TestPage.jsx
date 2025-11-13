import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

/**
 * TestPage Component
 * General-purpose test playground for ad-hoc testing
 */
export default function TestPage() {
  const [activeTab, setActiveTab] = useState('quick');
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (type, message, data = null) => {
    const result = {
      id: Date.now(),
      type,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    setResults(prev => [result, ...prev].slice(0, 50)); // Keep last 50 results
  };

  const handleQuickTest = async () => {
    try {
      setLoading(true);
      addResult('info', `Testing: ${inputValue}`);
      
      // Example: test app version
      if (inputValue === 'version') {
        const version = await window.electronAPI.app.getVersion();
        addResult('success', 'App Version', version);
      }
      // Example: test storage
      else if (inputValue.startsWith('storage:')) {
        const key = inputValue.replace('storage:', '');
        const value = await window.electronAPI.storage.get(key);
        addResult('success', `Storage value for '${key}'`, value);
      }
      // Default: echo
      else {
        addResult('success', 'Echo', inputValue);
      }
    } catch (error) {
      addResult('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearResults = () => {
    setResults([]);
  };

  const tabs = [
    { id: 'quick', label: '⚡ Quick Test' },
    { id: 'api', label: '🔌 API Test' },
    { id: 'console', label: '📟 Console' },
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Test Playground</h1>
        <p className="text-muted-foreground">
          Ad-hoc testing and experimentation area
        </p>
      </div>

      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border pb-2">
          {tabs.map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Quick Test Tab */}
        {activeTab === 'quick' && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Test</CardTitle>
              <CardDescription>Run quick tests with simple input</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter test input (try 'version' or 'storage:key')"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQuickTest()}
                  className="flex-1"
                />
                <Button onClick={handleQuickTest} disabled={loading || !inputValue}>
                  {loading ? 'Testing...' : 'Test'}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClearResults}>
                  Clear Results
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Test Tab */}
        {activeTab === 'api' && (
          <Card>
            <CardHeader>
              <CardTitle>API Test</CardTitle>
              <CardDescription>Test specific API endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use the IPC Demo page for comprehensive API testing
              </p>
              <Button variant="outline">
                Go to IPC Demo →
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Console Tab */}
        {activeTab === 'console' && (
          <Card>
            <CardHeader>
              <CardTitle>Console Output</CardTitle>
              <CardDescription>View test results and logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No results yet</p>
                ) : (
                  results.map(result => (
                    <div
                      key={result.id}
                      className={`p-3 rounded border ${
                        result.type === 'error' ? 'border-red-500 bg-red-50' :
                        result.type === 'success' ? 'border-green-500 bg-green-50' :
                        'border-border bg-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">
                          {result.type === 'error' ? '❌' : result.type === 'success' ? '✅' : 'ℹ️'}
                          {' '}{result.message}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {result.data && (
                        <pre className="text-xs bg-background p-2 rounded mt-2 overflow-x-auto">
                          {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
