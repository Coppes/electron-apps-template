import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useTranslation } from 'react-i18next';

/**
 * TestPage Component
 * General-purpose test playground for ad-hoc testing
 */
export default function TestPage() {
  const { t } = useTranslation('common');
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
    { id: 'quick', label: t('test_playground.tabs.quick') },
    { id: 'api', label: t('test_playground.tabs.api') },
    { id: 'console', label: t('test_playground.tabs.console') },
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('test_playground.title')}</h1>
        <p className="text-muted-foreground">
          {t('test_playground.description')}
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
              <CardTitle>{t('test_playground.quick.title')}</CardTitle>
              <CardDescription>{t('test_playground.quick.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder={t('test_playground.quick.placeholder')}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQuickTest()}
                  className="flex-1"
                />
                <Button onClick={handleQuickTest} disabled={loading || !inputValue}>
                  {loading ? t('test_playground.quick.testing_btn') : t('test_playground.quick.test_btn')}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClearResults}>
                  {t('test_playground.quick.clear_btn')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Test Tab */}
        {activeTab === 'api' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('test_playground.api.title')}</CardTitle>
              <CardDescription>{t('test_playground.api.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('test_playground.api.hint')}
              </p>
              <Button variant="outline">
                {t('test_playground.api.go_ipc')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Console Tab */}
        {activeTab === 'console' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('test_playground.console.title')}</CardTitle>
              <CardDescription>{t('test_playground.console.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.length === 0 ? (
                  <p className="text-muted-foreground text-sm">{t('test_playground.console.no_results')}</p>
                ) : (
                  results.map(result => (
                    <div
                      key={result.id}
                      className={`p-3 rounded border ${result.type === 'error' ? 'border-red-500 bg-red-50' :
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
