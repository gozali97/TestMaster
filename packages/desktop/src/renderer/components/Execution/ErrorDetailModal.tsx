import React, { useState } from 'react';

interface ErrorDetail {
  testId: string;
  testName: string;
  status: 'failed' | 'healed';
  duration: number;
  error?: string;
  screenshots?: string[];
  video?: string;
  analysis?: {
    category: 'APP_BUG' | 'TEST_ISSUE' | 'ENVIRONMENT' | 'FLAKY';
    rootCause: string;
    suggestedFix: {
      forDeveloper: string;
      forQA: string;
    };
    confidence: number;
  };
}

interface ErrorDetailModalProps {
  error: ErrorDetail;
  onClose: () => void;
}

export const ErrorDetailModal: React.FC<ErrorDetailModalProps> = ({ error, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'screenshot' | 'video' | 'analysis'>('overview');

  // Parse error message to extract useful info
  const parseErrorMessage = (errorMsg?: string) => {
    if (!errorMsg) return { type: 'Unknown', message: 'No error message available', details: '' };

    // Common error patterns
    if (errorMsg.includes('timeout') || errorMsg.includes('Timeout')) {
      return {
        type: 'Timeout Error',
        message: 'Element or action timed out',
        details: errorMsg,
        suggestion: 'Increase timeout or check if element exists'
      };
    }
    
    if (errorMsg.includes('not found') || errorMsg.includes('could not find')) {
      return {
        type: 'Element Not Found',
        message: 'Element could not be located',
        details: errorMsg,
        suggestion: 'Update locator or check if element is present'
      };
    }
    
    if (errorMsg.includes('navigation') || errorMsg.includes('Navigation')) {
      return {
        type: 'Navigation Error',
        message: 'Page navigation failed',
        details: errorMsg,
        suggestion: 'Check URL or network connection'
      };
    }

    if (errorMsg.includes('click') || errorMsg.includes('Click')) {
      return {
        type: 'Click Failed',
        message: 'Could not click element',
        details: errorMsg,
        suggestion: 'Element might be hidden, disabled, or covered'
      };
    }

    return {
      type: 'General Error',
      message: errorMsg.split('\n')[0],
      details: errorMsg,
      suggestion: 'Review error details for specific issue'
    };
  };

  const parsedError = parseErrorMessage(error.error);

  // Get category badge color
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'APP_BUG':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'TEST_ISSUE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ENVIRONMENT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FLAKY':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get confidence badge
  const getConfidenceBadge = (confidence?: number) => {
    if (!confidence) return null;
    
    const percentage = Math.round(confidence * 100);
    let color = 'bg-gray-100 text-gray-800';
    
    if (percentage >= 80) color = 'bg-green-100 text-green-800';
    else if (percentage >= 60) color = 'bg-yellow-100 text-yellow-800';
    else color = 'bg-red-100 text-red-800';

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>
        {percentage}% confident
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 rounded-full p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Error Details</h2>
              <p className="text-sm text-red-100">{error.testName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 font-medium transition-all relative ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            {error.screenshots && error.screenshots.length > 0 && (
              <button
                onClick={() => setActiveTab('screenshot')}
                className={`px-4 py-3 font-medium transition-all relative ${
                  activeTab === 'screenshot'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Screenshots ({error.screenshots.length})
              </button>
            )}
            {error.video && (
              <button
                onClick={() => setActiveTab('video')}
                className={`px-4 py-3 font-medium transition-all relative ${
                  activeTab === 'video'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Video
              </button>
            )}
            {error.analysis && (
              <button
                onClick={() => setActiveTab('analysis')}
                className={`px-4 py-3 font-medium transition-all relative ${
                  activeTab === 'analysis'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                AI Analysis
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Smart
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Error Summary */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="bg-red-100 rounded-full p-2">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-900">{parsedError.type}</h3>
                    <p className="text-red-700 mt-1">{parsedError.message}</p>
                  </div>
                </div>
              </div>

              {/* Test Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Test ID</div>
                  <div className="font-mono text-sm text-gray-900">{error.testId}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Duration</div>
                  <div className="font-semibold text-gray-900">{error.duration}ms</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                    error.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {error.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Error Details */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Error Details
                </h4>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{parsedError.details || 'No error details available'}</pre>
                </div>
              </div>

              {/* Quick Fix Suggestion */}
              {parsedError.suggestion && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">💡 Quick Fix Suggestion</h4>
                      <p className="text-blue-800">{parsedError.suggestion}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Screenshot Tab */}
          {activeTab === 'screenshot' && error.screenshots && error.screenshots.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Screenshots captured during test execution:</p>
              {error.screenshots.map((screenshot, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Screenshot {index + 1}</span>
                  </div>
                  <div className="p-4 bg-gray-50">
                    <img
                      src={`data:image/png;base64,${screenshot}`}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full rounded border border-gray-300 shadow-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Video Tab */}
          {activeTab === 'video' && error.video && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Video recording of test execution:</p>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Test Execution Video</span>
                  <button
                    onClick={() => window.electron.openPath(error.video!)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in Player
                  </button>
                </div>
                <div className="p-4 bg-gray-50">
                  <div className="aspect-video bg-gray-900 rounded flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm">Video: {error.video.split('\\').pop()}</p>
                      <button
                        onClick={() => window.electron.openPath(error.video!)}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        Play Video
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Analysis Tab */}
          {activeTab === 'analysis' && error.analysis && (
            <div className="space-y-6">
              {/* Analysis Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">AI-Powered Error Analysis</h3>
                {getConfidenceBadge(error.analysis.confidence)}
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Error Category</label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(error.analysis.category)}`}>
                  {error.analysis.category.replace('_', ' ')}
                </span>
              </div>

              {/* Root Cause */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">🔍 Root Cause Analysis</label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-900">{error.analysis.rootCause}</p>
                </div>
              </div>

              {/* Suggested Fixes */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* For Developer */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    For Developer
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">{error.analysis.suggestedFix.forDeveloper}</p>
                  </div>
                </div>

                {/* For QA */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    For QA Tester
                  </label>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-900">{error.analysis.suggestedFix.forQA}</p>
                  </div>
                </div>
              </div>

              {/* AI Badge */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">AI-Powered Analysis</p>
                    <p className="text-xs text-gray-600">This analysis was generated using machine learning</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {error.video && (
              <button
                onClick={() => window.electron.openPath(error.video!)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
                Open Video Folder
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
