'use client';

import { useState } from 'react';

export default function AIAssistantPage() {
  const [description, setDescription] = useState('');
  const [generatedTest, setGeneratedTest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateTest = async () => {
    if (!description.trim()) return;

    setLoading(true);
    setError('');
    setGeneratedTest(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3001/api/ai/generate-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedTest(data.data.testCase);
      } else {
        setError(data.error || 'Failed to generate test');
      }
    } catch (err: any) {
      setError('AI service unavailable. Please configure API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Assistant</h1>
        <p className="text-gray-600">Generate test cases from natural language descriptions</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Generate Test Case</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe what you want to test
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Example: Test login functionality with valid credentials. Navigate to login page, enter username and password, click login button, and verify user is redirected to dashboard."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={generateTest}
          disabled={loading || !description.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : '✨ Generate Test with AI'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <p className="text-sm text-red-600 mt-2">
              Configure OpenAI or Anthropic API key in environment variables to use AI features.
            </p>
          </div>
        )}
      </div>

      {generatedTest && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Generated Test Case</h2>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Save Test Case
            </button>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">{generatedTest.name}</h3>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Test Steps:</h4>
            {generatedTest.steps?.map((step: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 capitalize">{step.action}</div>
                    {step.locator && (
                      <div className="text-sm text-gray-600 mt-1">
                        Locator: <code className="bg-gray-100 px-2 py-1 rounded">{step.locator}</code>
                      </div>
                    )}
                    {step.value && (
                      <div className="text-sm text-gray-600 mt-1">
                        Value: <code className="bg-gray-100 px-2 py-1 rounded">{step.value}</code>
                      </div>
                    )}
                    {step.description && (
                      <div className="text-sm text-gray-500 mt-1">{step.description}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ Review the generated test case and modify as needed before saving.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-2">🤖 Test Generation</h3>
          <p className="text-sm text-gray-600">
            Generate test cases from natural language descriptions using AI
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-2">🔧 Self-Healing</h3>
          <p className="text-sm text-gray-600">
            Automatically fix broken locators when elements change
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-2">💡 Smart Suggestions</h3>
          <p className="text-sm text-gray-600">
            Get intelligent suggestions to optimize and improve your tests
          </p>
        </div>
      </div>
    </div>
  );
}
