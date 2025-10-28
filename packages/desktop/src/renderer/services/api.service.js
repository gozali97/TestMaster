"use strict";
// API Service - Centralized API communication for Desktop app
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = void 0;
const api_config_1 = require("../config/api.config");
const API_URL = (0, api_config_1.getBaseUrl)();
class ApiService {
    /**
     * Get authorization headers with token
     */
    static getAuthHeaders() {
        const token = localStorage.getItem('accessToken');
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    }
    /**
     * Handle API response
     */
    static async handleResponse(response) {
        try {
            const data = await response.json();
            return data;
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to parse response',
            };
        }
    }
    /**
     * Generic API request
     */
    static async request(endpoint, options = {}) {
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
            return await this.handleResponse(response);
        }
        catch (error) {
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
    static async getProjects() {
        return this.request('/api/projects');
    }
    /**
     * Get project by ID
     */
    static async getProject(id) {
        return this.request(`/api/projects/${id}`);
    }
    /**
     * Create new project
     */
    static async createProject(data) {
        return this.request('/api/projects', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    /**
     * Update project
     */
    static async updateProject(id, data) {
        return this.request(`/api/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
    /**
     * Delete project
     */
    static async deleteProject(id) {
        return this.request(`/api/projects/${id}`, {
            method: 'DELETE',
        });
    }
    // ============================================
    // TEST CASES
    // ============================================
    /**
     * Get all test cases for a project
     */
    static async getTestCases(projectId) {
        return this.request(`/api/projects/${projectId}/tests`);
    }
    /**
     * Get test case by ID
     */
    static async getTestCase(projectId, testId) {
        return this.request(`/api/projects/${projectId}/tests/${testId}`);
    }
    /**
     * Create new test case
     */
    static async createTestCase(projectId, data) {
        return this.request(`/api/projects/${projectId}/tests`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    /**
     * Update test case
     */
    static async updateTestCase(projectId, testId, data) {
        return this.request(`/api/projects/${projectId}/tests/${testId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
    /**
     * Delete test case
     */
    static async deleteTestCase(projectId, testId) {
        return this.request(`/api/projects/${projectId}/tests/${testId}`, {
            method: 'DELETE',
        });
    }
    // ============================================
    // AUTHENTICATION
    // ============================================
    /**
     * Login
     */
    static async login(email, password) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }
    /**
     * Register
     */
    static async register(data) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    /**
     * Refresh token
     */
    static async refreshToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        return this.request('/api/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });
    }
    /**
     * Store auth tokens
     */
    static storeTokens(accessToken, refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }
    /**
     * Clear auth tokens
     */
    static clearTokens() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
    /**
     * Check if authenticated
     */
    static isAuthenticated() {
        return !!localStorage.getItem('accessToken');
    }
    // ============================================
    // TEST EXECUTION
    // ============================================
    /**
     * Execute test case(s)
     */
    static async executeTest(projectId, testCaseIds, config) {
        const ids = Array.isArray(testCaseIds) ? testCaseIds : [testCaseIds];
        return this.request(`/api/executions`, {
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
    static async getExecutionResults(executionId) {
        return this.request(`/api/executions/${executionId}`);
    }
    // ============================================
    // GENERIC HTTP METHODS
    // ============================================
    /**
     * Generic GET request
     */
    static async get(endpoint) {
        return this.request(endpoint, {
            method: 'GET',
        });
    }
    /**
     * Generic POST request
     */
    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }
    /**
     * Generic PUT request
     */
    static async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }
    /**
     * Generic DELETE request
     */
    static async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }
}
exports.ApiService = ApiService;
//# sourceMappingURL=api.service.js.map