'use client';

import { useEffect, useState } from 'react';
import { Play, Loader } from 'lucide-react';
import { api, Project, TestCase, TestRun } from '@/lib/api';

export default function ExecutionsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);

  const [headless, setHeadless] = useState(true);
  const [captureVideo, setCaptureVideo] = useState(false);

  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<TestRun | null>(null);
  const [history, setHistory] = useState<TestRun[]>([]);

  useEffect(() => {
    api.getProjects().then((r) => {
      if (r.success && r.data) setProjects(r.data);
    });
  }, []);

  useEffect(() => {
    if (selectedProject) {
      api.getTestCases(selectedProject).then((r) => {
        if (r.success && r.data) setTestCases(r.data);
      });
      loadHistory(selectedProject);
    } else {
      setTestCases([]);
      setSelectedTest(null);
      setHistory([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject]);

  const loadHistory = async (projectId: number) => {
    const r = await api.listExecutions(projectId);
    if (r.success && r.data) setHistory(r.data);
  };

  const execute = async () => {
    if (!selectedProject || !selectedTest) return;
    setRunning(true);
    setResult(null);
    setLogs(['🚀 Starting test execution...', '▶️ Launching Playwright...']);

    const exec = await api.executeTest(selectedProject, selectedTest, {
      headless,
      captureVideo,
      captureScreenshots: true,
    });

    if (!exec.success || !exec.data?.runId) {
      setLogs((p) => [...p, `❌ ${exec.error || 'Failed to start execution'}`]);
      setRunning(false);
      return;
    }

    const runId = exec.data.runId;
    setLogs((p) => [...p, `📋 Test run created: #${runId}`, '⏳ Waiting for completion...']);

    let attempts = 0;
    while (attempts < 90) {
      await new Promise((r) => setTimeout(r, 1000));
      const status = await api.getExecution(runId);
      if (status.success && status.data) {
        const s = status.data.status;
        if (['PASSED', 'FAILED', 'ERROR', 'STOPPED'].includes(s)) {
          setResult(status.data);
          setLogs((p) => [...p, `🏁 Completed: ${s}`]);
          setRunning(false);
          if (selectedProject) loadHistory(selectedProject);
          return;
        }
      }
      attempts++;
    }
    setLogs((p) => [...p, '⚠️ Timeout waiting for execution']);
    setRunning(false);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'PASSED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      case 'RUNNING':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Test Executions</h1>

      {/* Runner */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">▶️ Run a Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(Number(e.target.value) || null)}
              disabled={running}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Project --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Test Case</label>
            <select
              value={selectedTest || ''}
              onChange={(e) => setSelectedTest(Number(e.target.value) || null)}
              disabled={running || !selectedProject}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Test Case --</option>
              {testCases.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input
              type="checkbox"
              checked={headless}
              onChange={(e) => setHeadless(e.target.checked)}
              disabled={running}
            />
            Headless mode
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input
              type="checkbox"
              checked={captureVideo}
              onChange={(e) => setCaptureVideo(e.target.checked)}
              disabled={running}
            />
            📹 Record video
          </label>
        </div>

        <button
          onClick={execute}
          disabled={!selectedTest || running}
          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          {running ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {running ? 'Executing...' : 'Execute Test'}
        </button>
      </div>

      {/* Live logs + result */}
      {(logs.length > 0 || result) && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Execution Output</h2>
          {result && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg border-l-4 ${
                result.status === 'PASSED'
                  ? 'bg-green-50 border-green-500'
                  : 'bg-red-50 border-red-500'
              }`}
            >
              <span className="font-bold">
                {result.status === 'PASSED' ? '✅' : '❌'} {result.status}
              </span>
              {typeof result.passedTests === 'number' && (
                <span className="ml-3 text-sm text-gray-600">
                  {result.passedTests} passed / {result.failedTests} failed
                </span>
              )}
              {result.errorMessage && (
                <pre className="mt-2 text-sm text-red-700 whitespace-pre-wrap">
                  {result.errorMessage}
                </pre>
              )}
              {result.screenshots && result.screenshots.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  📸 {result.screenshots.length} screenshot(s) captured
                </p>
              )}
              {result.video && (
                <p className="mt-1 text-sm text-gray-600">📹 Video: {result.video}</p>
              )}
            </div>
          )}
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-xs max-h-96 overflow-auto">
            {logs.map((log, i) => (
              <div key={i} className="py-0.5">
                {log}
              </div>
            ))}
            {result?.logs?.map((log, i) => (
              <div key={`r-${i}`} className="py-0.5 text-gray-400">
                {typeof log === 'string' ? log : log.message || JSON.stringify(log)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            Execution History {selectedProject ? '' : '(select a project)'}
          </h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Run</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tests</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((run) => (
              <tr key={run.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">#{run.id}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${statusBadge(run.status)}`}>
                    {run.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span className="text-green-600 font-medium">{run.passedTests ?? 0}</span>
                  {' / '}
                  <span className="text-red-600 font-medium">{run.failedTests ?? 0}</span>
                  {' / '}
                  <span className="text-gray-500">{run.totalTests ?? 0}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {run.startedAt ? new Date(run.startedAt).toLocaleString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {history.length === 0 && (
          <div className="text-center py-12 text-gray-500">No executions yet</div>
        )}
      </div>
    </div>
  );
}
