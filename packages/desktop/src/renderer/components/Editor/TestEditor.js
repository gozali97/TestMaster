"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestEditor = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const MonacoEditor_1 = require("./MonacoEditor");
const StepEditor_1 = require("./StepEditor");
const VariableManager_1 = require("./VariableManager");
require("./TestEditor.css");
const TestEditor = () => {
    const [view, setView] = (0, react_1.useState)('visual');
    const [steps, setSteps] = (0, react_1.useState)([
        { id: '1', action: 'navigate', value: 'https://example.com', description: 'Navigate to website', enabled: true },
        { id: '2', action: 'click', locator: '#login-button', description: 'Click login button', enabled: true },
    ]);
    const [variables, setVariables] = (0, react_1.useState)([]);
    const [scriptCode, setScriptCode] = (0, react_1.useState)(generateScript(steps, variables));
    const [editingStep, setEditingStep] = (0, react_1.useState)(null);
    const [showStepEditor, setShowStepEditor] = (0, react_1.useState)(false);
    const [showVariableManager, setShowVariableManager] = (0, react_1.useState)(false);
    function replaceVariables(text, vars) {
        let result = text;
        vars.forEach(v => {
            result = result.replace(new RegExp(`\\{\\{${v.name}\\}\\}`, 'g'), v.value);
        });
        return result;
    }
    function generateScript(steps, vars) {
        let script = `import { test, expect } from '@playwright/test';\n\n`;
        if (vars.length > 0) {
            script += `// Variables\n`;
            vars.forEach(v => {
                if (v.type === 'env') {
                    script += `const ${v.name} = process.env.${v.name};\n`;
                }
                else if (v.type === 'string') {
                    script += `const ${v.name} = '${v.value}';\n`;
                }
                else {
                    script += `const ${v.name} = ${v.value};\n`;
                }
            });
            script += `\n`;
        }
        script += `test('Test Case', async ({ page }) => {\n`;
        steps.filter(s => s.enabled !== false).forEach(step => {
            const value = step.value ? replaceVariables(step.value, vars) : '';
            const locator = step.locator ? replaceVariables(step.locator, vars) : '';
            if (step.description) {
                script += `  // ${step.description}\n`;
            }
            switch (step.action) {
                case 'navigate':
                    script += `  await page.goto('${value}');\n`;
                    break;
                case 'click':
                    script += `  await page.click('${locator}');\n`;
                    break;
                case 'doubleClick':
                    script += `  await page.dblclick('${locator}');\n`;
                    break;
                case 'rightClick':
                    script += `  await page.click('${locator}', { button: 'right' });\n`;
                    break;
                case 'hover':
                    script += `  await page.hover('${locator}');\n`;
                    break;
                case 'type':
                case 'fill':
                    script += `  await page.fill('${locator}', '${value}');\n`;
                    break;
                case 'clear':
                    script += `  await page.fill('${locator}', '');\n`;
                    break;
                case 'press':
                    script += `  await page.keyboard.press('${value}');\n`;
                    break;
                case 'select':
                    script += `  await page.selectOption('${locator}', '${value}');\n`;
                    break;
                case 'check':
                    script += `  await page.check('${locator}');\n`;
                    break;
                case 'uncheck':
                    script += `  await page.uncheck('${locator}');\n`;
                    break;
                case 'upload':
                    script += `  await page.setInputFiles('${locator}', '${value}');\n`;
                    break;
                case 'wait':
                    script += `  await page.waitForTimeout(${value});\n`;
                    break;
                case 'waitForElement':
                    script += `  await page.waitForSelector('${locator}', { state: '${step.waitCondition || 'visible'}' });\n`;
                    break;
                case 'screenshot':
                    script += `  await page.screenshot({ path: '${value}.png' });\n`;
                    break;
                case 'assert':
                    script += `  await expect(page.locator('${locator}')).toBeVisible();\n`;
                    break;
                case 'assertText':
                    script += `  await expect(page.locator('${locator}')).toHaveText('${value}');\n`;
                    break;
                case 'assertValue':
                    script += `  await expect(page.locator('${locator}')).toHaveValue('${value}');\n`;
                    break;
                case 'executeScript':
                    script += `  await page.evaluate(() => { ${value} });\n`;
                    break;
                case 'refresh':
                    script += `  await page.reload();\n`;
                    break;
                case 'goBack':
                    script += `  await page.goBack();\n`;
                    break;
                case 'goForward':
                    script += `  await page.goForward();\n`;
                    break;
            }
        });
        script += `});\n`;
        return script;
    }
    const openAddStepEditor = () => {
        setEditingStep(null);
        setShowStepEditor(true);
    };
    const openEditStepEditor = (step) => {
        setEditingStep(step);
        setShowStepEditor(true);
    };
    const handleSaveStep = (step) => {
        if (editingStep) {
            const newSteps = steps.map(s => s.id === step.id ? step : s);
            setSteps(newSteps);
            setScriptCode(generateScript(newSteps, variables));
        }
        else {
            const newSteps = [...steps, step];
            setSteps(newSteps);
            setScriptCode(generateScript(newSteps, variables));
        }
        setShowStepEditor(false);
        setEditingStep(null);
    };
    const deleteStep = (id) => {
        const newSteps = steps.filter(s => s.id !== id);
        setSteps(newSteps);
        setScriptCode(generateScript(newSteps, variables));
    };
    const duplicateStep = (step) => {
        const newStep = { ...step, id: Date.now().toString() };
        const index = steps.findIndex(s => s.id === step.id);
        const newSteps = [...steps.slice(0, index + 1), newStep, ...steps.slice(index + 1)];
        setSteps(newSteps);
        setScriptCode(generateScript(newSteps, variables));
    };
    const moveStep = (id, direction) => {
        const index = steps.findIndex(s => s.id === id);
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === steps.length - 1)) {
            return;
        }
        const newSteps = [...steps];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
        setSteps(newSteps);
        setScriptCode(generateScript(newSteps, variables));
    };
    const toggleStepEnabled = (id) => {
        const newSteps = steps.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
        setSteps(newSteps);
        setScriptCode(generateScript(newSteps, variables));
    };
    const handleUpdateVariables = (newVars) => {
        setVariables(newVars);
        setScriptCode(generateScript(steps, newVars));
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "test-editor", children: [(0, jsx_runtime_1.jsxs)("div", { className: "editor-toolbar", children: [(0, jsx_runtime_1.jsxs)("div", { className: "view-toggle", children: [(0, jsx_runtime_1.jsx)("button", { className: view === 'visual' ? 'active' : '', onClick: () => setView('visual'), children: "Visual Editor" }), (0, jsx_runtime_1.jsx)("button", { className: view === 'script' ? 'active' : '', onClick: () => setView('script'), children: "Script View" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "btn-primary", onClick: openAddStepEditor, children: "+ Add Step" }), (0, jsx_runtime_1.jsxs)("button", { className: "btn-secondary", onClick: () => setShowVariableManager(true), children: ["Variables (", variables.length, ")"] }), (0, jsx_runtime_1.jsx)("button", { className: "btn-secondary", children: "Run Test" }), (0, jsx_runtime_1.jsx)("button", { className: "btn-secondary", children: "Save" })] })] }), view === 'visual' ? ((0, jsx_runtime_1.jsx)("div", { className: "visual-editor", children: (0, jsx_runtime_1.jsxs)("div", { className: "steps-list", children: [steps.map((step, index) => ((0, jsx_runtime_1.jsxs)("div", { className: `step-item ${step.enabled === false ? 'disabled' : ''}`, children: [(0, jsx_runtime_1.jsx)("div", { className: "step-number", children: index + 1 }), (0, jsx_runtime_1.jsxs)("div", { className: "step-content", onClick: () => openEditStepEditor(step), children: [(0, jsx_runtime_1.jsxs)("div", { className: "step-header", children: [(0, jsx_runtime_1.jsx)("span", { className: "step-action", children: step.action }), step.enabled === false && (0, jsx_runtime_1.jsx)("span", { className: "disabled-badge", children: "DISABLED" })] }), step.description && (0, jsx_runtime_1.jsx)("div", { className: "step-description", children: step.description }), step.locator && (0, jsx_runtime_1.jsxs)("div", { className: "step-locator", children: ["\uD83C\uDFAF ", step.locator] }), step.value && (0, jsx_runtime_1.jsxs)("div", { className: "step-value", children: ["\uD83D\uDCDD ", step.value] }), step.timeout && step.timeout !== 30000 && ((0, jsx_runtime_1.jsxs)("div", { className: "step-timeout", children: ["\u23F1\uFE0F ", step.timeout, "ms"] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "step-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "btn-icon", onClick: (e) => { e.stopPropagation(); moveStep(step.id, 'up'); }, disabled: index === 0, title: "Move up", children: "\u2B06\uFE0F" }), (0, jsx_runtime_1.jsx)("button", { className: "btn-icon", onClick: (e) => { e.stopPropagation(); moveStep(step.id, 'down'); }, disabled: index === steps.length - 1, title: "Move down", children: "\u2B07\uFE0F" }), (0, jsx_runtime_1.jsx)("button", { className: "btn-icon", onClick: (e) => { e.stopPropagation(); duplicateStep(step); }, title: "Duplicate", children: "\uD83D\uDCCB" }), (0, jsx_runtime_1.jsx)("button", { className: "btn-icon", onClick: (e) => { e.stopPropagation(); toggleStepEnabled(step.id); }, title: step.enabled === false ? 'Enable' : 'Disable', children: step.enabled === false ? '👁️' : '🚫' }), (0, jsx_runtime_1.jsx)("button", { className: "btn-icon btn-delete", onClick: (e) => { e.stopPropagation(); deleteStep(step.id); }, title: "Delete", children: "\uD83D\uDDD1\uFE0F" })] })] }, step.id))), steps.length === 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "empty-state", children: [(0, jsx_runtime_1.jsx)("p", { children: "No steps added yet" }), (0, jsx_runtime_1.jsx)("p", { children: "Click \"Add Step\" to create your first test step" })] }))] }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "script-editor", children: (0, jsx_runtime_1.jsx)(MonacoEditor_1.MonacoEditor, { value: scriptCode, onChange: setScriptCode, language: "javascript", theme: "vs-dark" }) })), showStepEditor && ((0, jsx_runtime_1.jsx)(StepEditor_1.StepEditor, { step: editingStep, onSave: handleSaveStep, onCancel: () => {
                    setShowStepEditor(false);
                    setEditingStep(null);
                }, variables: variables.map(v => v.name) })), showVariableManager && ((0, jsx_runtime_1.jsx)(VariableManager_1.VariableManager, { variables: variables, onUpdate: handleUpdateVariables, onClose: () => setShowVariableManager(false) }))] }));
};
exports.TestEditor = TestEditor;
//# sourceMappingURL=TestEditor.js.map