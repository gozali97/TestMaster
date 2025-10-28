"use strict";
// API Configuration for Desktop App
// This file centralizes API configuration to avoid process.env issues in Electron renderer
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_CONFIG = void 0;
exports.getApiUrl = getApiUrl;
exports.isProduction = isProduction;
exports.getBaseUrl = getBaseUrl;
exports.API_CONFIG = {
    // API Base URL - Change this if your API runs on a different port or host
    BASE_URL: 'http://localhost:3001',
    // API Endpoints
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/api/auth/login',
            REGISTER: '/api/auth/register',
            REFRESH: '/api/auth/refresh',
        },
        PROJECTS: {
            LIST: '/api/projects',
            DETAIL: (id) => `/api/projects/${id}`,
            CREATE: '/api/projects',
            UPDATE: (id) => `/api/projects/${id}`,
            DELETE: (id) => `/api/projects/${id}`,
        },
        TESTS: {
            LIST: (projectId) => `/api/projects/${projectId}/tests`,
            DETAIL: (projectId, testId) => `/api/projects/${projectId}/tests/${testId}`,
            CREATE: (projectId) => `/api/projects/${projectId}/tests`,
            UPDATE: (projectId, testId) => `/api/projects/${projectId}/tests/${testId}`,
            DELETE: (projectId, testId) => `/api/projects/${projectId}/tests/${testId}`,
        },
        EXECUTIONS: {
            LIST: '/api/executions',
            DETAIL: (id) => `/api/executions/${id}`,
            RUN: '/api/executions/run',
        },
    },
    // Request Configuration
    TIMEOUT: 30000, // 30 seconds
    // Token Configuration
    TOKEN_STORAGE_KEYS: {
        ACCESS_TOKEN: 'accessToken',
        REFRESH_TOKEN: 'refreshToken',
    },
};
// Helper function to get full URL
function getApiUrl(endpoint) {
    return `${exports.API_CONFIG.BASE_URL}${endpoint}`;
}
// For production, you can change BASE_URL based on environment
// Example: Check if running in development or production
function isProduction() {
    // In Electron, you can check via other means
    return false; // For now, always development
}
// Get API URL based on environment
function getBaseUrl() {
    if (isProduction()) {
        // Production API URL
        return 'https://api.testmaster.com'; // Change this to your production URL
    }
    // Development API URL
    return 'http://localhost:3001';
}
//# sourceMappingURL=api.config.js.map