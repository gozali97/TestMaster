"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestExecutionRunner = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_service_1 = require("../../services/api.service");
require("./TestExecutionRunner.css");
const TestExecutionRunner = () => {
    const [projects, setProjects] = (0, react_1.useState)([]);
    const [testCases, setTestCases] = (0, react_1.useState)([]);
    const [selectedProject, setSelectedProject] = (0, react_1.useState)(null);
    const [selectedTestCase, setSelectedTestCase] = (0, react_1.useState)(null);
    const [isExecuting, setIsExecuting] = (0, react_1.useState)(false);
    const [executionResult, setExecutionResult] = (0, react_1.useState)(null);
    const [executionLogs, setExecutionLogs] = (0, react_1.useState)([]);
    const [recordVideo, setRecordVideo] = (0, react_1.useState)(true); // Video recording enabled by default
    // Load projects on mount
    (0, react_1.useEffect)(() => {
        loadProjects();
    }, []);
    // Load test cases when project is selected
    (0, react_1.useEffect)(() => {
        if (selectedProject) {
            loadTestCases(selectedProject);
        }
        else {
            setTestCases([]);
            setSelectedTestCase(null);
        }
    }, [selectedProject]);
    const loadProjects = async () => {
        const result = await api_service_1.ApiService.getProjects();
        if (result.success && result.data) {
            setProjects(result.data);
        }
    };
    const loadTestCases = async (projectId) => {
        const result = await api_service_1.ApiService.getTestCases(projectId);
        if (result.success && result.data) {
            setTestCases(result.data);
        }
    };
    const executeTest = async () => {
        if (!selectedTestCase)
            return;
        setIsExecuting(true);
        setExecutionResult(null);
        setExecutionLogs(['🚀 Starting test execution...']);
        try {
            // Get test case details with steps
            // First we need to find which project this test belongs to
            const testCase = testCases.find(tc => tc.id === selectedTestCase);
            if (!testCase) {
                throw new Error('Test case not found');
            }
            const testResult = await api_service_1.ApiService.getTestCase(testCase.projectId, selectedTestCase);
            if (!testResult.success || !testResult.data) {
                throw new Error('Failed to load test case details');
            }
            const testCaseDetails = testResult.data;
            setExecutionLogs(prev => [...prev, `📝 Loaded test case: ${testCaseDetails.name}`]);
            setExecutionLogs(prev => [...prev, `📊 Steps to execute: ${testCaseDetails.steps?.length || 0}`]);
            // Execute test via API
            setExecutionLogs(prev => [...prev, '▶️  Executing test...']);
            if (recordVideo) {
                setExecutionLogs(prev => [...prev, '📹 Video recording enabled']);
            }
            const execResult = await api_service_1.ApiService.executeTest(testCase.projectId, selectedTestCase, {
                captureVideo: recordVideo,
                captureScreenshots: true,
                headless: false,
            });
            if (execResult.success && execResult.data?.runId) {
                const runId = execResult.data.runId;
                setExecutionLogs(prev => [...prev, `📋 Test run created: ${runId}`]);
                setExecutionLogs(prev => [...prev, '⏳ Waiting for execution to complete...']);
                // Poll for execution status
                let attempts = 0;
                const maxAttempts = 60; // 60 seconds timeout
                let executionComplete = false;
                while (attempts < maxAttempts && !executionComplete) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                    const statusResult = await api_service_1.ApiService.getExecutionResults(runId);
                    if (statusResult.success && statusResult.data) {
                        const status = statusResult.data.status;
                        if (status === 'PASSED' || status === 'FAILED' || status === 'ERROR') {
                            executionComplete = true;
                            setExecutionLogs(prev => [...prev, `✅ Execution completed with status: ${status}`]);
                            setExecutionResult({
                                id: runId,
                                testCaseId: selectedTestCase,
                                status: status.toLowerCase(),
                                startedAt: statusResult.data.startedAt || new Date().toISOString(),
                                completedAt: statusResult.data.completedAt || new Date().toISOString(),
                                duration: statusResult.data.duration || 0,
                                logs: statusResult.data.logs || [],
                                screenshots: statusResult.data.screenshots || [],
                                video: statusResult.data.video,
                            });
                        }
                        else {
                            setExecutionLogs(prev => [...prev, `⏳ Status: ${status}...`]);
                        }
                    }
                    attempts++;
                }
                if (!executionComplete) {
                    throw new Error('Execution timeout - please check the executions list');
                }
            }
            else {
                throw new Error(execResult.error || 'Failed to start execution');
            }
        }
        catch (error) {
            console.error('Test execution error:', error);
            setExecutionLogs(prev => [...prev, `❌ Error: ${error.message}`]);
            setExecutionResult({
                id: Date.now(),
                testCaseId: selectedTestCase,
                status: 'error',
                startedAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
                logs: executionLogs,
                error: error.message,
            });
        }
        finally {
            setIsExecuting(false);
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'running': return '⏳';
            case 'passed': return '✅';
            case 'failed': return '❌';
            case 'error': return '⚠️';
            default: return '•';
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'running': return '#FFA500';
            case 'passed': return '#4CAF50';
            case 'failed': return '#F44336';
            case 'error': return '#FF9800';
            default: return '#999';
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "test-execution-runner", children: [(0, jsx_runtime_1.jsxs)("div", { className: "execution-header", children: [(0, jsx_runtime_1.jsx)("h2", { children: "\u25B6\uFE0F Manual Test Execution" }), (0, jsx_runtime_1.jsx)("p", { children: "Select and execute test cases manually" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "execution-content", children: [(0, jsx_runtime_1.jsxs)("div", { className: "selection-panel", children: [(0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Select Project:" }), (0, jsx_runtime_1.jsxs)("select", { value: selectedProject || '', onChange: (e) => setSelectedProject(Number(e.target.value) || null), disabled: isExecuting, children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "-- Select Project --" }), projects.map(project => ((0, jsx_runtime_1.jsx)("option", { value: project.id, children: project.name }, project.id)))] })] }), selectedProject && ((0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "Select Test Case:" }), (0, jsx_runtime_1.jsxs)("select", { value: selectedTestCase || '', onChange: (e) => setSelectedTestCase(Number(e.target.value) || null), disabled: isExecuting, children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "-- Select Test Case --" }), testCases.map(test => ((0, jsx_runtime_1.jsx)("option", { value: test.id, children: test.name }, test.id)))] })] })), (0, jsx_runtime_1.jsx)("div", { className: "execution-options", children: (0, jsx_runtime_1.jsxs)("label", { className: "checkbox-label", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: recordVideo, onChange: (e) => setRecordVideo(e.target.checked), disabled: isExecuting }), (0, jsx_runtime_1.jsx)("span", { children: "\uD83D\uDCF9 Record Video (saved to Downloads/TestMaster-Videos)" })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "execution-actions", children: (0, jsx_runtime_1.jsx)("button", { className: "btn-execute", onClick: executeTest, disabled: !selectedTestCase || isExecuting, children: isExecuting ? '⏳ Executing...' : '▶️ Execute Test' }) })] }), executionLogs.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "execution-logs", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Execution Logs" }), (0, jsx_runtime_1.jsx)("div", { className: "logs-container", children: executionLogs.map((log, index) => {
                                    // Handle both string and object logs
                                    const logText = typeof log === 'string'
                                        ? log
                                        : log.message || JSON.stringify(log);
                                    return ((0, jsx_runtime_1.jsxs)("div", { className: "log-entry", children: [(0, jsx_runtime_1.jsx)("span", { className: "log-time", children: new Date().toLocaleTimeString() }), (0, jsx_runtime_1.jsx)("span", { className: "log-message", children: logText })] }, index));
                                }) })] })), executionResult && ((0, jsx_runtime_1.jsxs)("div", { className: "execution-results", children: [(0, jsx_runtime_1.jsx)("h3", { children: "\uD83D\uDCCA Execution Results" }), (0, jsx_runtime_1.jsxs)("div", { className: "result-summary", style: { borderLeftColor: getStatusColor(executionResult.status) }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "result-status", children: [(0, jsx_runtime_1.jsx)("span", { className: "status-icon", style: { color: getStatusColor(executionResult.status) }, children: getStatusIcon(executionResult.status) }), (0, jsx_runtime_1.jsx)("span", { className: "status-text", children: executionResult.status.toUpperCase() })] }), (0, jsx_runtime_1.jsxs)("div", { className: "result-metrics", children: [executionResult.duration && ((0, jsx_runtime_1.jsxs)("div", { className: "result-metric", children: [(0, jsx_runtime_1.jsx)("strong", { children: "\u23F1\uFE0F Duration:" }), " ", (executionResult.duration / 1000).toFixed(2), "s (", executionResult.duration, "ms)"] })), executionResult.startedAt && ((0, jsx_runtime_1.jsxs)("div", { className: "result-metric", children: [(0, jsx_runtime_1.jsx)("strong", { children: "\uD83D\uDE80 Started:" }), " ", new Date(executionResult.startedAt).toLocaleString()] })), executionResult.completedAt && ((0, jsx_runtime_1.jsxs)("div", { className: "result-metric", children: [(0, jsx_runtime_1.jsx)("strong", { children: "\uD83C\uDFC1 Completed:" }), " ", new Date(executionResult.completedAt).toLocaleString()] }))] }), executionResult.screenshots && executionResult.screenshots.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "result-metric", children: [(0, jsx_runtime_1.jsx)("strong", { children: "\uD83D\uDCF8 Screenshots:" }), " ", executionResult.screenshots.length, " captured", (0, jsx_runtime_1.jsxs)("div", { className: "screenshots-list", children: [executionResult.screenshots.slice(0, 3).map((screenshot, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "screenshot-item", children: ["\u2022 ", screenshot.split(/[\\/]/).pop()] }, index))), executionResult.screenshots.length > 3 && ((0, jsx_runtime_1.jsxs)("div", { className: "screenshot-item", children: ["... and ", executionResult.screenshots.length - 3, " more"] }))] })] })), executionResult.video && ((0, jsx_runtime_1.jsxs)("div", { className: "result-metric", children: [(0, jsx_runtime_1.jsx)("strong", { children: "\uD83D\uDCF9 Video Recording:" }), (0, jsx_runtime_1.jsxs)("div", { className: "video-info", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["\u2705 Saved to: ", executionResult.video] }), (0, jsx_runtime_1.jsx)("button", { className: "btn-open-video", onClick: async () => {
                                                            // Use electron IPC to open the video file's directory
                                                            if (executionResult.video && window.electron?.openPath) {
                                                                try {
                                                                    const result = await window.electron.openPath(executionResult.video);
                                                                    if (!result.success) {
                                                                        console.error('Failed to open folder:', result.error);
                                                                        alert('Failed to open folder: ' + result.error);
                                                                    }
                                                                }
                                                                catch (error) {
                                                                    console.error('Error opening folder:', error);
                                                                    alert('Error opening folder: ' + error.message);
                                                                }
                                                            }
                                                            else {
                                                                alert('Electron API not available');
                                                            }
                                                        }, children: "\uD83D\uDCC2 Open Folder" })] })] })), executionResult.error && ((0, jsx_runtime_1.jsxs)("div", { className: "result-error", children: [(0, jsx_runtime_1.jsx)("strong", { children: "\u274C Error:" }), (0, jsx_runtime_1.jsx)("pre", { children: executionResult.error })] }))] }), executionResult.logs && executionResult.logs.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "result-logs", children: [(0, jsx_runtime_1.jsx)("h4", { children: "\uD83D\uDCDD Detailed Execution Logs" }), (0, jsx_runtime_1.jsx)("div", { className: "logs-container", children: executionResult.logs.map((log, index) => {
                                            // Handle both string and object logs
                                            const logText = typeof log === 'string'
                                                ? log
                                                : log.message || JSON.stringify(log);
                                            return ((0, jsx_runtime_1.jsxs)("div", { className: "log-entry", children: [(0, jsx_runtime_1.jsx)("span", { className: "log-number", children: index + 1 }), (0, jsx_runtime_1.jsx)("span", { className: "log-text", children: logText })] }, index));
                                        }) })] }))] })), !selectedProject && !isExecuting && !executionResult && ((0, jsx_runtime_1.jsxs)("div", { className: "empty-state", children: [(0, jsx_runtime_1.jsx)("div", { className: "empty-icon", children: "\u25B6\uFE0F" }), (0, jsx_runtime_1.jsx)("h3", { children: "Ready to Execute Tests" }), (0, jsx_runtime_1.jsx)("p", { children: "Select a project and test case to begin manual execution" }), (0, jsx_runtime_1.jsxs)("div", { className: "empty-features", children: [(0, jsx_runtime_1.jsxs)("div", { className: "feature", children: [(0, jsx_runtime_1.jsx)("strong", { children: "\u2705 Real Browser Testing" }), (0, jsx_runtime_1.jsx)("span", { children: "Execute tests in visible browser" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "feature", children: [(0, jsx_runtime_1.jsx)("strong", { children: "\uD83D\uDCF9 Video Recording" }), (0, jsx_runtime_1.jsx)("span", { children: "Capture test execution on video" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "feature", children: [(0, jsx_runtime_1.jsx)("strong", { children: "\uD83D\uDCF8 Screenshots" }), (0, jsx_runtime_1.jsx)("span", { children: "Take screenshots at each step" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "feature", children: [(0, jsx_runtime_1.jsx)("strong", { children: "\uD83D\uDCCA Detailed Logs" }), (0, jsx_runtime_1.jsx)("span", { children: "View execution logs in real-time" })] })] })] }))] })] }));
};
exports.TestExecutionRunner = TestExecutionRunner;
//# sourceMappingURL=TestExecutionRunner.js.map