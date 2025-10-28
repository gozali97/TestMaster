"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCaseList = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_service_1 = require("../../services/api.service");
require("./TestCaseList.css");
const TestCaseList = ({ projectId, onSelectTest, onBack }) => {
    const [testCases, setTestCases] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)('');
    const [projectName, setProjectName] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        loadTestCases();
        loadProject();
    }, [projectId]);
    const loadProject = async () => {
        const result = await api_service_1.ApiService.getProject(projectId);
        if (result.success && result.data) {
            setProjectName(result.data.name);
        }
    };
    const loadTestCases = async () => {
        setLoading(true);
        setError('');
        const result = await api_service_1.ApiService.getTestCases(projectId);
        if (result.success && result.data) {
            setTestCases(result.data);
        }
        else {
            setError(result.error || 'Failed to load test cases');
        }
        setLoading(false);
    };
    const handleCreateNew = () => {
        // Create new test case with null ID
        onSelectTest(0); // 0 or null means create new
    };
    const handleDelete = async (testId, testName) => {
        if (!confirm(`Delete test case "${testName}"? This action cannot be undone.`)) {
            return;
        }
        const result = await api_service_1.ApiService.deleteTestCase(projectId, testId);
        if (result.success) {
            loadTestCases();
        }
        else {
            alert('Failed to delete test case: ' + (result.error || 'Unknown error'));
        }
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "test-case-list loading", children: [(0, jsx_runtime_1.jsx)("div", { className: "spinner" }), (0, jsx_runtime_1.jsx)("p", { children: "Loading test cases..." })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "test-case-list", children: [(0, jsx_runtime_1.jsxs)("div", { className: "header", children: [(0, jsx_runtime_1.jsx)("button", { className: "back-btn", onClick: onBack, children: "\u2190 Back to Projects" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { children: projectName }), (0, jsx_runtime_1.jsx)("p", { className: "subtitle", children: "Test Cases" })] }), (0, jsx_runtime_1.jsx)("button", { className: "btn-create", onClick: handleCreateNew, children: "+ New Test Case" })] }), error && ((0, jsx_runtime_1.jsxs)("div", { className: "error-message", children: [error, (0, jsx_runtime_1.jsx)("button", { onClick: loadTestCases, children: "Retry" })] })), (0, jsx_runtime_1.jsx)("div", { className: "test-cases-grid", children: testCases.map((testCase) => ((0, jsx_runtime_1.jsxs)("div", { className: "test-case-card", children: [(0, jsx_runtime_1.jsxs)("div", { className: "test-case-content", onClick: () => onSelectTest(testCase.id), children: [(0, jsx_runtime_1.jsx)("h3", { children: testCase.name }), (0, jsx_runtime_1.jsx)("p", { className: "description", children: testCase.description || 'No description' }), (0, jsx_runtime_1.jsxs)("div", { className: "test-case-meta", children: [(0, jsx_runtime_1.jsxs)("span", { className: "steps-count", children: [testCase.steps?.length || 0, " steps"] }), testCase.variables && testCase.variables.length > 0 && ((0, jsx_runtime_1.jsxs)("span", { className: "variables-count", children: [testCase.variables.length, " variables"] })), (0, jsx_runtime_1.jsx)("span", { className: `status ${testCase.status?.toLowerCase()}`, children: testCase.status || 'DRAFT' })] }), testCase.createdAt && ((0, jsx_runtime_1.jsxs)("div", { className: "test-case-date", children: ["Created: ", new Date(testCase.createdAt).toLocaleDateString()] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "test-case-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "btn-icon", onClick: (e) => {
                                        e.stopPropagation();
                                        onSelectTest(testCase.id);
                                    }, title: "Edit test case", children: "\u270F\uFE0F" }), (0, jsx_runtime_1.jsx)("button", { className: "btn-icon btn-delete", onClick: (e) => {
                                        e.stopPropagation();
                                        handleDelete(testCase.id, testCase.name);
                                    }, title: "Delete test case", children: "\uD83D\uDDD1\uFE0F" })] })] }, testCase.id))) }), testCases.length === 0 && !error && ((0, jsx_runtime_1.jsxs)("div", { className: "empty-state", children: [(0, jsx_runtime_1.jsx)("div", { className: "empty-icon", children: "\uD83D\uDCDD" }), (0, jsx_runtime_1.jsx)("p", { children: "No test cases yet" }), (0, jsx_runtime_1.jsx)("button", { className: "btn-create-large", onClick: handleCreateNew, children: "Create Your First Test Case" })] }))] }));
};
exports.TestCaseList = TestCaseList;
//# sourceMappingURL=TestCaseList.js.map