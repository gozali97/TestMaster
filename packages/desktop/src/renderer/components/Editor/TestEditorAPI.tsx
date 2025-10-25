import { useState, useEffect } from 'react';
import { 
  Save, Play, ArrowLeft, Plus, Trash2, Edit, GripVertical, 
  Eye, Code, AlertCircle, CheckCircle, Loader, FileText,
  PlayCircle, X, Copy, Settings
} from 'lucide-react';
import { StepEditor, TestStep } from './StepEditor';
import { ApiService, TestCase } from '../../services/api.service';

interface TestEditorAPIProps {
  projectId?: number;
  testCaseId?: number;
  onBack?: () => void;
}

export const TestEditorAPI = ({ projectId, testCaseId, onBack }: TestEditorAPIProps) => {
  const [view, setView] = useState<'visual' | 'script'>('visual');
  const [steps, setSteps] = useState<TestStep[]>([]);
  const [editingStep, setEditingStep] = useState<TestStep | null>(null);
  const [showStepEditor, setShowStepEditor] = useState(false);
  const [testCase, setTestCase] = useState<TestCase | null>(null);
  const [testName, setTestName] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load test case from API
  useEffect(() => {
    if (projectId && testCaseId) {
      loadTestCase();
    }
  }, [projectId, testCaseId]);

  const loadTestCase = async () => {
    if (!projectId || !testCaseId) return;

    setLoading(true);
    setError('');

    const result = await ApiService.getTestCase(projectId, testCaseId);

    if (result.success && result.data) {
      setTestCase(result.data);
      setTestName(result.data.name || '');
      setTestDescription(result.data.description || '');
      setSteps(result.data.steps || []);
    } else {
      setError(result.error || 'Failed to load test case');
    }

    setLoading(false);
  };

  const saveTestCase = async () => {
    if (!projectId) {
      setError('Project ID is required');
      return;
    }

    if (!testName.trim()) {
      setError('Test name is required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMessage('');

    const data = {
      name: testName,
      description: testDescription,
      steps,
      variables: [],
    };

    let result;
    if (testCaseId) {
      result = await ApiService.updateTestCase(projectId, testCaseId, data);
    } else {
      result = await ApiService.createTestCase(projectId, data);
    }

    if (result.success && result.data) {
      setTestCase(result.data);
      setSuccessMessage('Test case saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setError(result.error || 'Failed to save test case');
    }

    setSaving(false);
  };

  const addStep = (step: TestStep) => {
    if (editingStep) {
      setSteps(prev => prev.map(s => s.id === step.id ? step : s));
    } else {
      setSteps(prev => [...prev, step]);
    }
    setShowStepEditor(false);
    setEditingStep(null);
  };

  const handleEditStep = (step: TestStep) => {
    setEditingStep(step);
    setShowStepEditor(true);
  };

  const handleDeleteStep = (stepId: string) => {
    if (confirm('Are you sure you want to delete this step?')) {
      setSteps(prev => prev.filter(s => s.id !== stepId));
    }
  };

  const handleDuplicateStep = (step: TestStep) => {
    const newStep = {
      ...step,
      id: Date.now().toString(),
      description: (step.description || '') + ' (copy)',
    };
    setSteps(prev => [...prev, newStep]);
  };

  const toggleStepEnabled = (stepId: string) => {
    setSteps(prev => prev.map(s => 
      s.id === stepId ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    const newSteps = [...steps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    setSteps(newSteps);
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      navigate: '🌐',
      click: '👆',
      doubleClick: '👆👆',
      type: '⌨️',
      fill: '📝',
      select: '📋',
      check: '☑️',
      assert: '✅',
      wait: '⏱️',
      screenshot: '📷',
      executeScript: '⚡',
      hover: '👋',
      scroll: '📜',
    };
    return icons[action] || '🔸';
  };

  const getActionColor = (action: string) => {
    if (action.includes('assert')) return 'yellow';
    if (action.includes('wait')) return 'orange';
    if (action === 'navigate') return 'blue';
    if (['click', 'doubleClick', 'hover'].includes(action)) return 'green';
    if (['type', 'fill', 'select', 'check'].includes(action)) return 'purple';
    return 'gray';
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-700">Loading test case...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary-500" />
                {testCaseId ? 'Edit Test Case' : 'Create New Test'}
              </h1>
              <p className="text-gray-600 text-sm">
                {steps.length} step{steps.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('visual')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  view === 'visual'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                Visual
              </button>
              <button
                onClick={() => setView('script')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  view === 'script'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Code className="w-4 h-4 inline mr-2" />
                Script
              </button>
            </div>

            <button
              onClick={saveTestCase}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Test
                </>
              )}
            </button>
          </div>
        </div>

        {/* Test Info */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="label">Test Name *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., Login with valid credentials"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Description</label>
            <input
              type="text"
              className="input"
              placeholder="Brief description of this test"
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mt-4 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-300 font-medium">Error</p>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 bg-green-900 bg-opacity-20 border border-green-700 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-300 font-medium">Success</p>
              <p className="text-green-400 text-sm">{successMessage}</p>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-green-400 hover:text-green-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto scrollbar-thin p-6">
        {view === 'visual' ? (
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Empty State */}
            {steps.length === 0 && (
              <div className="card">
                <div className="card-body text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlayCircle className="w-10 h-10 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No steps added yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start building your test by adding test steps
                  </p>
                  <button
                    onClick={() => {
                      setEditingStep(null);
                      setShowStepEditor(true);
                    }}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Step
                  </button>
                </div>
              </div>
            )}

            {/* Steps List */}
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`card ${
                  step.enabled === false ? 'opacity-50' : ''
                } hover:shadow-xl transition-shadow`}
              >
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    {/* Drag Handle */}
                    <div className="flex flex-col gap-1 pt-1">
                      <button
                        onClick={() => moveStep(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveStep(index, 'down')}
                        disabled={index === steps.length - 1}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Step Number */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step.enabled === false
                        ? 'bg-gray-100 text-dark-600'
                        : 'bg-primary-900 text-primary-300'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Step Icon & Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getActionIcon(step.action)}</span>
                        <h4 className="text-lg font-semibold text-gray-900 capitalize">
                          {step.action.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <span className={`badge badge-${getActionColor(step.action)}`}>
                          {step.action}
                        </span>
                      </div>

                      {step.description && (
                        <p className="text-gray-600 text-sm mb-2">{step.description}</p>
                      )}

                      <div className="space-y-1 text-sm">
                        {step.locator && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Locator:</span>
                            <code className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono text-xs">
                              {step.locator}
                            </code>
                          </div>
                        )}
                        {step.value && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Value:</span>
                            <code className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono text-xs">
                              {step.value.length > 50 ? step.value.substring(0, 50) + '...' : step.value}
                            </code>
                          </div>
                        )}
                        {step.timeout && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Timeout:</span>
                            <span className="text-gray-700">{step.timeout}ms</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStepEnabled(step.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          step.enabled === false
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-green-900 text-green-400'
                        }`}
                        title={step.enabled === false ? 'Enable step' : 'Disable step'}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateStep(step)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-800 transition-colors"
                        title="Duplicate step"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditStep(step)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-800 transition-colors"
                        title="Edit step"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStep(step.id)}
                        className="p-2 hover:bg-red-900 hover:bg-opacity-20 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                        title="Delete step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Step Button */}
            {steps.length > 0 && (
              <button
                onClick={() => {
                  setEditingStep(null);
                  setShowStepEditor(true);
                }}
                className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-600 hover:bg-primary-900 hover:bg-opacity-10 transition-all text-gray-600 hover:text-primary-400 font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add New Step
              </button>
            )}
          </div>
        ) : (
          /* Script View */
          <div className="card max-w-4xl mx-auto">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Code className="w-5 h-5" />
                Generated Test Script
              </h3>
            </div>
            <div className="card-body">
              <pre className="bg-gray-50 text-gray-800 p-4 rounded-lg overflow-x-auto font-mono text-sm">
                {JSON.stringify({ name: testName, description: testDescription, steps }, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Step Editor Modal */}
      {showStepEditor && (
        <StepEditor
          step={editingStep}
          onSave={addStep}
          onCancel={() => {
            setShowStepEditor(false);
            setEditingStep(null);
          }}
          variables={[]}
        />
      )}
    </div>
  );
};
