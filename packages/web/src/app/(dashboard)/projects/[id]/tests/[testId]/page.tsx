'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Save, ArrowLeft, Plus, Trash2, Edit, Eye, Code, AlertCircle,
  CheckCircle, Loader, FileText, PlayCircle, X, Copy, ChevronUp, ChevronDown, Play,
} from 'lucide-react';
import { api, TestStep, TestRun } from '@/lib/api';
import { StepEditor } from '@/components/StepEditor';

const ACTION_ICONS: Record<string, string> = {
  navigate: '🌐', click: '👆', doubleClick: '👆👆', type: '⌨️', fill: '📝',
  select: '📋', check: '☑️', assert: '✅', wait: '⏱️', screenshot: '📷',
  executeScript: '⚡', hover: '👋', scroll: '📜',
};

export default function TestEditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.id);
  const isNew = params.testId === 'new';
  const testId = isNew ? undefined : Number(params.testId);

  const [view, setView] = useState<'visual' | 'script'>('visual');
  const [steps, setSteps] = useState<TestStep[]>([]);
  const [editingStep, setEditingStep] = useState<TestStep | null>(null);
  const [showStepEditor, setShowStepEditor] = useState(false);
  const [testName, setTestName] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [testStatus, setTestStatus] = useState('DRAFT');
  const [scriptContent, setScriptContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Run state
  const [running, setRunning] = useState(false);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [runResult, setRunResult] = useState<TestRun | null>(null);

  useEffect(() => {
    if (!isNew && testId) loadTestCase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  useEffect(() => {
    if (view === 'script') {
      setScriptContent(
        JSON.stringify(
          { name: testName, description: testDescription, status: testStatus, steps },
          null,
          2
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const loadTestCase = async () => {
    if (!testId) return;
    setLoading(true);
    const result = await api.getTestCase(projectId, testId);
    if (result.success && result.data) {
      setTestName(result.data.name || '');
      setTestDescription(result.data.description || '');
      setTestStatus(result.data.status || 'DRAFT');
      setSteps(Array.isArray(result.data.steps) ? result.data.steps : []);
    } else {
      setError(result.error || 'Failed to load test case');
    }
    setLoading(false);
  };

  const saveTestCase = async (): Promise<number | null> => {
    if (!testName.trim()) {
      setError('Test name is required');
      return null;
    }
    setSaving(true);
    setError('');
    setSuccess('');

    const data = { name: testName, description: testDescription, status: testStatus, steps, tags: [] };
    const result = testId
      ? await api.updateTestCase(projectId, testId, data)
      : await api.createTestCase(projectId, data);

    setSaving(false);

    if (result.success && result.data) {
      setSuccess('Test case saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
      if (!testId && result.data.id) {
        // Redirect to the edit URL for the newly created test
        router.replace(`/projects/${projectId}/tests/${result.data.id}`);
      }
      return result.data.id;
    }
    setError(result.error || 'Failed to save test case');
    return null;
  };

  const generateStepsFromScript = () => {
    try {
      const parsed = JSON.parse(scriptContent);
      if (parsed.name !== undefined) setTestName(parsed.name);
      if (parsed.description !== undefined) setTestDescription(parsed.description);
      if (parsed.status) setTestStatus(parsed.status);
      if (Array.isArray(parsed.steps)) {
        setSteps(parsed.steps);
        setSuccess('Steps generated from script!');
        setTimeout(() => setSuccess(''), 3000);
        setView('visual');
      } else {
        setError('Invalid script format: steps array not found');
      }
    } catch (err: any) {
      setError(`Failed to parse script: ${err.message}`);
    }
  };

  const addOrUpdateStep = (step: TestStep) => {
    setSteps((prev) =>
      editingStep ? prev.map((s) => (s.id === step.id ? step : s)) : [...prev, step]
    );
    setShowStepEditor(false);
    setEditingStep(null);
  };

  const deleteStep = (id: string) => {
    if (confirm('Delete this step?')) setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const duplicateStep = (step: TestStep) => {
    setSteps((prev) => [
      ...prev,
      { ...step, id: Date.now().toString(), description: (step.description || '') + ' (copy)' },
    ]);
  };

  const toggleStep = (id: string) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: s.enabled === false } : s)));

  const moveStep = (index: number, dir: 'up' | 'down') => {
    const ni = dir === 'up' ? index - 1 : index + 1;
    if (ni < 0 || ni >= steps.length) return;
    const ns = [...steps];
    [ns[index], ns[ni]] = [ns[ni], ns[index]];
    setSteps(ns);
  };

  const runTest = async () => {
    setError('');
    // Save first to make sure the latest steps are persisted
    const savedId = await saveTestCase();
    const idToRun = savedId ?? testId;
    if (!idToRun) {
      setError('Please save the test before running');
      return;
    }
    if (steps.length === 0) {
      setError('Add at least one step before running');
      return;
    }

    setRunning(true);
    setRunResult(null);
    setRunLogs(['🚀 Starting test execution...', '▶️ Launching Playwright...']);

    const exec = await api.executeTest(projectId, idToRun, {
      headless: true,
      captureScreenshots: true,
      captureVideo: false,
    });

    if (!exec.success || !exec.data?.runId) {
      setRunLogs((p) => [...p, `❌ ${exec.error || 'Failed to start execution'}`]);
      setRunning(false);
      return;
    }

    const runId = exec.data.runId;
    setRunLogs((p) => [...p, `📋 Test run created: #${runId}`, '⏳ Waiting for completion...']);

    let attempts = 0;
    const maxAttempts = 90;
    while (attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 1000));
      const status = await api.getExecution(runId);
      if (status.success && status.data) {
        const s = status.data.status;
        if (['PASSED', 'FAILED', 'ERROR', 'STOPPED'].includes(s)) {
          setRunResult(status.data);
          setRunLogs((p) => [...p, `🏁 Completed with status: ${s}`]);
          setRunning(false);
          return;
        }
      }
      attempts++;
    }
    setRunLogs((p) => [...p, '⚠️ Timeout waiting for execution']);
    setRunning(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-blue-500 animate-spin mr-3" />
        <span className="text-gray-700">Loading test case...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/projects/${projectId}`)}
            className="p-2 hover:bg-gray-200 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-500" />
              {testId ? 'Edit Test Case' : 'Create New Test'}
            </h1>
            <p className="text-gray-500 text-sm">
              {steps.length} step{steps.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('visual')}
              className={`px-4 py-2 rounded-md font-medium ${
                view === 'visual' ? 'bg-blue-600 text-white' : 'text-gray-600'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" /> Visual
            </button>
            <button
              onClick={() => setView('script')}
              className={`px-4 py-2 rounded-md font-medium ${
                view === 'script' ? 'bg-blue-600 text-white' : 'text-gray-600'
              }`}
            >
              <Code className="w-4 h-4 inline mr-2" /> Script
            </button>
          </div>
          <button
            onClick={runTest}
            disabled={running || saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {running ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? 'Running...' : 'Run Test'}
          </button>
          <button
            onClick={saveTestCase}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Test'}
          </button>
        </div>
      </div>

      {/* Test info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-white rounded-lg shadow p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Test Name *</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Login with valid credentials"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description"
            value={testDescription}
            onChange={(e) => setTestDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={testStatus}
            onChange={(e) => setTestStatus(e.target.value)}
          >
            <option value="DRAFT">📝 Draft</option>
            <option value="ACTIVE">✅ Active</option>
            <option value="DEPRECATED">📦 Deprecated</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="flex-1 text-red-700 text-sm">{error}</p>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {/* Content */}
      {view === 'visual' ? (
        <div className="space-y-4">
          {steps.length === 0 && (
            <div className="bg-white rounded-lg shadow text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlayCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No steps added yet</h3>
              <p className="text-gray-500 mb-6">Start building your test by adding test steps</p>
              <button
                onClick={() => {
                  setEditingStep(null);
                  setShowStepEditor(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Your First Step
              </button>
            </div>
          )}

          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`bg-white rounded-lg shadow p-4 ${step.enabled === false ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col">
                  <button
                    onClick={() => moveStep(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveStep(index, 'down')}
                    disabled={index === steps.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{ACTION_ICONS[step.action] || '🔸'}</span>
                    <h4 className="text-lg font-semibold text-gray-900 capitalize">
                      {step.action.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                      {step.action}
                    </span>
                  </div>
                  {step.description && (
                    <p className="text-gray-500 text-sm mb-2">{step.description}</p>
                  )}
                  <div className="space-y-1 text-sm">
                    {step.locator && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Locator:</span>
                        <code className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-mono text-xs">
                          {step.locator}
                        </code>
                      </div>
                    )}
                    {step.value && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Value:</span>
                        <code className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-mono text-xs">
                          {step.value.length > 60 ? step.value.slice(0, 60) + '...' : step.value}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleStep(step.id)}
                    className={`p-2 rounded-lg ${
                      step.enabled === false ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-600'
                    }`}
                    title={step.enabled === false ? 'Enable step' : 'Disable step'}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => duplicateStep(step)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingStep(step);
                      setShowStepEditor(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteStep(step.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {steps.length > 0 && (
            <button
              onClick={() => {
                setEditingStep(null);
                setShowStepEditor(true);
              }}
              className="w-full py-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 text-gray-500 hover:text-blue-600 font-medium flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add New Step
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Code className="w-5 h-5" /> Test Script (JSON)
            </h3>
            <button
              onClick={generateStepsFromScript}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Generate Steps from Script
            </button>
          </div>
          <textarea
            className="w-full h-96 bg-gray-50 text-gray-800 p-4 rounded-lg font-mono text-sm border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            value={scriptContent}
            onChange={(e) => setScriptContent(e.target.value)}
            spellCheck={false}
          />
        </div>
      )}

      {/* Run logs & result */}
      {(runLogs.length > 0 || runResult) && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Execution</h3>
          {runResult && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg border-l-4 ${
                runResult.status === 'PASSED'
                  ? 'bg-green-50 border-green-500'
                  : 'bg-red-50 border-red-500'
              }`}
            >
              <span className="font-bold">
                {runResult.status === 'PASSED' ? '✅' : '❌'} {runResult.status}
              </span>
              {runResult.errorMessage && (
                <pre className="mt-2 text-sm text-red-700 whitespace-pre-wrap">
                  {runResult.errorMessage}
                </pre>
              )}
              {runResult.screenshots && runResult.screenshots.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  📸 {runResult.screenshots.length} screenshot(s) captured
                </p>
              )}
            </div>
          )}
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-xs max-h-80 overflow-auto">
            {runLogs.map((log, i) => (
              <div key={i} className="py-0.5">
                {log}
              </div>
            ))}
            {runResult?.logs?.map((log, i) => (
              <div key={`r-${i}`} className="py-0.5 text-gray-400">
                {typeof log === 'string' ? log : log.message || JSON.stringify(log)}
              </div>
            ))}
          </div>
        </div>
      )}

      {showStepEditor && (
        <StepEditor
          step={editingStep}
          onSave={addOrUpdateStep}
          onCancel={() => {
            setShowStepEditor(false);
            setEditingStep(null);
          }}
        />
      )}
    </div>
  );
}
