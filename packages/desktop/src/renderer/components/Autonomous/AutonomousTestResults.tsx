import React, { useState } from 'react';
import { ErrorDetailModal } from '../Execution/ErrorDetailModal';

interface TestResult {
  testId: string;
  testName: string;
  status: 'passed' | 'failed' | 'healed';
  duration: number;
  error?: string;
  screenshots?: string[];
  video?: string;
}

interface AnalysisResult {
  testId: string;
  category: 'APP_BUG' | 'TEST_ISSUE' | 'ENVIRONMENT' | 'FLAKY';
  rootCause: string;
  suggestedFix: {
    forDeveloper: string;
    forQA: string;
  };
  confidence: number;
}

interface AutonomousTestResultsProps {
  results: {
    passed: TestResult[];
    failed: TestResult[];
    healed: TestResult[];
    totalDuration: number;
  };
  analyses?: AnalysisResult[];
  generatedTests?: any[];
}

export const AutonomousTestResults: React.FC<AutonomousTestResultsProps> = ({
  results,
  analyses = [],
  generatedTests = []
}) => {
  const [selectedError, setSelectedError] = useState<any | null>(null);
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    failed: true,
    passed: false,
    healed: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getAnalysisForTest = (testId: string) => {
    return analyses.find(a => a.testId === testId);
  };

  const getTestName = (testId: string) => {
    const test = generatedTests.find(t => t.id === testId);
    return test?.name || testId;
  };

  const openErrorDetail = (test: TestResult) => {
    const analysis = getAnalysisForTest(test.testId);
    setSelectedError({
      testId: test.testId,
      testName: getTestName(test.testId),
      status: test.status,
      duration: test.duration,
      error: test.error,
      screenshots: test.screenshots,
      video: test.video,
      analysis
    });
  };

  const total = results.passed.length + results.failed.length + results.healed.length;
  const passRate = total > 0 ? Math.round((results.passed.length / total) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4">
        <h2 className="text-2xl font-bold mb-2">Test Execution Results</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-sm text-blue-100">Total Tests</div>
              <div className="text-3xl font-bold">{total}</div>
            </div>
            <div>
              <div className="text-sm text-blue-100">Pass Rate</div>
              <div className="text-3xl font-bold">{passRate}%</div>
            </div>
            <div>
              <div className="text-sm text-blue-100">Duration</div>
              <div className="text-3xl font-bold">{(results.totalDuration / 1000).toFixed(1)}s</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Pills */}
      <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-200">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-green-800 mb-1">Passed</div>
              <div className="text-3xl font-bold text-green-900">{results.passed.length}</div>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-red-800 mb-1">Failed</div>
              <div className="text-3xl font-bold text-red-900">{results.failed.length}</div>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-orange-800 mb-1">Healed</div>
              <div className="text-3xl font-bold text-orange-900">{results.healed.length}</div>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="p-6 space-y-4">
        {/* Failed Tests Section */}
        {results.failed.length > 0 && (
          <div className="border border-red-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('failed')}
              className="w-full bg-red-50 px-4 py-3 flex items-center justify-between hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="font-semibold text-red-900">
                  Failed Tests ({results.failed.length})
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-red-600 transition-transform ${expandedSections.failed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedSections.failed && (
              <div className="divide-y divide-red-100">
                {results.failed.map((test, index) => {
                  const analysis = getAnalysisForTest(test.testId);
                  return (
                    <div
                      key={index}
                      className="px-4 py-3 bg-white hover:bg-red-50 transition-colors cursor-pointer"
                      onClick={() => openErrorDetail(test)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-medium text-gray-900">{getTestName(test.testId)}</h4>
                            {analysis && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                {analysis.category.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-red-700 line-clamp-1">{test.error || 'Unknown error'}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                            <span>⏱️ {test.duration}ms</span>
                            {test.screenshots && test.screenshots.length > 0 && (
                              <span>📸 {test.screenshots.length} screenshots</span>
                            )}
                            {test.video && <span>📹 Video available</span>}
                          </div>
                        </div>
                        <button className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Healed Tests Section */}
        {results.healed.length > 0 && (
          <div className="border border-orange-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('healed')}
              className="w-full bg-orange-50 px-4 py-3 flex items-center justify-between hover:bg-orange-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="font-semibold text-orange-900">
                  Self-Healed Tests ({results.healed.length})
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-orange-600 transition-transform ${expandedSections.healed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedSections.healed && (
              <div className="divide-y divide-orange-100">
                {results.healed.map((test, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 bg-white hover:bg-orange-50 transition-colors cursor-pointer"
                    onClick={() => openErrorDetail(test)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{getTestName(test.testId)}</h4>
                        <p className="text-sm text-orange-700">Test was automatically healed during execution</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                          <span>⏱️ {test.duration}ms</span>
                          {test.video && <span>📹 Video available</span>}
                        </div>
                      </div>
                      <button className="ml-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Passed Tests Section */}
        {results.passed.length > 0 && (
          <div className="border border-green-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('passed')}
              className="w-full bg-green-50 px-4 py-3 flex items-center justify-between hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold text-green-900">
                  Passed Tests ({results.passed.length})
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-green-600 transition-transform ${expandedSections.passed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedSections.passed && (
              <div className="divide-y divide-green-100">
                {results.passed.slice(0, 10).map((test, index) => (
                  <div key={index} className="px-4 py-3 bg-white hover:bg-green-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{getTestName(test.testId)}</h4>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>⏱️ {test.duration}ms</span>
                          <span className="text-green-600 font-medium">✓ Passed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {results.passed.length > 10 && (
                  <div className="px-4 py-3 bg-gray-50 text-center text-sm text-gray-600">
                    ... and {results.passed.length - 10} more passed tests
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Detail Modal */}
      {selectedError && (
        <ErrorDetailModal
          error={selectedError}
          onClose={() => setSelectedError(null)}
        />
      )}
    </div>
  );
};
