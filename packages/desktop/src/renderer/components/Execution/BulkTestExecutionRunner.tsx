import { useState, useEffect } from 'react';
import { ApiService, TestCase as ApiTestCase } from '../../services/api.service';
import './TestExecutionRunner.css';

interface TestCase extends ApiTestCase {}

interface Project {
  id: number;
  name: string;
}

interface BulkExecutionResult {
  testCaseId: number;
  testCaseName: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'error';
  duration?: number;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export const BulkTestExecutionRunner = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [testCasesByProject, setTestCasesByProject] = useState<Map<number, TestCase[]>>(new Map());
  const [selectedTests, setSelectedTests] = useState<Set<number>>(new Set());
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<Map<number, BulkExecutionResult>>(new Map());
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
  const [executionMode, setExecutionMode] = useState<'sequential' | 'parallel'>('sequential');
  const [currentExecuting, setCurrentExecuting] = useState<number | null>(null);

  useEffect(() => {
    loadProjectsAndTests();
  }, []);

  const loadProjectsAndTests = async () => {
    const result = await ApiService.getProjects();
    if (result.success && result.data) {
      setProjects(result.data);
      
      // Load test cases for each project
      const testsMap = new Map<number, TestCase[]>();
      for (const project of result.data) {
        const testsResult = await ApiService.getTestCases(project.id);
        if (testsResult.success && testsResult.data) {
          testsMap.set(project.id, testsResult.data);
        }
      }
      setTestCasesByProject(testsMap);
      
      // Expand all projects by default
      setExpandedProjects(new Set(result.data.map(p => p.id)));
    }
  };

  const toggleProject = (projectId: number) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const toggleTestSelection = (testId: number) => {
    const newSelected = new Set(selectedTests);
    if (newSelected.has(testId)) {
      newSelected.delete(testId);
    } else {
      newSelected.add(testId);
    }
    setSelectedTests(newSelected);
  };

  const toggleProjectTests = (projectId: number) => {
    const tests = testCasesByProject.get(projectId) || [];
    const newSelected = new Set(selectedTests);
    const allSelected = tests.every(t => newSelected.has(t.id));
    
    if (allSelected) {
      // Unselect all
      tests.forEach(t => newSelected.delete(t.id));
    } else {
      // Select all
      tests.forEach(t => newSelected.add(t.id));
    }
    setSelectedTests(newSelected);
  };

  const selectAllTests = () => {
    const allTestIds = Array.from(testCasesByProject.values())
      .flat()
      .map(t => t.id);
    setSelectedTests(new Set(allTestIds));
  };

  const deselectAllTests = () => {
    setSelectedTests(new Set());
  };

  const executeTests = async () => {
    if (selectedTests.size === 0) return;

    setIsExecuting(true);
    setExecutionLogs([`🚀 Starting bulk execution of ${selectedTests.size} test(s)...`]);
    setExecutionLogs(prev => [...prev, `⚙️ Execution mode: ${executionMode}`]);
    
    if (executionMode === 'sequential') {
      setExecutionLogs(prev => [...prev, `🌐 Browser will be visible during execution`]);
      setExecutionLogs(prev => [...prev, `⏳ Tests will run one by one`]);
      setExecutionLogs(prev => [...prev, `🔄 Browser will close after each test`]);
    } else {
      setExecutionLogs(prev => [...prev, `🚀 All tests will run simultaneously`]);
      setExecutionLogs(prev => [...prev, `💻 Multiple browser instances will be launched`]);
    }
    
    setExecutionLogs(prev => [...prev, `─────────────────────────────────`]);

    // Initialize results
    const resultsMap = new Map<number, BulkExecutionResult>();
    selectedTests.forEach(testId => {
      const test = findTestById(testId);
      if (test) {
        resultsMap.set(testId, {
          testCaseId: testId,
          testCaseName: test.name,
          status: 'pending',
        });
      }
    });
    setExecutionResults(resultsMap);

    try {
      if (executionMode === 'sequential') {
        await executeSequential(Array.from(selectedTests));
      } else {
        await executeParallel(Array.from(selectedTests));
      }
      
      setExecutionLogs(prev => [...prev, `═════════════════════════════════`]);
      setExecutionLogs(prev => [...prev, '✅ All tests execution completed!']);
      
      // Show summary
      const summary = getSummary();
      setExecutionLogs(prev => [...prev, `📊 Summary: ${summary.total} total | ${summary.passed} passed | ${summary.failed} failed | ${summary.error} error`]);
    } catch (error: any) {
      setExecutionLogs(prev => [...prev, `❌ Execution error: ${error.message}`]);
    } finally {
      setIsExecuting(false);
      setCurrentExecuting(null);
    }
  };

  const executeSequential = async (testIds: number[]) => {
    for (const testId of testIds) {
      await executeSingleTest(testId);
    }
  };

  const executeParallel = async (testIds: number[]) => {
    // Execute all tests in parallel
    await Promise.all(testIds.map(testId => executeSingleTest(testId)));
  };

  const executeSingleTest = async (testId: number) => {
    const test = findTestById(testId);
    if (!test) return;

    setCurrentExecuting(testId);
    updateTestResult(testId, { status: 'running', startedAt: new Date().toISOString() });
    setExecutionLogs(prev => [...prev, `▶️ Executing: ${test.name}`]);
    setExecutionLogs(prev => [...prev, `📝 Loading test case details...`]);

    const startTime = Date.now();

    try {
      // Get test case details first
      const testResult = await ApiService.getTestCase(test.projectId, testId);
      if (!testResult.success || !testResult.data) {
        throw new Error('Failed to load test case details');
      }

      const testCaseDetails = testResult.data;
      setExecutionLogs(prev => [...prev, `📊 Steps to execute: ${testCaseDetails.steps?.length || 0}`]);

      // Execute test via API with visible browser
      setExecutionLogs(prev => [...prev, `🌐 Launching browser...`]);
      const execResult = await ApiService.executeTest(
        test.projectId,
        testId,
        {
          captureVideo: false, // Disable video for bulk execution
          captureScreenshots: true,
          headless: false, // Run in visible browser
        }
      );

      if (execResult.success && execResult.data?.runId) {
        const runId = execResult.data.runId;
        setExecutionLogs(prev => [...prev, `📋 Test run created: ${runId}`]);
        setExecutionLogs(prev => [...prev, `⏳ Waiting for execution to complete...`]);
        
        // Poll for completion
        let attempts = 0;
        const maxAttempts = 180; // 3 minutes timeout
        let complete = false;

        while (attempts < maxAttempts && !complete) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const statusResult = await ApiService.getExecutionResults(runId);
          
          if (statusResult.success && statusResult.data) {
            const status = statusResult.data.status;
            
            // Log status updates
            if (attempts % 5 === 0) { // Log every 5 seconds
              setExecutionLogs(prev => [...prev, `⏳ Status: ${status}...`]);
            }
            
            if (status === 'PASSED' || status === 'FAILED' || status === 'ERROR') {
              complete = true;
              const duration = Date.now() - startTime;
              
              updateTestResult(testId, {
                status: status.toLowerCase() as any,
                duration,
                completedAt: new Date().toISOString(),
              });
              
              const icon = status === 'PASSED' ? '✅' : status === 'FAILED' ? '❌' : '⚠️';
              setExecutionLogs(prev => [...prev, `${icon} ${test.name}: ${status} (${(duration/1000).toFixed(2)}s)`]);
              
              // Log execution details
              if (statusResult.data.logs && statusResult.data.logs.length > 0) {
                setExecutionLogs(prev => [...prev, `📝 Execution details:`]);
                const recentLogs = statusResult.data.logs.slice(-3); // Last 3 logs
                recentLogs.forEach((log: any) => {
                  const logText = typeof log === 'string' ? log : (log.message || JSON.stringify(log));
                  setExecutionLogs(prev => [...prev, `   ${logText}`]);
                });
              }

              // Wait a bit before closing browser
              await new Promise(resolve => setTimeout(resolve, 2000));
              setExecutionLogs(prev => [...prev, `🔄 Closing browser...`]);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          
          attempts++;
        }

        if (!complete) {
          throw new Error('Execution timeout - test took too long');
        }
      } else {
        throw new Error(execResult.error || 'Failed to start execution');
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestResult(testId, {
        status: 'error',
        duration,
        error: error.message,
        completedAt: new Date().toISOString(),
      });
      setExecutionLogs(prev => [...prev, `❌ ${test.name}: ERROR - ${error.message}`]);
    }

    setExecutionLogs(prev => [...prev, `─────────────────────────────────`]);
  };

  const findTestById = (testId: number): TestCase | undefined => {
    for (const tests of testCasesByProject.values()) {
      const test = tests.find(t => t.id === testId);
      if (test) return test;
    }
    return undefined;
  };

  const updateTestResult = (testId: number, updates: Partial<BulkExecutionResult>) => {
    setExecutionResults(prev => {
      const newResults = new Map(prev);
      const current = newResults.get(testId);
      if (current) {
        newResults.set(testId, { ...current, ...updates });
      }
      return newResults;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏸️';
      case 'running': return '⏳';
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'error': return '⚠️';
      default: return '•';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#999';
      case 'running': return '#FFA500';
      case 'passed': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'error': return '#FF9800';
      default: return '#999';
    }
  };

  const getSummary = () => {
    const results = Array.from(executionResults.values());
    return {
      total: results.length,
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'failed').length,
      error: results.filter(r => r.status === 'error').length,
      pending: results.filter(r => r.status === 'pending').length,
      running: results.filter(r => r.status === 'running').length,
    };
  };

  return (
    <div className="test-execution-runner bulk-execution">
      <div className="execution-header">
        <h2>⚡ Bulk Test Execution</h2>
        <p>Select and execute multiple test cases</p>
      </div>

      <div className="execution-content">
        {/* Selection Panel */}
        <div className="bulk-selection-panel">
          <div className="selection-header">
            <h3>📋 Select Tests to Execute</h3>
            <div className="selection-actions">
              <button
                className="btn-secondary btn-sm"
                onClick={selectAllTests}
                disabled={isExecuting}
              >
                ✅ Select All
              </button>
              <button
                className="btn-secondary btn-sm"
                onClick={deselectAllTests}
                disabled={isExecuting}
              >
                ❌ Deselect All
              </button>
              <span className="selected-count">
                {selectedTests.size} test(s) selected
              </span>
            </div>
          </div>

          <div className="execution-mode-selector">
            <label>Execution Mode:</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  value="sequential"
                  checked={executionMode === 'sequential'}
                  onChange={() => setExecutionMode('sequential')}
                  disabled={isExecuting}
                />
                <span>🔄 Sequential (one by one, browser visible)</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="parallel"
                  checked={executionMode === 'parallel'}
                  onChange={() => setExecutionMode('parallel')}
                  disabled={isExecuting}
                />
                <span>⚡ Parallel (all at once, multiple browsers)</span>
              </label>
            </div>
            <p className="mode-description">
              {executionMode === 'sequential' 
                ? '🌐 Sequential mode: Tests run one by one with visible browser. Browser closes after each test completes.'
                : '🚀 Parallel mode: All tests run simultaneously with separate browser instances for faster execution.'}
            </p>
          </div>

          {/* Test List by Project */}
          <div className="test-list-by-project">
            {projects.map(project => {
              const tests = testCasesByProject.get(project.id) || [];
              const selectedInProject = tests.filter(t => selectedTests.has(t.id)).length;
              const allSelected = tests.length > 0 && selectedInProject === tests.length;
              const isExpanded = expandedProjects.has(project.id);

              return (
                <div key={project.id} className="project-group">
                  <div className="project-header">
                    <button
                      className="project-toggle"
                      onClick={() => toggleProject(project.id)}
                    >
                      <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
                    </button>
                    <label className="project-checkbox">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={() => toggleProjectTests(project.id)}
                        disabled={isExecuting || tests.length === 0}
                      />
                      <span className="project-name">
                        📁 {project.name}
                        <span className="test-count">
                          ({selectedInProject}/{tests.length})
                        </span>
                      </span>
                    </label>
                  </div>

                  {isExpanded && (
                    <div className="project-tests">
                      {tests.length === 0 ? (
                        <div className="no-tests">No test cases in this project</div>
                      ) : (
                        tests.map(test => {
                          const isSelected = selectedTests.has(test.id);
                          const result = executionResults.get(test.id);
                          const isCurrent = currentExecuting === test.id;

                          return (
                            <div
                              key={test.id}
                              className={`test-item ${isSelected ? 'selected' : ''} ${isCurrent ? 'executing' : ''}`}
                            >
                              <label className="test-checkbox">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleTestSelection(test.id)}
                                  disabled={isExecuting}
                                />
                                <span className="test-info">
                                  <span className="test-name">{test.name}</span>
                                  {test.description && (
                                    <span className="test-description">{test.description}</span>
                                  )}
                                </span>
                              </label>
                              
                              {result && (
                                <div className="test-status">
                                  <span
                                    className="status-badge"
                                    style={{ color: getStatusColor(result.status) }}
                                  >
                                    {getStatusIcon(result.status)} {result.status}
                                  </span>
                                  {result.duration && (
                                    <span className="test-duration">
                                      {(result.duration / 1000).toFixed(2)}s
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="execution-actions">
            <button
              className="btn-execute btn-lg"
              onClick={executeTests}
              disabled={selectedTests.size === 0 || isExecuting}
            >
              {isExecuting ? '⏳ Executing...' : `⚡ Execute ${selectedTests.size} Test(s)`}
            </button>
          </div>
        </div>

        {/* Results Summary */}
        {executionResults.size > 0 && (
          <div className="execution-summary">
            <h3>📊 Execution Summary</h3>
            <div className="summary-cards">
              {getSummary().total > 0 && (
                <>
                  <div className="summary-card">
                    <div className="card-value">{getSummary().total}</div>
                    <div className="card-label">Total</div>
                  </div>
                  <div className="summary-card success">
                    <div className="card-value">{getSummary().passed}</div>
                    <div className="card-label">✅ Passed</div>
                  </div>
                  <div className="summary-card failed">
                    <div className="card-value">{getSummary().failed}</div>
                    <div className="card-label">❌ Failed</div>
                  </div>
                  <div className="summary-card error">
                    <div className="card-value">{getSummary().error}</div>
                    <div className="card-label">⚠️ Error</div>
                  </div>
                  {getSummary().running > 0 && (
                    <div className="summary-card running">
                      <div className="card-value">{getSummary().running}</div>
                      <div className="card-label">⏳ Running</div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Execution Logs */}
        {executionLogs.length > 0 && (
          <div className="execution-logs">
            <h3>📝 Execution Logs</h3>
            <div className="logs-container">
              {executionLogs.map((log, index) => (
                <div key={index} className="log-entry">
                  <span className="log-time">{new Date().toLocaleTimeString()}</span>
                  <span className="log-message">{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {projects.length === 0 && !isExecuting && (
          <div className="empty-state">
            <div className="empty-icon">⚡</div>
            <h3>No Projects Found</h3>
            <p>Create a project and add test cases to begin bulk execution</p>
          </div>
        )}
      </div>
    </div>
  );
};
