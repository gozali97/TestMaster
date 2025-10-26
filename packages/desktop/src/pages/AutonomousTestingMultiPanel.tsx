import React, { useState } from 'react';
import '../renderer/App.css';

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
    boxSizing: 'border-box' as const,
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
    textAlign: 'center' as const,
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

export default function AutonomousTestingMultiPanel() {
  const [config, setConfig] = useState({
    landingPageUrl: '',
    loginUrl: '', // URL halaman login (separate from admin/user panel)
    adminPanelUrl: '',
    adminUsername: '',
    adminPassword: '',
    enableUserPanel: false,
    userPanelUrl: '',
    userAuthStrategy: 'auto-register' as 'auto-register' | 'provided',
    userUsername: '',
    userPassword: '',
    depth: 'deep' as 'shallow' | 'deep' | 'exhaustive',
    enableHealing: true,
    captureVideo: true,
    testRBAC: true,
    testDataConsistency: false,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<'input' | 'running' | 'completed'>('input');
  const [progress, setProgress] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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

    } catch (err: any) {
      console.error('Start testing error:', err);
      setError(err.message);
      setIsRunning(false);
      setPhase('input');
    }
  };

  const fetchResults = async (sessionId: string) => {
    try {
      const API_URL = 'http://localhost:3001';
      const token = localStorage.getItem('accessToken');
      
      // Pass token as query parameter for results
      const response = await fetch(`${API_URL}/api/autonomous-testing/multi-panel/results/${sessionId}?token=${token}`);
      const results = await response.json();
      
      setResult(results);
      setIsRunning(false);
      setPhase('completed');
    } catch (err) {
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

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>🎯 Multi-Panel Autonomous Testing</div>
        <div style={styles.subtitle}>
          Test landing page, user panel, and admin panel in one comprehensive test run
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{ ...styles.alert, ...styles.alertError }}>
          ❌ {error}
        </div>
      )}

      {/* Input Phase */}
      {phase === 'input' && (
        <>
          {/* Landing Page */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>
              📄 Landing Page (Public)
            </div>
            <label style={styles.label}>
              Website URL <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              style={styles.input}
              placeholder="https://example.com"
              value={config.landingPageUrl}
              onChange={(e) => setConfig({ ...config, landingPageUrl: e.target.value })}
            />
            <div style={styles.helpText}>The main website URL to test public pages</div>
          </div>

          {/* Login Page URL */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>
              🔐 Login Page (Optional)
            </div>
            <label style={styles.label}>
              Login Page URL
            </label>
            <input
              type="text"
              style={styles.input}
              placeholder="https://comathedu.id/login"
              value={config.loginUrl}
              onChange={(e) => setConfig({ ...config, loginUrl: e.target.value })}
            />
            <div style={styles.helpText}>
              Separate login page URL (if login page is different from admin/user panel). 
              Example: Login at /login, then redirect to /admin/dashboard
            </div>
          </div>

          {/* Admin Panel */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>
              ⚡ Admin Panel <span style={styles.required}>*</span>
            </div>
            <label style={styles.label}>
              Admin Panel URL <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              style={styles.input}
              placeholder="https://comathedu.id/admin/dashboard"
              value={config.adminPanelUrl}
              onChange={(e) => setConfig({ ...config, adminPanelUrl: e.target.value })}
            />
            <div style={styles.helpText}>
              URL of admin dashboard (the page after successful login)
            </div>

            <label style={styles.label}>
              Admin Username <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              style={styles.input}
              placeholder="admin@example.com"
              value={config.adminUsername}
              onChange={(e) => setConfig({ ...config, adminUsername: e.target.value })}
            />

            <label style={styles.label}>
              Admin Password <span style={styles.required}>*</span>
            </label>
            <input
              type="password"
              style={styles.input}
              placeholder="••••••••"
              value={config.adminPassword}
              onChange={(e) => setConfig({ ...config, adminPassword: e.target.value })}
            />
          </div>

          {/* User Panel */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>
              👤 User Panel (Optional)
            </div>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                style={styles.checkbox}
                checked={config.enableUserPanel}
                onChange={(e) => setConfig({ ...config, enableUserPanel: e.target.checked })}
              />
              Enable User Panel Testing
            </label>

            {config.enableUserPanel && (
              <>
                <label style={styles.label}>User Panel URL</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="https://example.com/dashboard (optional)"
                  value={config.userPanelUrl}
                  onChange={(e) => setConfig({ ...config, userPanelUrl: e.target.value })}
                />
                <div style={styles.helpText}>Leave blank to use main website URL</div>

                <label style={styles.label}>Authentication Strategy</label>
                <select
                  style={styles.select}
                  value={config.userAuthStrategy}
                  onChange={(e) => setConfig({ ...config, userAuthStrategy: e.target.value as any })}
                >
                  <option value="auto-register">Auto-register new user (recommended)</option>
                  <option value="provided">Use provided credentials</option>
                </select>

                {config.userAuthStrategy === 'provided' && (
                  <>
                    <label style={styles.label}>User Username</label>
                    <input
                      type="text"
                      style={styles.input}
                      placeholder="user@example.com"
                      value={config.userUsername}
                      onChange={(e) => setConfig({ ...config, userUsername: e.target.value })}
                    />

                    <label style={styles.label}>User Password</label>
                    <input
                      type="password"
                      style={styles.input}
                      placeholder="••••••••"
                      value={config.userPassword}
                      onChange={(e) => setConfig({ ...config, userPassword: e.target.value })}
                    />
                  </>
                )}
              </>
            )}
          </div>

          {/* Test Configuration */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>
              ⚙️ Test Configuration
            </div>
            <label style={styles.label}>Test Depth</label>
            <select
              style={styles.select}
              value={config.depth}
              onChange={(e) => setConfig({ ...config, depth: e.target.value as any })}
            >
              <option value="shallow">Shallow (Quick test, ~5 min)</option>
              <option value="deep">Deep (Comprehensive, ~20 min)</option>
              <option value="exhaustive">Exhaustive (Full coverage, ~45 min)</option>
            </select>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                style={styles.checkbox}
                checked={config.enableHealing}
                onChange={(e) => setConfig({ ...config, enableHealing: e.target.checked })}
              />
              Enable Self-Healing (Auto-fix broken tests)
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                style={styles.checkbox}
                checked={config.captureVideo}
                onChange={(e) => setConfig({ ...config, captureVideo: e.target.checked })}
              />
              Capture Video Recording
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                style={styles.checkbox}
                checked={config.testRBAC}
                onChange={(e) => setConfig({ ...config, testRBAC: e.target.checked })}
              />
              Test Role-Based Access Control (RBAC)
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                style={styles.checkbox}
                checked={config.testDataConsistency}
                onChange={(e) => setConfig({ ...config, testDataConsistency: e.target.checked })}
              />
              Test Data Consistency Across Panels
            </label>
          </div>

          {/* Start Button */}
          <button
            style={{
              ...styles.button,
              ...(isRunning ? styles.buttonDisabled : {}),
            }}
            onClick={handleStartTesting}
            disabled={isRunning}
          >
            {isRunning ? '🔄 Testing in progress...' : '🚀 Start Multi-Panel Testing'}
          </button>
        </>
      )}

      {/* Running Phase */}
      {phase === 'running' && progress && (
        <div style={styles.progressCard}>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
            {progress.phase === 'landing' && '📄 Testing Landing Page...'}
            {progress.phase === 'user' && '👤 Testing User Panel...'}
            {progress.phase === 'admin' && '⚡ Testing Admin Panel...'}
            {progress.phase === 'rbac' && '🔒 Testing Access Control...'}
            {progress.phase === 'report' && '📊 Generating Report...'}
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            {progress.message}
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress.progress}%` }} />
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '8px', textAlign: 'right' }}>
            {Math.round(progress.progress)}%
          </div>
        </div>
      )}

      {/* Completed Phase */}
      {phase === 'completed' && result && (
        <div>
          <div style={styles.card}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#10b981' }}>
              ✅ Multi-Panel Testing Completed!
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{result.summary.totalTests}</div>
                <div style={styles.statLabel}>Total Tests</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statValue, color: '#10b981' }}>
                  {result.summary.totalPassed}
                </div>
                <div style={styles.statLabel}>Passed</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statValue, color: '#ef4444' }}>
                  {result.summary.totalFailed}
                </div>
                <div style={styles.statLabel}>Failed</div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statValue, color: '#f59e0b' }}>
                  {result.summary.totalHealed}
                </div>
                <div style={styles.statLabel}>Healed</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{result.summary.overallCoverage}%</div>
                <div style={styles.statLabel}>Coverage</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{Math.round(result.duration / 1000)}s</div>
                <div style={styles.statLabel}>Duration</div>
              </div>
            </div>
          </div>

          <button style={styles.button} onClick={handleReset}>
            🔄 Run New Test
          </button>
        </div>
      )}
    </div>
  );
}
