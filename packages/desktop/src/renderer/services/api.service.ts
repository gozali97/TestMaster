// API Service - Centralized API communication for Desktop app

import { getBaseUrl } from '../config/api.config';

const API_URL = getBaseUrl();

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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
  organizationId: number;
  createdAt?: string;
  updatedAt?: string;
}

export class ApiService {
  /**
   * Get authorization headers with token
   */
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /**
   * Handle API response
   */
  private static async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to parse response',
      };
    }
  }

  /**
   * Generic API request
   */
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      // Handle 401 - Token expired
      if (response.status === 401) {
        // TODO: Implement token refresh logic
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return { success: false, error: 'Unauthorized' };
      }

      return await this.handleResponse<T>(response);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  // ============================================
  // PROJECTS
  // ============================================

  /**
   * Get all projects
   */
  static async getProjects(): Promise<ApiResponse<Project[]>> {
    return this.request<Project[]>('/api/projects');
  }

  /**
   * Get project by ID
   */
  static async getProject(id: number): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/api/projects/${id}`);
  }

  /**
   * Create new project
   */
  static async createProject(data: {
    name: string;
    description?: string;
  }): Promise<ApiResponse<Project>> {
    return this.request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update project
   */
  static async updateProject(
    id: number,
    data: Partial<Project>
  ): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete project
   */
  static async deleteProject(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // TEST CASES
  // ============================================

  /**
   * Get all test cases for a project
   */
  static async getTestCases(projectId: number): Promise<ApiResponse<TestCase[]>> {
    return this.request<TestCase[]>(`/api/projects/${projectId}/tests`);
  }

  /**
   * Get test case by ID
   */
  static async getTestCase(projectId: number, testId: number): Promise<ApiResponse<TestCase>> {
    return this.request<TestCase>(`/api/projects/${projectId}/tests/${testId}`);
  }

  /**
   * Create new test case
   */
  static async createTestCase(
    projectId: number,
    data: {
      name: string;
      description?: string;
      steps: TestStep[];
      variables?: any[];
    }
  ): Promise<ApiResponse<TestCase>> {
    return this.request<TestCase>(`/api/projects/${projectId}/tests`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update test case
   */
  static async updateTestCase(
    projectId: number,
    testId: number,
    data: Partial<TestCase>
  ): Promise<ApiResponse<TestCase>> {
    return this.request<TestCase>(`/api/projects/${projectId}/tests/${testId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete test case
   */
  static async deleteTestCase(projectId: number, testId: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/projects/${projectId}/tests/${testId}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // AUTHENTICATION
  // ============================================

  /**
   * Login
   */
  static async login(email: string, password: string): Promise<ApiResponse<any>> {
    return this.request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  /**
   * Register
   */
  static async register(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Refresh token
   */
  static async refreshToken(): Promise<ApiResponse<any>> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.request<any>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  /**
   * Store auth tokens
   */
  static storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  /**
   * Clear auth tokens
   */
  static clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Check if authenticated
   */
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  // ============================================
  // TEST EXECUTION
  // ============================================

  /**
   * Execute test case(s)
   */
  static async executeTest(
    projectId: number,
    testCaseIds: number | number[],
    config?: any
  ): Promise<ApiResponse<any>> {
    const ids = Array.isArray(testCaseIds) ? testCaseIds : [testCaseIds];
    return this.request<any>(`/api/executions`, {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        testCaseIds: ids,
        config: config || {},
      }),
    });
  }

  /**
   * Get test execution results
   */
  static async getExecutionResults(executionId: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/executions/${executionId}`);
  }

  // ============================================
  // GENERIC HTTP METHODS
  // ============================================

  /**
   * Generic GET request
   */
  static async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * Generic POST request
   */
  static async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Generic PUT request
   */
  static async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Generic DELETE request
   */
  static async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}
