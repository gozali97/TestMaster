"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recorder = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
require("./Recorder.css");
const Recorder = () => {
    const [isRecording, setIsRecording] = (0, react_1.useState)(false);
    const [isPaused, setIsPaused] = (0, react_1.useState)(false);
    const [actions, setActions] = (0, react_1.useState)([]);
    const [selectedBrowser, setSelectedBrowser] = (0, react_1.useState)('chromium');
    const startRecording = async () => {
        setIsRecording(true);
        setIsPaused(false);
        setActions([]);
        // Simulate recording (in real implementation, this would launch Playwright)
        console.log('Starting recorder with browser:', selectedBrowser);
        // Mock some recorded actions
        setTimeout(() => {
            addAction('navigate', 'page', 'https://example.com');
        }, 1000);
    };
    const stopRecording = () => {
        setIsRecording(false);
        setIsPaused(false);
        console.log('Recording stopped');
    };
    const pauseRecording = () => {
        setIsPaused(!isPaused);
        console.log(isPaused ? 'Recording resumed' : 'Recording paused');
    };
    const addAction = (type, locator, value) => {
        const newAction = {
            id: Date.now().toString(),
            type,
            locator,
            value,
            timestamp: new Date(),
        };
        setActions(prev => [...prev, newAction]);
    };
    const deleteAction = (id) => {
        setActions(prev => prev.filter(a => a.id !== id));
    };
    const generateTestCase = () => {
        console.log('Generating test case from recorded actions:', actions);
        // In real implementation, this would create a test case
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "recorder", children: [(0, jsx_runtime_1.jsxs)("div", { className: "recorder-header", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Test Recorder" }), (0, jsx_runtime_1.jsx)("p", { children: "Record browser interactions to create automated tests" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "recorder-controls", children: [(0, jsx_runtime_1.jsxs)("div", { className: "browser-selector", children: [(0, jsx_runtime_1.jsx)("label", { children: "Browser:" }), (0, jsx_runtime_1.jsxs)("select", { value: selectedBrowser, onChange: (e) => setSelectedBrowser(e.target.value), disabled: isRecording, children: [(0, jsx_runtime_1.jsx)("option", { value: "chromium", children: "Chromium" }), (0, jsx_runtime_1.jsx)("option", { value: "firefox", children: "Firefox" }), (0, jsx_runtime_1.jsx)("option", { value: "webkit", children: "WebKit" })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "recording-controls", children: !isRecording ? ((0, jsx_runtime_1.jsxs)("button", { className: "btn-start", onClick: startRecording, children: [(0, jsx_runtime_1.jsx)("span", { className: "record-icon", children: "\u25CF" }), " Start Recording"] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { className: "btn-pause", onClick: pauseRecording, children: isPaused ? '▶ Resume' : '⏸ Pause' }), (0, jsx_runtime_1.jsx)("button", { className: "btn-stop", onClick: stopRecording, children: "\u23F9 Stop" })] })) }), isRecording && ((0, jsx_runtime_1.jsxs)("div", { className: "recording-status", children: [(0, jsx_runtime_1.jsx)("span", { className: `status-indicator ${isPaused ? 'paused' : 'recording'}` }), (0, jsx_runtime_1.jsx)("span", { children: isPaused ? 'Paused' : 'Recording...' })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "recorded-actions", children: [(0, jsx_runtime_1.jsxs)("div", { className: "actions-header", children: [(0, jsx_runtime_1.jsxs)("h3", { children: ["Recorded Actions (", actions.length, ")"] }), actions.length > 0 && ((0, jsx_runtime_1.jsx)("button", { className: "btn-generate", onClick: generateTestCase, children: "Generate Test Case" }))] }), actions.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "empty-state", children: [(0, jsx_runtime_1.jsx)("p", { children: "No actions recorded yet" }), (0, jsx_runtime_1.jsx)("p", { children: "Click \"Start Recording\" to begin capturing interactions" })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "actions-list", children: actions.map((action, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "action-item", children: [(0, jsx_runtime_1.jsx)("div", { className: "action-number", children: index + 1 }), (0, jsx_runtime_1.jsxs)("div", { className: "action-content", children: [(0, jsx_runtime_1.jsx)("div", { className: "action-type", children: action.type }), (0, jsx_runtime_1.jsx)("div", { className: "action-locator", children: action.locator }), action.value && (0, jsx_runtime_1.jsxs)("div", { className: "action-value", children: ["Value: ", action.value] }), (0, jsx_runtime_1.jsx)("div", { className: "action-time", children: action.timestamp.toLocaleTimeString() })] }), (0, jsx_runtime_1.jsx)("button", { className: "action-delete", onClick: () => deleteAction(action.id), children: "\u00D7" })] }, action.id))) }))] })] }));
};
exports.Recorder = Recorder;
//# sourceMappingURL=Recorder.js.map