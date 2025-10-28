import { useState, useEffect } from 'react';
import { ApiService, TestCase } from '../../services/api.service';
import './TestCaseList.css';

interface TestCaseListProps {
  projectId: number;
  onSelectTest: (testId: number) => void;
  onBack: () => void;
}

export const TestCaseList = ({ projectId, onSelectTest, onBack }: TestCaseListProps) => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    loadTestCases();
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    const result = await ApiService.getProject(projectId);
    if (result.success && result.data) {
      setProjectName(result.data.name);
    }
  };

  const loadTestCases = async () => {
    setLoading(true);
    setError('');

    const result = await ApiService.getTestCases(projectId);

    if (result.success && result.data) {
      setTestCases(result.data);
    } else {
      setError(result.error || 'Failed to load test cases');
    }

    setLoading(false);
  };

  const handleCreateNew = () => {
    // Create new test case with null ID
    onSelectTest(0); // 0 or null means create new
  };

  const handleDelete = async (testId: number, testName: string) => {
    if (!confirm(`Delete test case "${testName}"? This action cannot be undone.`)) {
      return;
    }

    const result = await ApiService.deleteTestCase(projectId, testId);

    if (result.success) {
      loadTestCases();
    } else {
      alert('Failed to delete test case: ' + (result.error || 'Unknown error'));
    }
  };

  const handleDuplicate = async (testId: number, testName: string) => {
    if (!confirm(`Duplicate test case "${testName}"?`)) {
      return;
    }

    const result = await ApiService.duplicateTestCase(projectId, testId);

    if (result.success) {
      alert('Test case duplicated successfully!');
      loadTestCases(); // Reload to show the new copy
    } else {
      alert('Failed to duplicate test case: ' + (result.error || 'Unknown error'));
    }
  };

  const handleCopyJSON = (testCase: TestCase) => {
    const jsonData = JSON.stringify(testCase, null, 2);
    
    // Copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(jsonData)
        .then(() => {
          alert('Test case JSON copied to clipboard!');
        })
        .catch(() => {
          // Fallback method
          copyToClipboardFallback(jsonData);
        });
    } else {
      copyToClipboardFallback(jsonData);
    }
  };

  const copyToClipboardFallback = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert('Test case JSON copied to clipboard!');
    } catch (err) {
      alert('Failed to copy to clipboard');
    }
    document.body.removeChild(textArea);
  };

  if (loading) {
    return (
      <div className="test-case-list loading">
        <div className="spinner"></div>
        <p>Loading test cases...</p>
      </div>
    );
  }

  return (
    <div className="test-case-list">
      <div className="header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Projects
        </button>
        <div>
          <h2>{projectName}</h2>
          <p className="subtitle">Test Cases</p>
        </div>
        <button className="btn-create" onClick={handleCreateNew}>
          + New Test Case
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadTestCases}>Retry</button>
        </div>
      )}

      <div className="test-cases-grid">
        {testCases.map((testCase) => (
          <div key={testCase.id} className="test-case-card">
            <div className="test-case-content" onClick={() => onSelectTest(testCase.id)}>
              <h3>{testCase.name}</h3>
              <p className="description">{testCase.description || 'No description'}</p>
              <div className="test-case-meta">
                <span className="steps-count">
                  {testCase.steps?.length || 0} steps
                </span>
                {testCase.variables && testCase.variables.length > 0 && (
                  <span className="variables-count">
                    {testCase.variables.length} variables
                  </span>
                )}
                <span className={`status ${testCase.status?.toLowerCase()}`}>
                  {testCase.status || 'DRAFT'}
                </span>
              </div>
              {testCase.createdAt && (
                <div className="test-case-date">
                  Created: {new Date(testCase.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
            <div className="test-case-actions">
              <button
                className="btn-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTest(testCase.id);
                }}
                title="Edit test case"
              >
                ✏️ Edit
              </button>
              <button
                className="btn-icon btn-duplicate"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicate(testCase.id, testCase.name);
                }}
                title="Duplicate test case"
              >
                📋 Copy
              </button>
              <button
                className="btn-icon btn-json"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyJSON(testCase);
                }}
                title="Copy as JSON"
              >
                📄 JSON
              </button>
              <button
                className="btn-icon btn-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(testCase.id, testCase.name);
                }}
                title="Delete test case"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {testCases.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p>No test cases yet</p>
          <button className="btn-create-large" onClick={handleCreateNew}>
            Create Your First Test Case
          </button>
        </div>
      )}
    </div>
  );
};
