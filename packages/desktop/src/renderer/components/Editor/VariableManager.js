"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariableManager = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
require("./VariableManager.css");
const VariableManager = ({ variables, onUpdate, onClose }) => {
    const [localVars, setLocalVars] = (0, react_1.useState)(variables);
    const [editingId, setEditingId] = (0, react_1.useState)(null);
    const [newVar, setNewVar] = (0, react_1.useState)({
        name: '',
        value: '',
        type: 'string',
        description: '',
    });
    const addVariable = () => {
        if (!newVar.name || !newVar.value) {
            alert('Name and value are required');
            return;
        }
        if (localVars.some(v => v.name === newVar.name)) {
            alert('Variable name already exists');
            return;
        }
        const variable = {
            id: Date.now().toString(),
            name: newVar.name,
            value: newVar.value,
            type: newVar.type || 'string',
            description: newVar.description,
        };
        setLocalVars([...localVars, variable]);
        setNewVar({ name: '', value: '', type: 'string', description: '' });
    };
    const deleteVariable = (id) => {
        setLocalVars(localVars.filter(v => v.id !== id));
    };
    const updateVariable = (id, updates) => {
        setLocalVars(localVars.map(v => v.id === id ? { ...v, ...updates } : v));
        setEditingId(null);
    };
    const handleSave = () => {
        onUpdate(localVars);
        onClose();
    };
    const presetVariables = [
        { name: 'BASE_URL', value: 'https://example.com', type: 'string' },
        { name: 'USERNAME', value: 'testuser@example.com', type: 'string' },
        { name: 'PASSWORD', value: 'TestPass123!', type: 'string' },
        { name: 'TIMEOUT', value: '30000', type: 'number' },
        { name: 'API_KEY', value: 'sk_test_...', type: 'env' },
    ];
    return ((0, jsx_runtime_1.jsx)("div", { className: "variable-manager-overlay", onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { className: "variable-manager-modal", onClick: (e) => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "variable-manager-header", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Variable Manager" }), (0, jsx_runtime_1.jsx)("button", { className: "close-btn", onClick: onClose, children: "\u00D7" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "variable-manager-content", children: [(0, jsx_runtime_1.jsxs)("div", { className: "add-variable-section", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Add New Variable" }), (0, jsx_runtime_1.jsxs)("div", { className: "add-variable-form", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Variable name (e.g., USERNAME)", value: newVar.name || '', onChange: (e) => setNewVar({ ...newVar, name: e.target.value }) }), (0, jsx_runtime_1.jsxs)("select", { value: newVar.type || 'string', onChange: (e) => setNewVar({ ...newVar, type: e.target.value }), children: [(0, jsx_runtime_1.jsx)("option", { value: "string", children: "String" }), (0, jsx_runtime_1.jsx)("option", { value: "number", children: "Number" }), (0, jsx_runtime_1.jsx)("option", { value: "boolean", children: "Boolean" }), (0, jsx_runtime_1.jsx)("option", { value: "env", children: "Environment" })] }), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Value", value: newVar.value || '', onChange: (e) => setNewVar({ ...newVar, value: e.target.value }) }), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Description (optional)", value: newVar.description || '', onChange: (e) => setNewVar({ ...newVar, description: e.target.value }) }), (0, jsx_runtime_1.jsx)("button", { className: "btn-add", onClick: addVariable, children: "Add Variable" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "preset-variables", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Quick Add Presets:" }), (0, jsx_runtime_1.jsx)("div", { className: "preset-chips", children: presetVariables.map((preset, idx) => ((0, jsx_runtime_1.jsxs)("button", { className: "preset-chip", onClick: () => {
                                            if (!localVars.some(v => v.name === preset.name)) {
                                                setLocalVars([...localVars, {
                                                        id: Date.now().toString(),
                                                        ...preset,
                                                    }]);
                                            }
                                        }, children: ["+ ", preset.name] }, idx))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "variables-list", children: [(0, jsx_runtime_1.jsxs)("h4", { children: ["Variables (", localVars.length, ")"] }), localVars.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "empty-state", children: [(0, jsx_runtime_1.jsx)("p", { children: "No variables defined yet" }), (0, jsx_runtime_1.jsx)("p", { children: "Add variables to reuse values across test steps" })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "variables-table", children: localVars.map((variable) => ((0, jsx_runtime_1.jsx)("div", { className: "variable-row", children: editingId === variable.id ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: variable.name, onChange: (e) => updateVariable(variable.id, { name: e.target.value }), className: "edit-input" }), (0, jsx_runtime_1.jsxs)("select", { value: variable.type, onChange: (e) => updateVariable(variable.id, { type: e.target.value }), className: "edit-select", children: [(0, jsx_runtime_1.jsx)("option", { value: "string", children: "String" }), (0, jsx_runtime_1.jsx)("option", { value: "number", children: "Number" }), (0, jsx_runtime_1.jsx)("option", { value: "boolean", children: "Boolean" }), (0, jsx_runtime_1.jsx)("option", { value: "env", children: "Environment" })] }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: variable.value, onChange: (e) => updateVariable(variable.id, { value: e.target.value }), className: "edit-input" }), (0, jsx_runtime_1.jsx)("button", { className: "btn-save-edit", onClick: () => setEditingId(null), children: "\u2713" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "var-name", children: [(0, jsx_runtime_1.jsx)("code", { children: `{{${variable.name}}}` }), (0, jsx_runtime_1.jsx)("span", { className: "var-type", children: variable.type })] }), (0, jsx_runtime_1.jsx)("div", { className: "var-value", children: variable.type === 'env' ? '••••••••' : variable.value }), variable.description && ((0, jsx_runtime_1.jsx)("div", { className: "var-description", children: variable.description })), (0, jsx_runtime_1.jsxs)("div", { className: "var-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "btn-edit", onClick: () => setEditingId(variable.id), children: "\u270F\uFE0F" }), (0, jsx_runtime_1.jsx)("button", { className: "btn-delete", onClick: () => deleteVariable(variable.id), children: "\uD83D\uDDD1\uFE0F" })] })] })) }, variable.id))) }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "variable-usage", children: [(0, jsx_runtime_1.jsx)("h4", { children: "\uD83D\uDCDD How to use variables:" }), (0, jsx_runtime_1.jsxs)("ul", { children: [(0, jsx_runtime_1.jsxs)("li", { children: ["Use ", (0, jsx_runtime_1.jsx)("code", { children: `{{VARIABLE_NAME}}` }), " syntax in step values"] }), (0, jsx_runtime_1.jsxs)("li", { children: ["Example: Navigate to ", (0, jsx_runtime_1.jsx)("code", { children: `{{BASE_URL}}/login` })] }), (0, jsx_runtime_1.jsxs)("li", { children: ["Example: Type ", (0, jsx_runtime_1.jsx)("code", { children: `{{USERNAME}}` }), " in username field"] }), (0, jsx_runtime_1.jsx)("li", { children: "Environment variables are loaded from .env file" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "variable-manager-footer", children: [(0, jsx_runtime_1.jsx)("button", { className: "btn-cancel", onClick: onClose, children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { className: "btn-save", onClick: handleSave, children: "Save Variables" })] })] }) }));
};
exports.VariableManager = VariableManager;
//# sourceMappingURL=VariableManager.js.map