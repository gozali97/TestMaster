/**
 * API Test Helpers
 * Similar to Katalon's Custom Keywords for reusable test logic
 */

import { APIRequestContext } from '@playwright/test';

export class APIHelpers {
  constructor(private request: APIRequestContext) {}

  /**
   * Perform login and get authentication token
   */
  async login(email: string, password: string): Promise<string> {
    const response = await this.request.post('/api/auth/login', {
      data: {
        email,
        password,
      },
    });

    if (!response.ok()) {
      throw new Error(`Login failed: ${response.status()}`);
    }

    const body = await response.json();
    return body.data.token;
  }

  /**
   * Register a new user
   */
  async register(userData: {
    email: string;
    password: string;
    name: string;
    organizationName: string;
  }) {
    const response = await this.request.post('/api/auth/register', {
      data: userData,
    });

    if (!response.ok()) {
      const error = await response.text();
      throw new Error(`Registration failed: ${error}`);
    }

    return response.json();
  }

  /**
   * Create a new project
   */
  async createProject(token: string, projectData: {
    name: string;
    description?: string;
  }) {
    const response = await this.request.post('/api/projects', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      data: projectData,
    });

    if (!response.ok()) {
      throw new Error(`Create project failed: ${response.status()}`);
    }

    return response.json();
  }

  /**
   * Create a test case
   */
  async createTestCase(token: string, projectId: number, testCaseData: {
    name: string;
    description?: string;
    type: string;
    steps: any[];
  }) {
    const response = await this.request.post(`/api/projects/${projectId}/tests`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      data: testCaseData,
    });

    if (!response.ok()) {
      throw new Error(`Create test case failed: ${response.status()}`);
    }

    return response.json();
  }

  /**
   * Execute a test suite
   */
  async executeTestSuite(token: string, suiteId: number, config?: any) {
    const response = await this.request.post(`/api/suites/${suiteId}/execute`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      data: config || {},
    });

    if (!response.ok()) {
      throw new Error(`Execute test suite failed: ${response.status()}`);
    }

    return response.json();
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(token: string, executionId: number) {
    const response = await this.request.get(`/api/executions/${executionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok()) {
      throw new Error(`Get execution status failed: ${response.status()}`);
    }

    return response.json();
  }
}
