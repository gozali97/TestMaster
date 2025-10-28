"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AutonomousTestingMultiPanel;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
require("../renderer/App.css");
const styles = {
    container: {
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        color: '#1a1a1a',
    },
    header: {
        marginBottom: '32px',
    },
    title: {
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '8px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: {
        fontSize: '16px',
        color: '#666',
    },
    card: {
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        marginBottom: '24px',
        border: '1px solid #e5e5e5',
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        marginBottom: '8px',
        color: '#333',
    },
    input: {
        width: '100%',
        padding: '12px',
        marginBottom: '16px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
        boxSizing: 'border-box',
    },
    select: {
        width: '100%',
        padding: '12px',
        marginBottom: '16px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
    },
    checkbox: {
        marginRight: '8px',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '12px',
        fontSize: '14px',
        cursor: 'pointer',
    },
    button: {
        width: '100%',
        padding: '16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'transform 0.2s',
    },
    buttonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
    },
    alert: {
        padding: '12px 16px',
        marginBottom: '16px',
        borderRadius: '8px',
        fontSize: '14px',
    },
    alertError: {
        background: '#fee2e2',
        color: '#991b1b',
        border: '1px solid #fecaca',
    },
    alertInfo: {
        background: '#dbeafe',
        color: '#1e40af',
        border: '1px solid #bfdbfe',
    },
    progressCard: {
        background: '#f9fafb',
        borderRadius: '12px',
        padding: '24px',
        marginTop: '24px',
    },
    progressBar: {
        width: '100%',
        height: '8px',
        background: '#e5e5e5',
        borderRadius: '4px',
        overflow: 'hidden',
        marginTop: '12px',
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        transition: 'width 0.3s',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginTop: '24px',
    },
    statCard: {
        textAlign: 'center',
        padding: '16px',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e5e5',
    },
    statValue: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#667eea',
    },
    statLabel: {
        fontSize: '12px',
        color: '#666',
        marginTop: '4px',
    },
    helpText: {
        fontSize: '12px',
        color: '#999',
        marginTop: '-8px',
        marginBottom: '16px',
    },
    required: {
        color: '#ef4444',
    },
};
function AutonomousTestingMultiPanel() {
    const [config, setConfig] = (0, react_1.useState)({
        landingPageUrl: '',
        loginUrl: '', // URL halaman login (separate from admin/user panel)
        adminPanelUrl: '',
        adminUsername: '',
        adminPassword: '',
        enableUserPanel: false,
        userPanelUrl: '',
        userAuthStrategy: 'auto-register',
        userUsername: '',
        userPassword: '',
        depth: 'deep',
        enableHealing: true,
        captureVideo: true,
        testRBAC: true,
        testDataConsistency: false,
    });
    const [isRunning, setIsRunning] = (0, react_1.useState)(false);
    const [phase, setPhase] = (0, react_1.useState)('input');
    const [progress, setProgress] = (0, react_1.useState)(null);
    const [result, setResult] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)(null);
    const handleStartTesting = async () => {
        // Validation
        if (!config.landingPageUrl) {
            setError('Landing page URL is required');
            return;
        }
        if (!config.adminPanelUrl) {
            setError('Admin panel URL is required');
            return;
        }
        if (!config.adminUsername || !config.adminPassword) {
            setError('Admin credentials are required');
            return;
        }
        if (config.enableUserPanel && config.userAuthStrategy === 'provided') {
            if (!config.userUsername || !config.userPassword) {
                setError('User credentials are required when using "provided" strategy');
                return;
            }
        }
        setError(null);
        setIsRunning(true);
        setPhase('running');
        setResult(null);
        try {
            const API_URL = 'http://localhost:3001';
            // Get auth token from localStorage
            const token = localStorage.getItem('accessToken');
            console.log('[MULTI-PANEL] Auth token:', token ? `${token.substring(0, 20)}...` : 'NOT FOUND');
            if (!token) {
                console.error('[MULTI-PANEL] ❌ No auth token found! User might not be logged in.');
                setError('Authentication required. Please login first.');
                setIsRunning(false);
                return;
            }
            const requestBody = {
                landingPage: {
                    url: config.landingPageUrl,
                },
                loginUrl: config.loginUrl || undefined, // Optional: separate login page
                adminPanel: {
                    url: config.adminPanelUrl,
                    credentials: {
                        username: config.adminUsername,
                        password: config.adminPassword,
                    },
                },
                userPanel: config.enableUserPanel ? {
                    url: config.userPanelUrl || undefined,
                    enabled: true,
                    authStrategy: config.userAuthStrategy,
                    credentials: config.userAuthStrategy === 'provided' ? {
                        username: config.userUsername,
                        password: config.userPassword,
                    } : undefined,
                } : undefined,
                depth: config.depth,
                enableHealing: config.enableHealing,
                captureVideo: config.captureVideo,
                testRBAC: config.testRBAC,
                testDataConsistency: config.testDataConsistency,
                headless: false,
            };
            console.log('Starting multi-panel testing with config:', requestBody);
            const response = await fetch(`${API_URL}/api/autonomous-testing/multi-panel/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to start multi-panel testing');
            }
            const { sessionId } = await response.json();
            console.log('Multi-panel testing started, sessionId:', sessionId);
            // Subscribe to progress updates with token as query parameter
            const eventSource = new EventSource(`${API_URL}/api/autonomous-testing/multi-panel/progress/${sessionId}?token=${token}`);
            eventSource.onmessage = (event) => {
                const update = JSON.parse(event.data);
                console.log('[MULTI-PANEL] Progress update received:', update);
                setProgress(update);
                if (update.phase === 'completed') {
                    console.log('[MULTI-PANEL] Testing completed!');
                    eventSource.close();
                    fetchResults(sessionId);
                }
                if (update.phase === 'error') {
                    console.error('[MULTI-PANEL] Error received:', update.message);
                    eventSource.close();
                    setError(update.message);
                    setIsRunning(false);
                    setPhase('input');
                }
            };
            eventSource.onopen = () => {
                console.log('[MULTI-PANEL] EventSource connected successfully');
            };
            eventSource.onerror = () => {
                eventSource.close();
                setError('Connection lost. Please try again.');
                setIsRunning(false);
                setPhase('input');
            };
        }
        catch (err) {
            console.error('Start testing error:', err);
            setError(err.message);
            setIsRunning(false);
            setPhase('input');
        }
    };
    const fetchResults = async (sessionId) => {
        try {
            const API_URL = 'http://localhost:3001';
            const token = localStorage.getItem('accessToken');
            // Pass token as query parameter for results
            const response = await fetch(`${API_URL}/api/autonomous-testing/multi-panel/results/${sessionId}?token=${token}`);
            const results = await response.json();
            setResult(results);
            setIsRunning(false);
            setPhase('completed');
        }
        catch (err) {
            setError('Failed to fetch results');
            setIsRunning(false);
            setPhase('input');
        }
    };
    const handleReset = () => {
        setPhase('input');
        setProgress(null);
        setResult(null);
        setError(null);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: styles.container, children: [(0, jsx_runtime_1.jsxs)("div", { style: styles.header, children: [(0, jsx_runtime_1.jsx)("div", { style: styles.title, children: "\uD83C\uDFAF Multi-Panel Autonomous Testing" }), (0, jsx_runtime_1.jsx)("div", { style: styles.subtitle, children: "Test landing page, user panel, and admin panel in one comprehensive test run" })] }), error && ((0, jsx_runtime_1.jsxs)("div", { style: { ...styles.alert, ...styles.alertError }, children: ["\u274C ", error] })), phase === 'input' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { style: styles.card, children: [(0, jsx_runtime_1.jsx)("div", { style: styles.sectionTitle, children: "\uD83D\uDCC4 Landing Page (Public)" }), (0, jsx_runtime_1.jsxs)("label", { style: styles.label, children: ["Website URL ", (0, jsx_runtime_1.jsx)("span", { style: styles.required, children: "*" })] }), (0, jsx_runtime_1.jsx)("input", { type: "text", style: styles.input, placeholder: "https://example.com", value: config.landingPageUrl, onChange: (e) => setConfig({ ...config, landingPageUrl: e.target.value }) }), (0, jsx_runtime_1.jsx)("div", { style: styles.helpText, children: "The main website URL to test public pages" })] }), (0, jsx_runtime_1.jsxs)("div", { style: styles.card, children: [(0, jsx_runtime_1.jsx)("div", { style: styles.sectionTitle, children: "\uD83D\uDD10 Login Page (Optional)" }), (0, jsx_runtime_1.jsx)("label", { style: styles.label, children: "Login Page URL" }), (0, jsx_runtime_1.jsx)("input", { type: "text", style: styles.input, placeholder: "https://comathedu.id/login", value: config.loginUrl, onChange: (e) => setConfig({ ...config, loginUrl: e.target.value }) }), (0, jsx_runtime_1.jsx)("div", { style: styles.helpText, children: "Separate login page URL (if login page is different from admin/user panel). Example: Login at /login, then redirect to /admin/dashboard" })] }), (0, jsx_runtime_1.jsxs)("div", { style: styles.card, children: [(0, jsx_runtime_1.jsxs)("div", { style: styles.sectionTitle, children: ["\u26A1 Admin Panel ", (0, jsx_runtime_1.jsx)("span", { style: styles.required, children: "*" })] }), (0, jsx_runtime_1.jsxs)("label", { style: styles.label, children: ["Admin Panel URL ", (0, jsx_runtime_1.jsx)("span", { style: styles.required, children: "*" })] }), (0, jsx_runtime_1.jsx)("input", { type: "text", style: styles.input, placeholder: "https://comathedu.id/admin/dashboard", value: config.adminPanelUrl, onChange: (e) => setConfig({ ...config, adminPanelUrl: e.target.value }) }), (0, jsx_runtime_1.jsx)("div", { style: styles.helpText, children: "URL of admin dashboard (the page after successful login)" }), (0, jsx_runtime_1.jsxs)("label", { style: styles.label, children: ["Admin Username ", (0, jsx_runtime_1.jsx)("span", { style: styles.required, children: "*" })] }), (0, jsx_runtime_1.jsx)("input", { type: "text", style: styles.input, placeholder: "admin@example.com", value: config.adminUsername, onChange: (e) => setConfig({ ...config, adminUsername: e.target.value }) }), (0, jsx_runtime_1.jsxs)("label", { style: styles.label, children: ["Admin Password ", (0, jsx_runtime_1.jsx)("span", { style: styles.required, children: "*" })] }), (0, jsx_runtime_1.jsx)("input", { type: "password", style: styles.input, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: config.adminPassword, onChange: (e) => setConfig({ ...config, adminPassword: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("div", { style: styles.card, children: [(0, jsx_runtime_1.jsx)("div", { style: styles.sectionTitle, children: "\uD83D\uDC64 User Panel (Optional)" }), (0, jsx_runtime_1.jsxs)("label", { style: styles.checkboxLabel, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", style: styles.checkbox, checked: config.enableUserPanel, onChange: (e) => setConfig({ ...config, enableUserPanel: e.target.checked }) }), "Enable User Panel Testing"] }), config.enableUserPanel && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("label", { style: styles.label, children: "User Panel URL" }), (0, jsx_runtime_1.jsx)("input", { type: "text", style: styles.input, placeholder: "https://example.com/dashboard (optional)", value: config.userPanelUrl, onChange: (e) => setConfig({ ...config, userPanelUrl: e.target.value }) }), (0, jsx_runtime_1.jsx)("div", { style: styles.helpText, children: "Leave blank to use main website URL" }), (0, jsx_runtime_1.jsx)("label", { style: styles.label, children: "Authentication Strategy" }), (0, jsx_runtime_1.jsxs)("select", { style: styles.select, value: config.userAuthStrategy, onChange: (e) => setConfig({ ...config, userAuthStrategy: e.target.value }), children: [(0, jsx_runtime_1.jsx)("option", { value: "auto-register", children: "Auto-register new user (recommended)" }), (0, jsx_runtime_1.jsx)("option", { value: "provided", children: "Use provided credentials" })] }), config.userAuthStrategy === 'provided' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("label", { style: styles.label, children: "User Username" }), (0, jsx_runtime_1.jsx)("input", { type: "text", style: styles.input, placeholder: "user@example.com", value: config.userUsername, onChange: (e) => setConfig({ ...config, userUsername: e.target.value }) }), (0, jsx_runtime_1.jsx)("label", { style: styles.label, children: "User Password" }), (0, jsx_runtime_1.jsx)("input", { type: "password", style: styles.input, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: config.userPassword, onChange: (e) => setConfig({ ...config, userPassword: e.target.value }) })] }))] }))] }), (0, jsx_runtime_1.jsxs)("div", { style: styles.card, children: [(0, jsx_runtime_1.jsx)("div", { style: styles.sectionTitle, children: "\u2699\uFE0F Test Configuration" }), (0, jsx_runtime_1.jsx)("label", { style: styles.label, children: "Test Depth" }), (0, jsx_runtime_1.jsxs)("select", { style: styles.select, value: config.depth, onChange: (e) => setConfig({ ...config, depth: e.target.value }), children: [(0, jsx_runtime_1.jsx)("option", { value: "shallow", children: "Shallow (Quick test, ~5 min)" }), (0, jsx_runtime_1.jsx)("option", { value: "deep", children: "Deep (Comprehensive, ~20 min)" }), (0, jsx_runtime_1.jsx)("option", { value: "exhaustive", children: "Exhaustive (Full coverage, ~45 min)" })] }), (0, jsx_runtime_1.jsxs)("label", { style: styles.checkboxLabel, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", style: styles.checkbox, checked: config.enableHealing, onChange: (e) => setConfig({ ...config, enableHealing: e.target.checked }) }), "Enable Self-Healing (Auto-fix broken tests)"] }), (0, jsx_runtime_1.jsxs)("label", { style: styles.checkboxLabel, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", style: styles.checkbox, checked: config.captureVideo, onChange: (e) => setConfig({ ...config, captureVideo: e.target.checked }) }), "Capture Video Recording"] }), (0, jsx_runtime_1.jsxs)("label", { style: styles.checkboxLabel, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", style: styles.checkbox, checked: config.testRBAC, onChange: (e) => setConfig({ ...config, testRBAC: e.target.checked }) }), "Test Role-Based Access Control (RBAC)"] }), (0, jsx_runtime_1.jsxs)("label", { style: styles.checkboxLabel, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", style: styles.checkbox, checked: config.testDataConsistency, onChange: (e) => setConfig({ ...config, testDataConsistency: e.target.checked }) }), "Test Data Consistency Across Panels"] })] }), (0, jsx_runtime_1.jsx)("button", { style: {
                            ...styles.button,
                            ...(isRunning ? styles.buttonDisabled : {}),
                        }, onClick: handleStartTesting, disabled: isRunning, children: isRunning ? '🔄 Testing in progress...' : '🚀 Start Multi-Panel Testing' })] })), phase === 'running' && progress && ((0, jsx_runtime_1.jsxs)("div", { style: styles.progressCard, children: [(0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '18px', fontWeight: '600', marginBottom: '12px' }, children: [progress.phase === 'landing' && '📄 Testing Landing Page...', progress.phase === 'user' && '👤 Testing User Panel...', progress.phase === 'admin' && '⚡ Testing Admin Panel...', progress.phase === 'rbac' && '🔒 Testing Access Control...', progress.phase === 'report' && '📊 Generating Report...'] }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '14px', color: '#666', marginBottom: '8px' }, children: progress.message }), (0, jsx_runtime_1.jsx)("div", { style: styles.progressBar, children: (0, jsx_runtime_1.jsx)("div", { style: { ...styles.progressFill, width: `${progress.progress}%` } }) }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '12px', color: '#999', marginTop: '8px', textAlign: 'right' }, children: [Math.round(progress.progress), "%"] })] })), phase === 'completed' && result && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { style: styles.card, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#10b981' }, children: "\u2705 Multi-Panel Testing Completed!" }), (0, jsx_runtime_1.jsxs)("div", { style: styles.statsGrid, children: [(0, jsx_runtime_1.jsxs)("div", { style: styles.statCard, children: [(0, jsx_runtime_1.jsx)("div", { style: styles.statValue, children: result.summary.totalTests }), (0, jsx_runtime_1.jsx)("div", { style: styles.statLabel, children: "Total Tests" })] }), (0, jsx_runtime_1.jsxs)("div", { style: styles.statCard, children: [(0, jsx_runtime_1.jsx)("div", { style: { ...styles.statValue, color: '#10b981' }, children: result.summary.totalPassed }), (0, jsx_runtime_1.jsx)("div", { style: styles.statLabel, children: "Passed" })] }), (0, jsx_runtime_1.jsxs)("div", { style: styles.statCard, children: [(0, jsx_runtime_1.jsx)("div", { style: { ...styles.statValue, color: '#ef4444' }, children: result.summary.totalFailed }), (0, jsx_runtime_1.jsx)("div", { style: styles.statLabel, children: "Failed" })] }), (0, jsx_runtime_1.jsxs)("div", { style: styles.statCard, children: [(0, jsx_runtime_1.jsx)("div", { style: { ...styles.statValue, color: '#f59e0b' }, children: result.summary.totalHealed }), (0, jsx_runtime_1.jsx)("div", { style: styles.statLabel, children: "Healed" })] }), (0, jsx_runtime_1.jsxs)("div", { style: styles.statCard, children: [(0, jsx_runtime_1.jsxs)("div", { style: styles.statValue, children: [result.summary.overallCoverage, "%"] }), (0, jsx_runtime_1.jsx)("div", { style: styles.statLabel, children: "Coverage" })] }), (0, jsx_runtime_1.jsxs)("div", { style: styles.statCard, children: [(0, jsx_runtime_1.jsxs)("div", { style: styles.statValue, children: [Math.round(result.duration / 1000), "s"] }), (0, jsx_runtime_1.jsx)("div", { style: styles.statLabel, children: "Duration" })] })] })] }), (0, jsx_runtime_1.jsx)("button", { style: styles.button, onClick: handleReset, children: "\uD83D\uDD04 Run New Test" })] }))] }));
}
//# sourceMappingURL=AutonomousTestingMultiPanel.js.map