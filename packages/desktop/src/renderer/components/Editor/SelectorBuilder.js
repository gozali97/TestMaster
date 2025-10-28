"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectorBuilder = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
require("./SelectorBuilder.css");
const SelectorBuilder = ({ initialSelector = '', onSave, onCancel }) => {
    const [strategy, setStrategy] = (0, react_1.useState)('css');
    const [value, setValue] = (0, react_1.useState)(initialSelector);
    const [attributeName, setAttributeName] = (0, react_1.useState)('');
    const [attributeValue, setAttributeValue] = (0, react_1.useState)('');
    const [textContent, setTextContent] = (0, react_1.useState)('');
    const [role, setRole] = (0, react_1.useState)('');
    const [preview, setPreview] = (0, react_1.useState)(initialSelector);
    const generateSelector = () => {
        let selector = '';
        switch (strategy) {
            case 'css':
                selector = value;
                break;
            case 'xpath':
                selector = value;
                break;
            case 'id':
                selector = `#${value}`;
                break;
            case 'class':
                selector = `.${value}`;
                break;
            case 'name':
                selector = `[name="${value}"]`;
                break;
            case 'tag':
                selector = value;
                break;
            case 'text':
                selector = `text=${textContent}`;
                break;
            case 'placeholder':
                selector = `[placeholder="${value}"]`;
                break;
            case 'testid':
                selector = `[data-testid="${value}"]`;
                break;
            case 'role':
                selector = `role=${role}`;
                break;
            case 'attribute':
                selector = `[${attributeName}="${attributeValue}"]`;
                break;
            case 'contains':
                selector = `text*=${textContent}`;
                break;
            case 'starts':
                selector = `text^=${textContent}`;
                break;
            case 'ends':
                selector = `text$=${textContent}`;
                break;
        }
        setPreview(selector);
    };
    const handleSave = () => {
        onSave(preview || value);
    };
    const commonSelectors = [
        { label: 'Submit Button', value: 'button[type="submit"]' },
        { label: 'First Input', value: 'input:first-of-type' },
        { label: 'Login Form', value: 'form[name="login"]' },
        { label: 'Main Content', value: 'main, #main, [role="main"]' },
        { label: 'Navigation', value: 'nav, [role="navigation"]' },
        { label: 'Modal Dialog', value: '[role="dialog"]' },
    ];
    return ((0, jsx_runtime_1.jsx)("div", { className: "selector-builder-overlay", onClick: onCancel, children: (0, jsx_runtime_1.jsxs)("div", { className: "selector-builder-modal", onClick: (e) => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "selector-builder-header", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Element Selector Builder" }), (0, jsx_runtime_1.jsx)("button", { className: "close-btn", onClick: onCancel, children: "\u00D7" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "selector-builder-content", children: [(0, jsx_runtime_1.jsxs)("div", { className: "strategy-selector", children: [(0, jsx_runtime_1.jsx)("label", { children: "Selector Strategy:" }), (0, jsx_runtime_1.jsxs)("select", { value: strategy, onChange: (e) => setStrategy(e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "css", children: "CSS Selector" }), (0, jsx_runtime_1.jsx)("option", { value: "xpath", children: "XPath" }), (0, jsx_runtime_1.jsx)("option", { value: "id", children: "ID" }), (0, jsx_runtime_1.jsx)("option", { value: "class", children: "Class Name" }), (0, jsx_runtime_1.jsx)("option", { value: "name", children: "Name Attribute" }), (0, jsx_runtime_1.jsx)("option", { value: "tag", children: "Tag Name" }), (0, jsx_runtime_1.jsx)("option", { value: "text", children: "Exact Text" }), (0, jsx_runtime_1.jsx)("option", { value: "contains", children: "Contains Text" }), (0, jsx_runtime_1.jsx)("option", { value: "starts", children: "Starts With Text" }), (0, jsx_runtime_1.jsx)("option", { value: "ends", children: "Ends With Text" }), (0, jsx_runtime_1.jsx)("option", { value: "placeholder", children: "Placeholder" }), (0, jsx_runtime_1.jsx)("option", { value: "testid", children: "Test ID (data-testid)" }), (0, jsx_runtime_1.jsx)("option", { value: "role", children: "ARIA Role" }), (0, jsx_runtime_1.jsx)("option", { value: "attribute", children: "Custom Attribute" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "selector-input-section", children: [(strategy === 'css' || strategy === 'xpath') && ((0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsxs)("label", { children: [strategy === 'css' ? 'CSS Selector' : 'XPath', ":"] }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: value, onChange: (e) => setValue(e.target.value), placeholder: strategy === 'css' ? '#myButton.primary' : '//button[@id="submit"]' })] })), ['id', 'class', 'name', 'tag', 'placeholder', 'testid'].includes(strategy) && ((0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsxs)("label", { children: [strategy === 'id' && 'Element ID:', strategy === 'class' && 'Class Name:', strategy === 'name' && 'Name Attribute:', strategy === 'tag' && 'Tag Name:', strategy === 'placeholder' && 'Placeholder Text:', strategy === 'testid' && 'Test ID:'] }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: value, onChange: (e) => setValue(e.target.value), placeholder: strategy === 'id' ? 'submit-button' :
                                                strategy === 'class' ? 'btn-primary' :
                                                    strategy === 'name' ? 'username' :
                                                        strategy === 'tag' ? 'button' :
                                                            strategy === 'placeholder' ? 'Enter your email' :
                                                                'user-login-btn' })] })), ['text', 'contains', 'starts', 'ends'].includes(strategy) && ((0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Text Content:" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: textContent, onChange: (e) => setTextContent(e.target.value), placeholder: "Click here" })] })), strategy === 'role' && ((0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "ARIA Role:" }), (0, jsx_runtime_1.jsxs)("select", { value: role, onChange: (e) => setRole(e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Select role..." }), (0, jsx_runtime_1.jsx)("option", { value: "button", children: "button" }), (0, jsx_runtime_1.jsx)("option", { value: "link", children: "link" }), (0, jsx_runtime_1.jsx)("option", { value: "textbox", children: "textbox" }), (0, jsx_runtime_1.jsx)("option", { value: "checkbox", children: "checkbox" }), (0, jsx_runtime_1.jsx)("option", { value: "radio", children: "radio" }), (0, jsx_runtime_1.jsx)("option", { value: "navigation", children: "navigation" }), (0, jsx_runtime_1.jsx)("option", { value: "main", children: "main" }), (0, jsx_runtime_1.jsx)("option", { value: "dialog", children: "dialog" }), (0, jsx_runtime_1.jsx)("option", { value: "alert", children: "alert" }), (0, jsx_runtime_1.jsx)("option", { value: "menu", children: "menu" }), (0, jsx_runtime_1.jsx)("option", { value: "menuitem", children: "menuitem" }), (0, jsx_runtime_1.jsx)("option", { value: "tab", children: "tab" }), (0, jsx_runtime_1.jsx)("option", { value: "tabpanel", children: "tabpanel" })] })] })), strategy === 'attribute' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Attribute Name:" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: attributeName, onChange: (e) => setAttributeName(e.target.value), placeholder: "data-action" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Attribute Value:" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: attributeValue, onChange: (e) => setAttributeValue(e.target.value), placeholder: "submit" })] })] })), (0, jsx_runtime_1.jsx)("button", { className: "btn-generate", onClick: generateSelector, children: "Generate Selector" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "selector-preview", children: [(0, jsx_runtime_1.jsx)("label", { children: "Generated Selector:" }), (0, jsx_runtime_1.jsx)("div", { className: "preview-box", children: (0, jsx_runtime_1.jsx)("code", { children: preview || 'Click "Generate Selector" to see preview' }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "common-selectors", children: [(0, jsx_runtime_1.jsx)("label", { children: "Common Selectors:" }), (0, jsx_runtime_1.jsx)("div", { className: "selector-chips", children: commonSelectors.map((sel, idx) => ((0, jsx_runtime_1.jsx)("button", { className: "chip", onClick: () => {
                                            setValue(sel.value);
                                            setPreview(sel.value);
                                        }, children: sel.label }, idx))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "selector-tips", children: [(0, jsx_runtime_1.jsx)("h4", { children: "\uD83D\uDCA1 Tips:" }), (0, jsx_runtime_1.jsxs)("ul", { children: [(0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "CSS:" }), " Use for standard web selectors like #id, .class, tag[attr]"] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "XPath:" }), " Use for complex DOM navigation like //div[@class=\"item\"][2]"] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Text:" }), " Most reliable for buttons and links with stable text"] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Test ID:" }), " Best practice - add data-testid to your elements"] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Role:" }), " Accessibility-first approach using ARIA roles"] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "selector-builder-footer", children: [(0, jsx_runtime_1.jsx)("button", { className: "btn-cancel", onClick: onCancel, children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { className: "btn-save", onClick: handleSave, children: "Use This Selector" })] })] }) }));
};
exports.SelectorBuilder = SelectorBuilder;
//# sourceMappingURL=SelectorBuilder.js.map