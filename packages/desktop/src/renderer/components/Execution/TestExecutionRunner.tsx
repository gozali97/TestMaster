import { useState, useEffect } from 'react';
import { ApiService } from '../../services/api.service';
import './TestExecutionRunner.css';

interface TestCase {
  id: number;
  name: string;
  description: string;
  projectId: number;
}

interface Project {
  id: number;
  name: string;
}

interface ExecutionResult {
  id: number;
  testCaseId: number;
  status: 'running' | 'passed' | 'failed' | 'error';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  logs: (string | any)[]; // Can be string or object with {level, message, timestamp}
  screenshots?: string[];
  video?: string;
  error?: string;
}

export const TestExecutionRunner = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedTestCase, setSelectedTestCase] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [recordVideo, setRecordVideo] = useState(true); // Video recording enabled by default

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Load test cases when project is selected
  useEffect(() => {
    if (selectedProject) {
      loadTestCases(selectedProject);
    } else {
      setTestCases([]);
      setSelectedTestCase(null);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    const result = await ApiService.getProjects();
    if (result.success && result.data) {
      setProjects(result.data);
    }
  };

  const loadTestCases = async (projectId: number) => {
    const result = await ApiService.getTestCases(projectId);
    if (result.success && result.data) {
      setTestCases(result.data);
    }
  };

  const executeTest = async () => {
    if (!selectedTestCase) return;

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

      const testResult = await ApiService.getTestCase(testCase.projectId, selectedTestCase);
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
      const execResult = await ApiService.executeTest(
        testCase.projectId,
        selectedTestCase,
        {
          captureVideo: recordVideo,
          captureScreenshots: true,
          headless: false,
        }
      );

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
          
          const statusResult = await ApiService.getExecutionResults(runId);
          
          if (statusResult.success && statusResult.data) {
            const status = statusResult.data.status;
            
            if (status === 'PASSED' || status === 'FAILED' || status === 'ERROR') {
              executionComplete = true;
              setExecutionLogs(prev => [...prev, `✅ Execution completed with status: ${status}`]);
              
              setExecutionResult({
                id: runId,
                testCaseId: selectedTestCase,
                status: status.toLowerCase() as any,
                startedAt: statusResult.data.startedAt || new Date().toISOString(),
                completedAt: statusResult.data.completedAt || new Date().toISOString(),
                duration: statusResult.data.duration || 0,
                logs: statusResult.data.logs || [],
                screenshots: statusResult.data.screenshots || [],
                video: statusResult.data.video,
              });
            } else {
              setExecutionLogs(prev => [...prev, `⏳ Status: ${status}...`]);
            }
          }
          
          attempts++;
        }

        if (!executionComplete) {
          throw new Error('Execution timeout - please check the executions list');
        }
      } else {
        throw new Error(execResult.error || 'Failed to start execution');
      }

    } catch (error: any) {
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
    } finally {
      setIsExecuting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return '⏳';
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'error': return '⚠️';
      default: return '•';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return '#FFA500';
      case 'passed': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'error': return '#FF9800';
      default: return '#999';
    }
  };

  return (
    <div className="test-execution-runner">
      <div className="execution-header">
        <h2>▶️ Manual Test Execution</h2>
        <p>Select and execute test cases manually</p>
      </div>

      <div className="execution-content">
        {/* Selection Panel */}
        <div className="selection-panel">
          <div className="form-group">
            <label>Select Project:</label>
            <select 
              value={selectedProject || ''} 
              onChange={(e) => setSelectedProject(Number(e.target.value) || null)}
              disabled={isExecuting}
            >
              <option value="">-- Select Project --</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {selectedProject && (
            <div className="form-group">
              <label>Select Test Case:</label>
              <select 
                value={selectedTestCase || ''} 
                onChange={(e) => setSelectedTestCase(Number(e.target.value) || null)}
                disabled={isExecuting}
              >
                <option value="">-- Select Test Case --</option>
                {testCases.map(test => (
                  <option key={test.id} value={test.id}>
                    {test.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="execution-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={recordVideo}
                onChange={(e) => setRecordVideo(e.target.checked)}
                disabled={isExecuting}
              />
              <span>📹 Record Video (saved to Downloads/TestMaster-Videos)</span>
            </label>
          </div>

          <div className="execution-actions">
            <button
              className="btn-execute"
              onClick={executeTest}
              disabled={!selectedTestCase || isExecuting}
            >
              {isExecuting ? '⏳ Executing...' : '▶️ Execute Test'}
            </button>
          </div>
        </div>

        {/* Execution Logs */}
        {executionLogs.length > 0 && (
          <div className="execution-logs">
            <h3>Execution Logs</h3>
            <div className="logs-container">
              {executionLogs.map((log, index) => {
                // Handle both string and object logs
                const logText = typeof log === 'string' 
                  ? log 
                  : (log as any).message || JSON.stringify(log);
                
                return (
                  <div key={index} className="log-entry">
                    <span className="log-time">{new Date().toLocaleTimeString()}</span>
                    <span className="log-message">{logText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Execution Results */}
        {executionResult && (
          <div className="execution-results">
            <h3>📊 Execution Results</h3>
            <div className="result-summary" style={{ borderLeftColor: getStatusColor(executionResult.status) }}>
              <div className="result-status">
                <span className="status-icon" style={{ color: getStatusColor(executionResult.status) }}>
                  {getStatusIcon(executionResult.status)}
                </span>
                <span className="status-text">{executionResult.status.toUpperCase()}</span>
              </div>
              
              {/* Execution Metrics */}
              <div className="result-metrics">
                {executionResult.duration && (
                  <div className="result-metric">
                    <strong>⏱️ Duration:</strong> {(executionResult.duration / 1000).toFixed(2)}s ({executionResult.duration}ms)
                  </div>
                )}
                
                {executionResult.startedAt && (
                  <div className="result-metric">
                    <strong>🚀 Started:</strong> {new Date(executionResult.startedAt).toLocaleString()}
                  </div>
                )}
                
                {executionResult.completedAt && (
                  <div className="result-metric">
                    <strong>🏁 Completed:</strong> {new Date(executionResult.completedAt).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Screenshots Info */}
              {executionResult.screenshots && executionResult.screenshots.length > 0 && (
                <div className="result-metric">
                  <strong>📸 Screenshots:</strong> {executionResult.screenshots.length} captured
                  <div className="screenshots-list">
                    {executionResult.screenshots.slice(0, 3).map((screenshot, index) => (
                      <div key={index} className="screenshot-item">
                        • {screenshot.split(/[\\/]/).pop()}
                      </div>
                    ))}
                    {executionResult.screenshots.length > 3 && (
                      <div className="screenshot-item">... and {executionResult.screenshots.length - 3} more</div>
                    )}
                  </div>
                </div>
              )}

              {/* Video Info */}
              {executionResult.video && (
                <div className="result-metric">
                  <strong>📹 Video Recording:</strong>
                  <div className="video-info">
                    <span>✅ Saved to: {executionResult.video}</span>
                    <button 
                      className="btn-open-video"
                      onClick={async () => {
                        // Use electron IPC to open the video file's directory
                        if (executionResult.video && (window as any).electron?.openPath) {
                          try {
                            const result = await (window as any).electron.openPath(executionResult.video);
                            if (!result.success) {
                              console.error('Failed to open folder:', result.error);
                              alert('Failed to open folder: ' + result.error);
                            }
                          } catch (error: any) {
                            console.error('Error opening folder:', error);
                            alert('Error opening folder: ' + error.message);
                          }
                        } else {
                          alert('Electron API not available');
                        }
                      }}
                    >
                      📂 Open Folder
                    </button>
                  </div>
                </div>
              )}

              {/* Error Details */}
              {executionResult.error && (
                <div className="result-error">
                  <strong>❌ Error:</strong>
                  <pre>{executionResult.error}</pre>
                </div>
              )}
            </div>

            {/* Detailed Logs */}
            {executionResult.logs && executionResult.logs.length > 0 && (
              <div className="result-logs">
                <h4>📝 Detailed Execution Logs</h4>
                <div className="logs-container">
                  {executionResult.logs.map((log, index) => {
                    // Handle both string and object logs
                    const logText = typeof log === 'string' 
                      ? log 
                      : (log as any).message || JSON.stringify(log);
                    
                    return (
                      <div key={index} className="log-entry">
                        <span className="log-number">{index + 1}</span>
                        <span className="log-text">{logText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!selectedProject && !isExecuting && !executionResult && (
          <div className="empty-state">
            <div className="empty-icon">▶️</div>
            <h3>Ready to Execute Tests</h3>
            <p>Select a project and test case to begin manual execution</p>
            <div className="empty-features">
              <div className="feature">
                <strong>✅ Real Browser Testing</strong>
                <span>Execute tests in visible browser</span>
              </div>
              <div className="feature">
                <strong>📹 Video Recording</strong>
                <span>Capture test execution on video</span>
              </div>
              <div className="feature">
                <strong>📸 Screenshots</strong>
                <span>Take screenshots at each step</span>
              </div>
              <div className="feature">
                <strong>📊 Detailed Logs</strong>
                <span>View execution logs in real-time</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
