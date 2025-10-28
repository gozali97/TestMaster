"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestEditorAPI = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const StepEditor_1 = require("./StepEditor");
const api_service_1 = require("../../services/api.service");
const TestEditorAPI = ({ projectId, testCaseId, onBack }) => {
    const [view, setView] = (0, react_1.useState)('visual');
    const [steps, setSteps] = (0, react_1.useState)([]);
    const [editingStep, setEditingStep] = (0, react_1.useState)(null);
    const [showStepEditor, setShowStepEditor] = (0, react_1.useState)(false);
    const [testCase, setTestCase] = (0, react_1.useState)(null);
    const [testName, setTestName] = (0, react_1.useState)('');
    const [testDescription, setTestDescription] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)('');
    const [successMessage, setSuccessMessage] = (0, react_1.useState)('');
    // Load test case from API
    (0, react_1.useEffect)(() => {
        if (projectId && testCaseId) {
            loadTestCase();
        }
    }, [projectId, testCaseId]);
    const loadTestCase = async () => {
        if (!projectId || !testCaseId)
            return;
        setLoading(true);
        setError('');
        const result = await api_service_1.ApiService.getTestCase(projectId, testCaseId);
        if (result.success && result.data) {
            setTestCase(result.data);
            setTestName(result.data.name || '');
            setTestDescription(result.data.description || '');
            setSteps(result.data.steps || []);
        }
        else {
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
            result = await api_service_1.ApiService.updateTestCase(projectId, testCaseId, data);
        }
        else {
            result = await api_service_1.ApiService.createTestCase(projectId, data);
        }
        if (result.success && result.data) {
            setTestCase(result.data);
            setSuccessMessage('Test case saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
        else {
            setError(result.error || 'Failed to save test case');
        }
        setSaving(false);
    };
    const addStep = (step) => {
        if (editingStep) {
            setSteps(prev => prev.map(s => s.id === step.id ? step : s));
        }
        else {
            setSteps(prev => [...prev, step]);
        }
        setShowStepEditor(false);
        setEditingStep(null);
    };
    const handleEditStep = (step) => {
        setEditingStep(step);
        setShowStepEditor(true);
    };
    const handleDeleteStep = (stepId) => {
        if (confirm('Are you sure you want to delete this step?')) {
            setSteps(prev => prev.filter(s => s.id !== stepId));
        }
    };
    const handleDuplicateStep = (step) => {
        const newStep = {
            ...step,
            id: Date.now().toString(),
            description: (step.description || '') + ' (copy)',
        };
        setSteps(prev => [...prev, newStep]);
    };
    const toggleStepEnabled = (stepId) => {
        setSteps(prev => prev.map(s => s.id === stepId ? { ...s, enabled: !s.enabled } : s));
    };
    const moveStep = (index, direction) => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= steps.length)
            return;
        const newSteps = [...steps];
        [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
        setSteps(newSteps);
    };
    const getActionIcon = (action) => {
        const icons = {
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
    const getActionColor = (action) => {
        if (action.includes('assert'))
            return 'yellow';
        if (action.includes('wait'))
            return 'orange';
        if (action === 'navigate')
            return 'blue';
        if (['click', 'doubleClick', 'hover'].includes(action))
            return 'green';
        if (['type', 'fill', 'select', 'check'].includes(action))
            return 'purple';
        return 'gray';
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "h-full flex items-center justify-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader, { className: "w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-700", children: "Loading test case..." })] }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-full flex flex-col bg-gray-50", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white border-b border-gray-200 px-6 py-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4", children: [onBack && ((0, jsx_runtime_1.jsx)("button", { onClick: onBack, className: "p-2 hover:bg-gray-100 rounded-lg transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "w-5 h-5 text-gray-700" }) })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h1", { className: "text-2xl font-bold text-gray-900 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { className: "w-6 h-6 text-primary-500" }), testCaseId ? 'Edit Test Case' : 'Create New Test'] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-gray-600 text-sm", children: [steps.length, " step", steps.length !== 1 ? 's' : ''] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex bg-gray-100 rounded-lg p-1", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => setView('visual'), className: `px-4 py-2 rounded-md font-medium transition-all ${view === 'visual'
                                                    ? 'bg-primary-600 text-white'
                                                    : 'text-gray-600 hover:text-gray-800'}`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "w-4 h-4 inline mr-2" }), "Visual"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setView('script'), className: `px-4 py-2 rounded-md font-medium transition-all ${view === 'script'
                                                    ? 'bg-primary-600 text-white'
                                                    : 'text-gray-600 hover:text-gray-800'}`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Code, { className: "w-4 h-4 inline mr-2" }), "Script"] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: saveTestCase, disabled: saving, className: "btn-primary flex items-center gap-2", children: saving ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader, { className: "w-4 h-4 animate-spin" }), "Saving..."] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Save, { className: "w-4 h-4" }), "Save Test"] })) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-4 grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "label", children: "Test Name *" }), (0, jsx_runtime_1.jsx)("input", { type: "text", className: "input", placeholder: "e.g., Login with valid credentials", value: testName, onChange: (e) => setTestName(e.target.value) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "label", children: "Description" }), (0, jsx_runtime_1.jsx)("input", { type: "text", className: "input", placeholder: "Brief description of this test", value: testDescription, onChange: (e) => setTestDescription(e.target.value) })] })] }), error && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-4 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4 flex items-start gap-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-red-300 font-medium", children: "Error" }), (0, jsx_runtime_1.jsx)("p", { className: "text-red-400 text-sm", children: error })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setError(''), className: "text-red-400 hover:text-red-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-4 h-4" }) })] })), successMessage && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-4 bg-green-900 bg-opacity-20 border border-green-700 rounded-lg p-4 flex items-start gap-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-green-300 font-medium", children: "Success" }), (0, jsx_runtime_1.jsx)("p", { className: "text-green-400 text-sm", children: successMessage })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setSuccessMessage(''), className: "text-green-400 hover:text-green-300", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-4 h-4" }) })] }))] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 overflow-auto scrollbar-thin p-6", children: view === 'visual' ? ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-6xl mx-auto space-y-4", children: [steps.length === 0 && ((0, jsx_runtime_1.jsx)("div", { className: "card", children: (0, jsx_runtime_1.jsxs)("div", { className: "card-body text-center py-16", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4", children: (0, jsx_runtime_1.jsx)(lucide_react_1.PlayCircle, { className: "w-10 h-10 text-gray-500" }) }), (0, jsx_runtime_1.jsx)("h3", { className: "text-xl font-semibold text-gray-800 mb-2", children: "No steps added yet" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-6", children: "Start building your test by adding test steps" }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => {
                                            setEditingStep(null);
                                            setShowStepEditor(true);
                                        }, className: "btn-primary inline-flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "w-4 h-4" }), "Add Your First Step"] })] }) })), steps.map((step, index) => ((0, jsx_runtime_1.jsx)("div", { className: `card ${step.enabled === false ? 'opacity-50' : ''} hover:shadow-xl transition-shadow`, children: (0, jsx_runtime_1.jsx)("div", { className: "card-body", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-1 pt-1", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => moveStep(index, 'up'), disabled: index === 0, className: "p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30", children: (0, jsx_runtime_1.jsx)(lucide_react_1.GripVertical, { className: "w-4 h-4" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => moveStep(index, 'down'), disabled: index === steps.length - 1, className: "p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30", children: (0, jsx_runtime_1.jsx)(lucide_react_1.GripVertical, { className: "w-4 h-4" }) })] }), (0, jsx_runtime_1.jsx)("div", { className: `flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${step.enabled === false
                                                ? 'bg-gray-100 text-dark-600'
                                                : 'bg-primary-900 text-primary-300'}`, children: index + 1 }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-2xl", children: getActionIcon(step.action) }), (0, jsx_runtime_1.jsx)("h4", { className: "text-lg font-semibold text-gray-900 capitalize", children: step.action.replace(/([A-Z])/g, ' $1').trim() }), (0, jsx_runtime_1.jsx)("span", { className: `badge badge-${getActionColor(step.action)}`, children: step.action })] }), step.description && ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 text-sm mb-2", children: step.description })), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-1 text-sm", children: [step.locator && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-500", children: "Locator:" }), (0, jsx_runtime_1.jsx)("code", { className: "px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono text-xs", children: step.locator })] })), step.value && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-500", children: "Value:" }), (0, jsx_runtime_1.jsx)("code", { className: "px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono text-xs", children: step.value.length > 50 ? step.value.substring(0, 50) + '...' : step.value })] })), step.timeout && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-500", children: "Timeout:" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-gray-700", children: [step.timeout, "ms"] })] }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => toggleStepEnabled(step.id), className: `p-2 rounded-lg transition-colors ${step.enabled === false
                                                        ? 'bg-gray-100 text-gray-500'
                                                        : 'bg-green-900 text-green-400'}`, title: step.enabled === false ? 'Enable step' : 'Disable step', children: (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-4 h-4" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDuplicateStep(step), className: "p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-800 transition-colors", title: "Duplicate step", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { className: "w-4 h-4" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleEditStep(step), className: "p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-800 transition-colors", title: "Edit step", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "w-4 h-4" }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDeleteStep(step.id), className: "p-2 hover:bg-red-900 hover:bg-opacity-20 rounded-lg text-red-400 hover:text-red-300 transition-colors", title: "Delete step", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "w-4 h-4" }) })] })] }) }) }, step.id))), steps.length > 0 && ((0, jsx_runtime_1.jsxs)("button", { onClick: () => {
                                setEditingStep(null);
                                setShowStepEditor(true);
                            }, className: "w-full py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-600 hover:bg-primary-900 hover:bg-opacity-10 transition-all text-gray-600 hover:text-primary-400 font-medium flex items-center justify-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "w-5 h-5" }), "Add New Step"] }))] })) : (
                /* Script View */
                (0, jsx_runtime_1.jsxs)("div", { className: "card max-w-4xl mx-auto", children: [(0, jsx_runtime_1.jsx)("div", { className: "card-header", children: (0, jsx_runtime_1.jsxs)("h3", { className: "text-lg font-semibold text-gray-900 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Code, { className: "w-5 h-5" }), "Generated Test Script"] }) }), (0, jsx_runtime_1.jsx)("div", { className: "card-body", children: (0, jsx_runtime_1.jsx)("pre", { className: "bg-gray-50 text-gray-800 p-4 rounded-lg overflow-x-auto font-mono text-sm", children: JSON.stringify({ name: testName, description: testDescription, steps }, null, 2) }) })] })) }), showStepEditor && ((0, jsx_runtime_1.jsx)(StepEditor_1.StepEditor, { step: editingStep, onSave: addStep, onCancel: () => {
                    setShowStepEditor(false);
                    setEditingStep(null);
                }, variables: [] }))] }));
};
exports.TestEditorAPI = TestEditorAPI;
//# sourceMappingURL=TestEditorAPI.js.map