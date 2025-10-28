"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepEditor = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const ACTION_CATEGORIES = {
    navigation: {
        label: 'Navigation',
        icon: lucide_react_1.MousePointer,
        color: 'blue',
        actions: [
            { value: 'navigate', label: 'Navigate to URL', needsValue: true, needsLocator: false, icon: '🌐', desc: 'Open a web page' },
            { value: 'goBack', label: 'Go Back', needsValue: false, needsLocator: false, icon: '⬅️', desc: 'Navigate back' },
            { value: 'goForward', label: 'Go Forward', needsValue: false, needsLocator: false, icon: '➡️', desc: 'Navigate forward' },
            { value: 'refresh', label: 'Refresh Page', needsValue: false, needsLocator: false, icon: '🔄', desc: 'Reload page' },
        ]
    },
    interactions: {
        label: 'Interactions',
        icon: lucide_react_1.MousePointer,
        color: 'green',
        actions: [
            { value: 'click', label: 'Click', needsValue: false, needsLocator: true, icon: '👆', desc: 'Click an element' },
            { value: 'doubleClick', label: 'Double Click', needsValue: false, needsLocator: true, icon: '👆👆', desc: 'Double click element' },
            { value: 'rightClick', label: 'Right Click', needsValue: false, needsLocator: true, icon: '🖱️', desc: 'Context menu' },
            { value: 'hover', label: 'Hover', needsValue: false, needsLocator: true, icon: '👋', desc: 'Hover over element' },
        ]
    },
    input: {
        label: 'Input',
        icon: lucide_react_1.Keyboard,
        color: 'purple',
        actions: [
            { value: 'type', label: 'Type Text', needsValue: true, needsLocator: true, icon: '⌨️', desc: 'Type into field' },
            { value: 'fill', label: 'Fill Input', needsValue: true, needsLocator: true, icon: '📝', desc: 'Fill input field' },
            { value: 'clear', label: 'Clear Input', needsValue: false, needsLocator: true, icon: '🧹', desc: 'Clear field' },
            { value: 'press', label: 'Press Key', needsValue: true, needsLocator: false, icon: '⌨️', desc: 'Press keyboard key' },
            { value: 'select', label: 'Select Option', needsValue: true, needsLocator: true, icon: '📋', desc: 'Select dropdown option' },
            { value: 'check', label: 'Check Checkbox', needsValue: false, needsLocator: true, icon: '☑️', desc: 'Check checkbox' },
            { value: 'uncheck', label: 'Uncheck Checkbox', needsValue: false, needsLocator: true, icon: '⬜', desc: 'Uncheck checkbox' },
            { value: 'upload', label: 'Upload File', needsValue: true, needsLocator: true, icon: '📁', desc: 'Upload file' },
        ]
    },
    assertions: {
        label: 'Assertions',
        icon: lucide_react_1.Check,
        color: 'yellow',
        actions: [
            { value: 'assert', label: 'Assert Visible', needsValue: false, needsLocator: true, icon: '✅', desc: 'Verify element is visible' },
            { value: 'assertText', label: 'Assert Text', needsValue: true, needsLocator: true, icon: '📄', desc: 'Verify text content' },
            { value: 'assertValue', label: 'Assert Value', needsValue: true, needsLocator: true, icon: '🔤', desc: 'Verify input value' },
            { value: 'assertAttribute', label: 'Assert Attribute', needsValue: true, needsLocator: true, icon: '🏷️', desc: 'Verify attribute' },
            { value: 'assertCount', label: 'Assert Count', needsValue: true, needsLocator: true, icon: '#️⃣', desc: 'Verify element count' },
            { value: 'assertUrl', label: 'Assert URL', needsValue: true, needsLocator: false, icon: '🌐', desc: 'Verify current URL' },
            { value: 'assertTitle', label: 'Assert Title', needsValue: true, needsLocator: false, icon: '📋', desc: 'Verify page title' },
        ]
    },
    waits: {
        label: 'Waits',
        icon: lucide_react_1.Clock,
        color: 'orange',
        actions: [
            { value: 'wait', label: 'Wait (seconds)', needsValue: true, needsLocator: false, icon: '⏱️', desc: 'Wait for duration' },
            { value: 'waitForElement', label: 'Wait for Element', needsValue: false, needsLocator: true, icon: '⌛', desc: 'Wait for element' },
            { value: 'waitForText', label: 'Wait for Text', needsValue: true, needsLocator: true, icon: '📝', desc: 'Wait for text' },
        ]
    },
    advanced: {
        label: 'Advanced',
        icon: lucide_react_1.Code,
        color: 'red',
        actions: [
            { value: 'executeScript', label: 'Execute JavaScript', needsValue: true, needsLocator: false, icon: '⚡', desc: 'Run JS code' },
            { value: 'screenshot', label: 'Take Screenshot', needsValue: true, needsLocator: false, icon: '📷', desc: 'Capture screenshot' },
            { value: 'scroll', label: 'Scroll', needsValue: true, needsLocator: false, icon: '📜', desc: 'Scroll page' },
            { value: 'scrollToElement', label: 'Scroll to Element', needsValue: false, needsLocator: true, icon: '🎯', desc: 'Scroll to element' },
            { value: 'dragDrop', label: 'Drag and Drop', needsValue: true, needsLocator: true, icon: '🔀', desc: 'Drag and drop' },
            { value: 'switchTab', label: 'Switch Tab', needsValue: true, needsLocator: false, icon: '🔄', desc: 'Switch browser tab' },
            { value: 'switchFrame', label: 'Switch Frame', needsValue: false, needsLocator: true, icon: '🖼️', desc: 'Switch to iframe' },
            { value: 'handleAlert', label: 'Handle Alert', needsValue: true, needsLocator: false, icon: '⚠️', desc: 'Accept/dismiss alert' },
            { value: 'extractText', label: 'Extract Text', needsValue: true, needsLocator: true, icon: '📤', desc: 'Extract text to variable' },
            { value: 'extractAttribute', label: 'Extract Attribute', needsValue: true, needsLocator: true, icon: '🏷️', desc: 'Extract attribute' },
        ]
    }
};
const LOCATOR_STRATEGIES = [
    { value: 'css', label: 'CSS Selector', icon: '🎨', color: 'blue' },
    { value: 'xpath', label: 'XPath', icon: '🔍', color: 'green' },
    { value: 'id', label: 'ID', icon: '#️⃣', color: 'purple' },
    { value: 'name', label: 'Name', icon: '📛', color: 'yellow' },
    { value: 'text', label: 'Text Content', icon: '📝', color: 'orange' },
    { value: 'dataTestId', label: 'Data Test ID', icon: '🏷️', color: 'pink' },
];
const StepEditor = ({ step, onSave, onCancel, variables = [] }) => {
    const [formData, setFormData] = (0, react_1.useState)({
        id: '',
        action: 'navigate',
        enabled: true,
    });
    const [activeCategory, setActiveCategory] = (0, react_1.useState)('navigation');
    (0, react_1.useEffect)(() => {
        if (step) {
            setFormData(step);
            // Find category for this action
            Object.entries(ACTION_CATEGORIES).forEach(([catKey, category]) => {
                if (category.actions.some(a => a.value === step.action)) {
                    setActiveCategory(catKey);
                }
            });
        }
        else {
            setFormData({
                id: Date.now().toString(),
                action: 'navigate',
                enabled: true,
            });
        }
    }, [step]);
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };
    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const getAllActions = () => {
        return Object.values(ACTION_CATEGORIES).flatMap(cat => cat.actions);
    };
    const currentAction = getAllActions().find(a => a.value === formData.action);
    const category = ACTION_CATEGORIES[activeCategory];
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-300", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-white bg-opacity-20 p-2 rounded-lg", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Wand2, { className: "w-5 h-5 text-white" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold text-white", children: step ? 'Edit Test Step' : 'Create New Step' }), (0, jsx_runtime_1.jsx)("p", { className: "text-primary-100 text-sm", children: "Configure your test action" })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onCancel, className: "p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-5 h-5 text-white" }) })] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "flex flex-col h-[calc(90vh-5rem)]", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-1 overflow-y-auto scrollbar-thin", children: (0, jsx_runtime_1.jsxs)("div", { className: "p-6 space-y-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "card", children: (0, jsx_runtime_1.jsxs)("div", { className: "card-body", children: [(0, jsx_runtime_1.jsxs)("label", { className: "label flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { className: "w-4 h-4" }), "Step Description (Optional)"] }), (0, jsx_runtime_1.jsx)("input", { type: "text", className: "input", placeholder: "e.g., Login with valid credentials", value: formData.description || '', onChange: (e) => updateField('description', e.target.value) }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 text-xs mt-1", children: "Human-readable description of what this step does" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "card", children: [(0, jsx_runtime_1.jsx)("div", { className: "card-header", children: (0, jsx_runtime_1.jsxs)("h3", { className: "text-lg font-semibold text-gray-900 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.MousePointer, { className: "w-5 h-5" }), "Select Action"] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "card-body", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex gap-2 mb-4 flex-wrap", children: Object.entries(ACTION_CATEGORIES).map(([key, cat]) => ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setActiveCategory(key), className: `px-4 py-2 rounded-lg font-medium transition-all ${activeCategory === key
                                                                ? `bg-${cat.color}-600 text-white`
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: cat.label }, key))) }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 gap-3", children: category.actions.map((action) => ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => updateField('action', action.value), className: `p-4 rounded-xl border-2 transition-all text-left ${formData.action === action.value
                                                                ? 'border-primary-500 bg-primary-900 bg-opacity-20'
                                                                : 'border-gray-300 bg-gray-100 hover:border-gray-400 hover:bg-gray-150'}`, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-3", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-2xl", children: action.icon }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "font-semibold text-gray-900", children: action.label }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-600 mt-1", children: action.desc })] }), formData.action === action.value && ((0, jsx_runtime_1.jsx)(lucide_react_1.Check, { className: "w-5 h-5 text-primary-500 flex-shrink-0" }))] }) }, action.value))) })] })] }), currentAction?.needsLocator && ((0, jsx_runtime_1.jsxs)("div", { className: "card", children: [(0, jsx_runtime_1.jsx)("div", { className: "card-header", children: (0, jsx_runtime_1.jsxs)("h3", { className: "text-lg font-semibold text-gray-900 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { className: "w-5 h-5" }), "Element Locator"] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "card-body space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "label", children: "Locator Strategy" }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-3 gap-2", children: LOCATOR_STRATEGIES.map((strategy) => ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => updateField('customProperties', {
                                                                        ...formData.customProperties,
                                                                        locatorStrategy: strategy.value
                                                                    }), className: `p-3 rounded-lg border transition-all ${formData.customProperties?.locatorStrategy === strategy.value
                                                                        ? 'border-primary-500 bg-primary-900 bg-opacity-20'
                                                                        : 'border-gray-300 bg-gray-100 hover:border-gray-400'}`, children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xl mb-1", children: strategy.icon }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs font-medium text-gray-800", children: strategy.label })] }) }, strategy.value))) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "label", children: "Locator Value" }), (0, jsx_runtime_1.jsx)("input", { type: "text", className: "input font-mono text-sm", placeholder: "e.g., #username, //button[@type='submit']", value: formData.locator || '', onChange: (e) => updateField('locator', e.target.value), required: currentAction.needsLocator }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 text-xs mt-1", children: "Enter the element selector or locator" })] })] })] })), currentAction?.needsValue && ((0, jsx_runtime_1.jsxs)("div", { className: "card", children: [(0, jsx_runtime_1.jsx)("div", { className: "card-header", children: (0, jsx_runtime_1.jsxs)("h3", { className: "text-lg font-semibold text-gray-900 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Keyboard, { className: "w-5 h-5" }), "Value / Input"] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "card-body", children: [(0, jsx_runtime_1.jsx)("label", { className: "label", children: "Value" }), (0, jsx_runtime_1.jsx)("textarea", { className: "textarea", rows: 3, placeholder: "Enter value or input...", value: formData.value || '', onChange: (e) => updateField('value', e.target.value), required: currentAction.needsValue }), variables.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-2", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-600 mb-2", children: "Available variables:" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-1", children: variables.map((v) => ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => updateField('value', (formData.value || '') + `{{${v}}}`), className: "px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-400 text-gray-700", children: `{{${v}}}` }, v))) })] }))] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "card", children: [(0, jsx_runtime_1.jsx)("div", { className: "card-header", children: (0, jsx_runtime_1.jsxs)("h3", { className: "text-lg font-semibold text-gray-900 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Code, { className: "w-5 h-5" }), "Advanced Options"] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "card-body space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "label", children: "Timeout (ms)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", className: "input", placeholder: "30000", value: formData.timeout || '', onChange: (e) => updateField('timeout', parseInt(e.target.value) || undefined) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "label", children: "Screenshot Name" }), (0, jsx_runtime_1.jsx)("input", { type: "text", className: "input", placeholder: "Optional", value: formData.screenshot || '', onChange: (e) => updateField('screenshot', e.target.value) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4", children: [(0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 cursor-pointer", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: formData.scrollIntoView || false, onChange: (e) => updateField('scrollIntoView', e.target.checked), className: "w-4 h-4 text-primary-600 bg-gray-100 border-gray-400 rounded focus:ring-primary-500" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-700", children: "Scroll element into view" })] }), (0, jsx_runtime_1.jsxs)("label", { className: "flex items-center gap-2 cursor-pointer", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: formData.enabled !== false, onChange: (e) => updateField('enabled', e.target.checked), className: "w-4 h-4 text-primary-600 bg-gray-100 border-gray-400 rounded focus:ring-primary-500" }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-700", children: "Step enabled" })] })] })] })] })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "border-t border-gray-200 px-6 py-4 bg-white flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: onCancel, className: "btn-secondary flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "w-4 h-4" }), "Cancel"] }), (0, jsx_runtime_1.jsxs)("button", { type: "submit", className: "btn-primary flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Check, { className: "w-4 h-4" }), step ? 'Update Step' : 'Add Step'] })] })] })] }) }));
};
exports.StepEditor = StepEditor;
//# sourceMappingURL=StepEditor.js.map