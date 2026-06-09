// Centralized API client for the web portal.
// Mirrors the desktop ApiService so the web app has feature parity.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: any;
}

export interface TestStep {
  id: string;
  action: string;
  locator?: string;
  value?: string;
  description?: string;
  timeout?: number;
  assertionType?: string;
  enabled?: boolean;
  waitCondition?: string;
  screenshot?: string;
  scrollIntoView?: boolean;
  customProperties?: Record<string, any>;
}

export interface TestCase {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  type?: string;
  priority?: string;
  steps: TestStep[];
  variables?: any[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  organizationId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExecutionConfig {
  headless?: boolean;
  captureVideo?: boolean;
  captureScreenshots?: boolean;
  slowMo?: number;
  browserName?: string;
}

export interface TestRun {
  id: number;
  projectId: number;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED' | 'ERROR' | 'STOPPED';
  startedAt?: string;
  completedAt?: string;
  totalTests?: number;
  passedTests?: number;
  failedTests?: number;
  logs?: (string | { message?: string })[];
  screenshots?: string[];
  video?: string;
  errorMessage?: string;
  errorStack?: string;
}

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
      return { success: false, error: 'Unauthorized' };
    }

    try {
      return await response.json();
    } catch (err: any) {
      return { success: false, error: 'Failed to parse response' };
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Network error' };
  }
}

export const api = {
  // Projects
  getProjects: () => request<Project[]>('/api/projects'),
  getProject: (id: number) => request<Project>(`/api/projects/${id}`),
  createProject: (data: { name: string; description?: string }) =>
    request<Project>('/api/projects', { method: 'POST', body: JSON.stringify(data) }),

  // Test cases
  getTestCases: (projectId: number) => request<TestCase[]>(`/api/projects/${projectId}/tests`),
  getTestCase: (projectId: number, testId: number) =>
    request<TestCase>(`/api/projects/${projectId}/tests/${testId}`),
  createTestCase: (projectId: number, data: Partial<TestCase>) =>
    request<TestCase>(`/api/projects/${projectId}/tests`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTestCase: (projectId: number, testId: number, data: Partial<TestCase>) =>
    request<TestCase>(`/api/projects/${projectId}/tests/${testId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTestCase: (projectId: number, testId: number) =>
    request<void>(`/api/projects/${projectId}/tests/${testId}`, { method: 'DELETE' }),

  // Executions
  executeTest: (
    projectId: number,
    testCaseIds: number | number[],
    config?: ExecutionConfig
  ) => {
    const ids = Array.isArray(testCaseIds) ? testCaseIds : [testCaseIds];
    return request<{ runId: number; status: string; message: string }>('/api/executions', {
      method: 'POST',
      body: JSON.stringify({ projectId, testCaseIds: ids, config: config || {} }),
    });
  },
  getExecution: (runId: number) => request<TestRun>(`/api/executions/${runId}`),
  listExecutions: (projectId: number) =>
    request<TestRun[]>(`/api/projects/${projectId}/executions`),
};

export { API_URL };
