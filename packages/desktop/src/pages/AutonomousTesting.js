"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AutonomousTestingPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
require("../renderer/App.css");
function AutonomousTestingPage() {
    const [websiteUrl, setWebsiteUrl] = (0, react_1.useState)('');
    const [apiUrl, setApiUrl] = (0, react_1.useState)('');
    const [depth, setDepth] = (0, react_1.useState)('deep');
    const [enableHealing, setEnableHealing] = (0, react_1.useState)(true);
    const [createJiraTickets, setCreateJiraTickets] = (0, react_1.useState)(false);
    const [enableAuth, setEnableAuth] = (0, react_1.useState)(false);
    const [authUsername, setAuthUsername] = (0, react_1.useState)('');
    const [authPassword, setAuthPassword] = (0, react_1.useState)('');
    const [recordVideo, setRecordVideo] = (0, react_1.useState)(true);
    // Multi-panel testing
    const [enableMultiPanel, setEnableMultiPanel] = (0, react_1.useState)(false);
    const [adminPanelUrl, setAdminPanelUrl] = (0, react_1.useState)('');
    const [adminUsername, setAdminUsername] = (0, react_1.useState)('');
    const [adminPassword, setAdminPassword] = (0, react_1.useState)('');
    const [enableUserPanel, setEnableUserPanel] = (0, react_1.useState)(false);
    const [userPanelUrl, setUserPanelUrl] = (0, react_1.useState)('');
    const [userAuthStrategy, setUserAuthStrategy] = (0, react_1.useState)('auto-register');
    const [userUsername, setUserUsername] = (0, react_1.useState)('');
    const [userPassword, setUserPassword] = (0, react_1.useState)('');
    const [isRunning, setIsRunning] = (0, react_1.useState)(false);
    const [phase, setPhase] = (0, react_1.useState)('input');
    const [progress, setProgress] = (0, react_1.useState)(null);
    const [result, setResult] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)(null);
    const handleStartTesting = async () => {
        console.log('\n=== [FRONTEND] Starting Autonomous Testing ===');
        console.log('[FRONTEND] Input:', { websiteUrl, apiUrl, depth, enableHealing, createJiraTickets });
        if (!websiteUrl && !apiUrl) {
            console.log('[FRONTEND] ❌ Validation failed - No URL provided');
            setError('Please enter at least Website URL or API URL');
            return;
        }
        // Validate multi-panel requirements
        if (enableMultiPanel) {
            if (!adminPanelUrl || !adminUsername || !adminPassword) {
                setError('Admin Panel URL and credentials are required for multi-panel testing');
                return;
            }
            if (enableUserPanel && userAuthStrategy === 'provided' && (!userUsername || !userPassword)) {
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
            console.log('[FRONTEND] API URL:', API_URL);
            // Get auth token from localStorage
            const token = localStorage.getItem('accessToken');
            console.log('[FRONTEND] Auth token:', token ? `${token.substring(0, 20)}...` : 'NOT FOUND');
            if (!token) {
                console.error('[FRONTEND] ❌ No auth token found! User might not be logged in.');
                setError('Authentication required. Please login first.');
                setIsRunning(false);
                return;
            }
            // Check if we should use multi-panel API
            if (enableMultiPanel) {
                // Use multi-panel API
                const multiPanelBody = {
                    landingPage: { url: websiteUrl },
                    adminPanel: {
                        url: adminPanelUrl,
                        credentials: {
                            username: adminUsername,
                            password: adminPassword,
                        },
                    },
                    userPanel: enableUserPanel ? {
                        url: userPanelUrl || undefined,
                        enabled: true,
                        authStrategy: userAuthStrategy,
                        credentials: userAuthStrategy === 'provided' ? {
                            username: userUsername,
                            password: userPassword,
                        } : undefined,
                    } : undefined,
                    depth,
                    enableHealing,
                    captureVideo: recordVideo,
                    testRBAC: true,
                    testDataConsistency: false,
                    headless: false,
                };
                console.log('[FRONTEND] Using multi-panel API with body:', JSON.stringify(multiPanelBody, null, 2));
                const multiPanelResponse = await fetch(`${API_URL}/api/autonomous-testing/multi-panel/start`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(multiPanelBody),
                });
                console.log('[FRONTEND] Multi-panel response status:', multiPanelResponse.status);
                if (!multiPanelResponse.ok) {
                    let errorMessage = 'Failed to start multi-panel testing';
                    try {
                        const errorData = await multiPanelResponse.json();
                        console.error('[FRONTEND] ❌ Error response:', errorData);
                        errorMessage = errorData.error || errorMessage;
                    }
                    catch (e) {
                        const textError = await multiPanelResponse.text();
                        console.error('[FRONTEND] Raw error response:', textError);
                        if (textError)
                            errorMessage += ` - ${textError}`;
                    }
                    throw new Error(errorMessage);
                }
                const multiPanelData = await multiPanelResponse.json();
                console.log('[FRONTEND] ✅ Multi-panel success response:', multiPanelData);
                const { sessionId } = multiPanelData;
                console.log('[FRONTEND] Multi-panel Session ID:', sessionId);
                // Subscribe to multi-panel progress
                const eventSource = new EventSource(`${API_URL}/api/autonomous-testing/multi-panel/progress/${sessionId}?token=${token}`);
                eventSource.onmessage = (event) => {
                    console.log('[FRONTEND] Multi-panel SSE message:', event.data);
                    const update = JSON.parse(event.data);
                    console.log('[FRONTEND] Multi-panel progress:', update);
                    setProgress(update);
                    if (update.phase === 'completed') {
                        console.log('[FRONTEND] ✅ Multi-panel testing completed');
                        eventSource.close();
                        fetchMultiPanelResults(sessionId);
                    }
                    if (update.phase === 'error') {
                        console.error('[FRONTEND] ❌ Multi-panel error:', update.message);
                        eventSource.close();
                        setError(update.message);
                        setIsRunning(false);
                        setPhase('input');
                    }
                };
                eventSource.onerror = (err) => {
                    console.error('[FRONTEND] ❌ Multi-panel EventSource error:', err);
                    eventSource.close();
                    setError('Connection lost. Please try again.');
                    setIsRunning(false);
                    setPhase('input');
                };
                return; // Exit early for multi-panel flow
            }
            // Original single-panel flow
            const requestBody = {
                websiteUrl: websiteUrl || undefined,
                apiUrl: apiUrl || undefined,
                depth,
                enableHealing,
                createJiraTickets,
                recordVideo,
                authentication: enableAuth ? {
                    username: authUsername,
                    password: authPassword,
                } : undefined,
            };
            console.log('[FRONTEND] Request body:', JSON.stringify(requestBody, null, 2));
            // Prepare headers with auth token
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            };
            console.log('[FRONTEND] Request headers:', JSON.stringify(headers, null, 2));
            console.log('[FRONTEND] Sending POST request...');
            const response = await fetch(`${API_URL}/api/autonomous-testing/start`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
            });
            console.log('[FRONTEND] Response status:', response.status, response.statusText);
            console.log('[FRONTEND] Response ok:', response.ok);
            if (!response.ok) {
                let errorMessage = 'Failed to start autonomous testing';
                try {
                    const errorData = await response.json();
                    console.error('[FRONTEND] ❌ Error response:', errorData);
                    errorMessage = errorData.error || errorMessage;
                    if (errorData.details) {
                        console.error('[FRONTEND] Error details:', errorData.details);
                        errorMessage += ` - Details: ${errorData.details}`;
                    }
                }
                catch (e) {
                    console.error('[FRONTEND] Failed to parse error response:', e);
                    const textError = await response.text();
                    console.error('[FRONTEND] Raw error response:', textError);
                    if (textError)
                        errorMessage += ` - ${textError}`;
                }
                throw new Error(errorMessage);
            }
            const responseData = await response.json();
            console.log('[FRONTEND] ✅ Success response:', responseData);
            const { sessionId } = responseData;
            console.log('[FRONTEND] Session ID:', sessionId);
            console.log('[FRONTEND] Creating EventSource for progress updates...');
            // EventSource doesn't support custom headers, so we pass token as query parameter
            const eventSource = new EventSource(`${API_URL}/api/autonomous-testing/progress/${sessionId}?token=${token}`);
            eventSource.onmessage = (event) => {
                console.log('[FRONTEND] SSE message received:', event.data);
                const update = JSON.parse(event.data);
                console.log('[FRONTEND] Progress update:', update);
                setProgress(update);
                if (update.phase === 'completed') {
                    console.log('[FRONTEND] ✅ Testing completed, fetching results...');
                    eventSource.close();
                    fetchResults(sessionId);
                }
                if (update.phase === 'error') {
                    console.error('[FRONTEND] ❌ Error phase received:', update.message);
                    eventSource.close();
                    setError(update.message);
                    setIsRunning(false);
                    setPhase('input');
                }
            };
            eventSource.onerror = (err) => {
                console.error('[FRONTEND] ❌ EventSource error:', err);
                eventSource.close();
                setError('Connection lost. Please try again.');
                setIsRunning(false);
                setPhase('input');
            };
        }
        catch (err) {
            console.error('[FRONTEND] ❌❌❌ Exception caught:', err);
            console.error('[FRONTEND] Error message:', err.message);
            console.error('[FRONTEND] Error stack:', err.stack);
            setError(err.message);
            setIsRunning(false);
            setPhase('input');
        }
    };
    const fetchResults = async (sessionId) => {
        console.log('[FRONTEND] Fetching results for session:', sessionId);
        try {
            const API_URL = 'http://localhost:3001';
            const token = localStorage.getItem('accessToken');
            // Pass token as query parameter (like SSE)
            const response = await fetch(`${API_URL}/api/autonomous-testing/results/${sessionId}?token=${token}`);
            console.log('[FRONTEND] Results response status:', response.status);
            if (!response.ok) {
                throw new Error(`Failed to fetch results: ${response.statusText}`);
            }
            const results = await response.json();
            console.log('[FRONTEND] ✅ Results received:', results);
            console.log('[FRONTEND] Test counts:', {
                generated: results.testsGenerated,
                passed: results.testsPassed,
                failed: results.testsFailed,
                healed: results.testsHealed,
                duration: results.duration
            });
            setResult(results);
            setIsRunning(false);
            setPhase('completed');
        }
        catch (err) {
            console.error('[FRONTEND] ❌ Failed to fetch results:', err);
            setError('Failed to fetch results: ' + err.message);
            setIsRunning(false);
            setPhase('input');
        }
    };
    const fetchMultiPanelResults = async (sessionId) => {
        console.log('[FRONTEND] Fetching multi-panel results for session:', sessionId);
        try {
            const API_URL = 'http://localhost:3001';
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/api/autonomous-testing/multi-panel/results/${sessionId}?token=${token}`);
            console.log('[FRONTEND] Multi-panel results response status:', response.status);
            if (!response.ok) {
                throw new Error(`Failed to fetch multi-panel results: ${response.statusText}`);
            }
            const results = await response.json();
            console.log('[FRONTEND] ✅ Multi-panel results received:', results);
            console.log('[FRONTEND] Multi-panel test counts:', {
                total: results.summary?.totalTests,
                passed: results.summary?.totalPassed,
                failed: results.summary?.totalFailed,
                healed: results.summary?.totalHealed,
                duration: results.duration
            });
            setResult(results);
            setIsRunning(false);
            setPhase('completed');
        }
        catch (err) {
            console.error('[FRONTEND] ❌ Failed to fetch multi-panel results:', err);
            setError('Failed to fetch multi-panel results: ' + err.message);
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
    const getPhaseLabel = (phaseKey) => {
        const labels = {
            discovery: '🔍 Discovering',
            registration: '📝 Testing Registration',
            generation: '🧪 Generating Tests',
            execution: '▶️  Executing',
            analysis: '🧠 Analyzing',
            report: '📊 Generating Report',
            completed: '✅ Completed',
        };
        return labels[phaseKey] || phaseKey;
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: '24px', maxWidth: '1200px', margin: '0 auto' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '24px' }, children: [(0, jsx_runtime_1.jsx)("h1", { style: { fontSize: '28px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }, children: "\uD83E\uDD16 Autonomous Testing" }), (0, jsx_runtime_1.jsx)("p", { style: { color: '#666' }, children: "Automatically discover, test, and analyze any website or API with AI-powered testing" })] }), error && ((0, jsx_runtime_1.jsxs)("div", { style: {
                    padding: '12px 16px',
                    marginBottom: '16px',
                    borderRadius: '4px',
                    background: '#fee2e2',
                    color: '#991b1b',
                    border: '1px solid #fecaca',
                    position: 'relative',
                }, children: [error, (0, jsx_runtime_1.jsx)("button", { onClick: () => setError(null), style: {
                            position: 'absolute',
                            right: '8px',
                            top: '8px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px',
                        }, children: "\u2715" })] })), phase === 'input' && ((0, jsx_runtime_1.jsxs)("div", { style: {
                    background: 'white',
                    borderRadius: '8px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '16px' }, children: [(0, jsx_runtime_1.jsx)("label", { style: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }, children: "Website URL" }), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "https://example.com", value: websiteUrl, onChange: (e) => setWebsiteUrl(e.target.value), style: {
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                } }), (0, jsx_runtime_1.jsx)("small", { style: { color: '#666' }, children: "URL of the website to test" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '16px' }, children: [(0, jsx_runtime_1.jsx)("label", { style: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }, children: "API Base URL (Optional)" }), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "https://api.example.com", value: apiUrl, onChange: (e) => setApiUrl(e.target.value), style: {
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                } }), (0, jsx_runtime_1.jsx)("small", { style: { color: '#666' }, children: "Base URL for API testing" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '16px' }, children: [(0, jsx_runtime_1.jsx)("label", { style: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }, children: "Test Depth" }), (0, jsx_runtime_1.jsxs)("select", { value: depth, onChange: (e) => setDepth(e.target.value), style: {
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }, children: [(0, jsx_runtime_1.jsx)("option", { value: "shallow", children: "Shallow (5-10 tests, 2-3 min)" }), (0, jsx_runtime_1.jsx)("option", { value: "deep", children: "Deep (50-100 tests, 10-15 min)" }), (0, jsx_runtime_1.jsx)("option", { value: "exhaustive", children: "Exhaustive (200+ tests, 30+ min)" })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: {
                            marginBottom: '16px',
                            padding: '16px',
                            background: '#f9fafb',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                        }, children: [(0, jsx_runtime_1.jsxs)("label", { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '12px' }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: enableAuth, onChange: (e) => setEnableAuth(e.target.checked) }), (0, jsx_runtime_1.jsx)("span", { style: { fontWeight: '500' }, children: "\uD83D\uDD10 Website requires login/authentication" })] }), enableAuth ? ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '12px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '12px' }, children: [(0, jsx_runtime_1.jsx)("label", { style: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }, children: "Username / Email" }), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Enter username or email", value: authUsername, onChange: (e) => setAuthUsername(e.target.value), style: {
                                                    width: '100%',
                                                    padding: '10px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    fontSize: '14px'
                                                } })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { style: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }, children: "Password" }), (0, jsx_runtime_1.jsx)("input", { type: "password", placeholder: "Enter password", value: authPassword, onChange: (e) => setAuthPassword(e.target.value), style: {
                                                    width: '100%',
                                                    padding: '10px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    fontSize: '14px'
                                                } })] }), (0, jsx_runtime_1.jsx)("small", { style: { display: 'block', marginTop: '8px', color: '#666', fontSize: '12px' }, children: "\u2139\uFE0F Credentials will be used to login before testing starts" })] })) : ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: '12px', padding: '12px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #dbeafe' }, children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'start', gap: '8px' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: '18px' }, children: "\uD83D\uDCDD" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { style: { margin: 0, fontSize: '13px', fontWeight: '500', color: '#1e40af' }, children: "Auto-Registration Testing Enabled" }), (0, jsx_runtime_1.jsx)("p", { style: { margin: '4px 0 0 0', fontSize: '12px', color: '#3b82f6', lineHeight: '1.4' }, children: "If a registration/signup form is found, it will be automatically tested with generated fake data (name, email, password, etc.)" })] })] }) }))] }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '12px' }, children: (0, jsx_runtime_1.jsxs)("label", { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: enableHealing, onChange: (e) => setEnableHealing(e.target.checked) }), (0, jsx_runtime_1.jsx)("span", { children: "Enable Self-Healing (Auto-fix broken tests)" })] }) }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '12px' }, children: (0, jsx_runtime_1.jsxs)("label", { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: createJiraTickets, onChange: (e) => setCreateJiraTickets(e.target.checked) }), (0, jsx_runtime_1.jsx)("span", { children: "Create Jira tickets for bugs" })] }) }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '24px' }, children: [(0, jsx_runtime_1.jsxs)("label", { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: recordVideo, onChange: (e) => setRecordVideo(e.target.checked) }), (0, jsx_runtime_1.jsx)("span", { children: "\uD83C\uDFA5 Record video of test execution" })] }), (0, jsx_runtime_1.jsx)("small", { style: { display: 'block', marginTop: '4px', marginLeft: '28px', color: '#666', fontSize: '12px' }, children: "Videos will be saved to your Downloads folder" })] }), (0, jsx_runtime_1.jsx)("button", { onClick: handleStartTesting, disabled: isRunning, style: {
                            width: '100%',
                            padding: '16px',
                            background: isRunning ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: isRunning ? 'not-allowed' : 'pointer',
                        }, children: isRunning ? 'Running...' : '🚀 Start Autonomous Testing' })] })), phase === 'running' && progress && ((0, jsx_runtime_1.jsxs)("div", { style: {
                    background: 'white',
                    borderRadius: '8px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }, children: [(0, jsx_runtime_1.jsx)("h2", { style: { marginBottom: '16px' }, children: getPhaseLabel(progress.phase) }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '8px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                    width: '100%',
                                    height: '8px',
                                    background: '#e5e5e5',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                        width: `${progress.progress}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                        transition: 'width 0.3s',
                                    } }) }), (0, jsx_runtime_1.jsxs)("p", { style: { marginTop: '8px', color: '#666', fontSize: '14px' }, children: [progress.message, " (", Math.round(progress.progress), "%)"] })] }), progress.details && ((0, jsx_runtime_1.jsxs)("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '16px',
                            marginTop: '24px'
                        }, children: [progress.details.pagesFound !== undefined && ((0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'center', padding: '16px', background: '#f9fafb', borderRadius: '8px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { fontSize: '24px', marginBottom: '4px' }, children: progress.details.pagesFound }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: '12px', color: '#666' }, children: "Pages Found" })] })), progress.details.endpointsFound !== undefined && ((0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'center', padding: '16px', background: '#f9fafb', borderRadius: '8px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { fontSize: '24px', marginBottom: '4px' }, children: progress.details.endpointsFound }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: '12px', color: '#666' }, children: "APIs Found" })] })), progress.details.testsGenerated !== undefined && ((0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'center', padding: '16px', background: '#f9fafb', borderRadius: '8px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { fontSize: '24px', marginBottom: '4px' }, children: progress.details.testsGenerated }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: '12px', color: '#666' }, children: "Tests Generated" })] })), progress.details.passed !== undefined && ((0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'center', padding: '16px', background: '#d1fae5', borderRadius: '8px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { fontSize: '24px', marginBottom: '4px', color: '#059669' }, children: progress.details.passed }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: '12px', color: '#059669' }, children: "Passed" })] })), progress.details.failed !== undefined && ((0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'center', padding: '16px', background: '#fee2e2', borderRadius: '8px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { fontSize: '24px', marginBottom: '4px', color: '#dc2626' }, children: progress.details.failed }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: '12px', color: '#dc2626' }, children: "Failed" })] })), progress.details.healed !== undefined && ((0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'center', padding: '16px', background: '#fef3c7', borderRadius: '8px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { fontSize: '24px', marginBottom: '4px', color: '#d97706' }, children: progress.details.healed }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: '12px', color: '#d97706' }, children: "Healed" })] }))] })), progress.details?.currentTest && ((0, jsx_runtime_1.jsxs)("p", { style: { marginTop: '16px', color: '#666', fontSize: '14px' }, children: ["Current: ", progress.details.currentTest] }))] })), phase === 'completed' && result && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                            background: 'white',
                            borderRadius: '8px',
                            padding: '24px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            marginBottom: '16px',
                        }, children: [(0, jsx_runtime_1.jsx)("h2", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }, children: "\u2705 Autonomous Testing Completed!" }), (0, jsx_runtime_1.jsxs)("div", { style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                    gap: '24px'
                                }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'center' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { fontSize: '36px', fontWeight: '700' }, children: result.testsGenerated || 0 }), (0, jsx_runtime_1.jsx)("p", { style: { color: '#666' }, children: "Total Tests" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'center' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { fontSize: '36px', fontWeight: '700', color: '#10b981' }, children: result.testsPassed || 0 }), (0, jsx_runtime_1.jsx)("p", { style: { color: '#666' }, children: "Passed" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'center' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { fontSize: '36px', fontWeight: '700', color: '#ef4444' }, children: result.testsFailed || 0 }), (0, jsx_runtime_1.jsx)("p", { style: { color: '#666' }, children: "Failed" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'center' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { fontSize: '36px', fontWeight: '700', color: '#f59e0b' }, children: result.testsHealed || 0 }), (0, jsx_runtime_1.jsx)("p", { style: { color: '#666' }, children: "Healed" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'center' }, children: [(0, jsx_runtime_1.jsxs)("h3", { style: { fontSize: '36px', fontWeight: '700' }, children: [result.report?.summary?.coverage || 0, "%"] }), (0, jsx_runtime_1.jsx)("p", { style: { color: '#666' }, children: "Coverage" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { textAlign: 'center' }, children: [(0, jsx_runtime_1.jsxs)("h3", { style: { fontSize: '36px', fontWeight: '700' }, children: [result.duration && !isNaN(result.duration)
                                                        ? Math.floor(result.duration / 1000 / 60)
                                                        : 0, "m"] }), (0, jsx_runtime_1.jsx)("p", { style: { color: '#666' }, children: "Duration" })] })] })] }), result.report?.details?.failures && result.report.details.failures.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { style: {
                            background: 'white',
                            borderRadius: '8px',
                            padding: '24px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            marginBottom: '16px',
                        }, children: [(0, jsx_runtime_1.jsxs)("h2", { style: { marginBottom: '16px' }, children: ["\uD83D\uDC1B Issues Found (", result.report.details.failures.length, ")"] }), result.report.details.failures.map((failure, index) => ((0, jsx_runtime_1.jsxs)("div", { style: {
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    marginBottom: '12px',
                                }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '8px', display: 'flex', gap: '8px' }, children: [(0, jsx_runtime_1.jsx)("span", { style: {
                                                    padding: '4px 12px',
                                                    background: '#fee2e2',
                                                    color: '#dc2626',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                }, children: failure.category }), (0, jsx_runtime_1.jsxs)("span", { style: {
                                                    padding: '4px 12px',
                                                    background: '#e5e7eb',
                                                    color: '#374151',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                }, children: [Math.round(failure.confidence * 100), "% confidence"] })] }), (0, jsx_runtime_1.jsxs)("p", { style: { marginBottom: '8px' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Root Cause:" }), " ", failure.rootCause] }), failure.suggestedFix.forDeveloper && ((0, jsx_runtime_1.jsxs)("div", { style: {
                                            background: 'white',
                                            padding: '12px',
                                            borderRadius: '6px',
                                            marginTop: '8px',
                                            fontSize: '14px',
                                        }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "\uD83D\uDCA1 For Developer:" }), " ", failure.suggestedFix.forDeveloper] })), failure.jiraTicket && ((0, jsx_runtime_1.jsxs)("p", { style: { marginTop: '8px' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "\uD83D\uDCCB Jira:" }), " ", failure.jiraTicket] }))] }, index)))] })), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' }, children: [result.report?.files?.html && ((0, jsx_runtime_1.jsx)("button", { onClick: () => window.open(result.report.files.html, '_blank'), style: {
                                    padding: '12px 24px',
                                    background: '#667eea',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                }, children: "\uD83D\uDCCA View HTML Report" })), result.report && ((0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                    const dataStr = JSON.stringify(result.report, null, 2);
                                    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                                    const downloadAnchor = document.createElement('a');
                                    downloadAnchor.setAttribute('href', dataUri);
                                    downloadAnchor.setAttribute('download', `autonomous-test-report-${Date.now()}.json`);
                                    downloadAnchor.click();
                                }, style: {
                                    padding: '12px 24px',
                                    background: 'white',
                                    color: '#667eea',
                                    border: '1px solid #667eea',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                }, children: "\uD83D\uDCBE Download JSON" })), result.videoPath && ((0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                    console.log('[FRONTEND] Opening video:', result.videoPath);
                                    // Use Electron shell to open file with default video player
                                    if (window.require) {
                                        const { shell } = window.require('electron');
                                        shell.openPath(result.videoPath).then((error) => {
                                            if (error) {
                                                console.error('[FRONTEND] Failed to open video:', error);
                                                alert('Failed to open video: ' + error);
                                            }
                                            else {
                                                console.log('[FRONTEND] Video opened successfully');
                                            }
                                        });
                                    }
                                    else {
                                        alert('Video saved to: ' + result.videoPath);
                                    }
                                }, style: {
                                    padding: '12px 24px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                }, children: "\uD83C\uDFA5 Open Video Recording" })), (0, jsx_runtime_1.jsx)("button", { onClick: handleReset, style: {
                                    padding: '12px 24px',
                                    background: 'white',
                                    color: '#666',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                }, children: "\uD83D\uDD04 Run New Test" })] })] }))] }));
}
//# sourceMappingURL=AutonomousTesting.js.map