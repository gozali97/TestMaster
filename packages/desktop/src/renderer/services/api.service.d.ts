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
export declare class ApiService {
    /**
     * Get authorization headers with token
     */
    private static getAuthHeaders;
    /**
     * Handle API response
     */
    private static handleResponse;
    /**
     * Generic API request
     */
    private static request;
    /**
     * Get all projects
     */
    static getProjects(): Promise<ApiResponse<Project[]>>;
    /**
     * Get project by ID
     */
    static getProject(id: number): Promise<ApiResponse<Project>>;
    /**
     * Create new project
     */
    static createProject(data: {
        name: string;
        description?: string;
    }): Promise<ApiResponse<Project>>;
    /**
     * Update project
     */
    static updateProject(id: number, data: Partial<Project>): Promise<ApiResponse<Project>>;
    /**
     * Delete project
     */
    static deleteProject(id: number): Promise<ApiResponse<void>>;
    /**
     * Get all test cases for a project
     */
    static getTestCases(projectId: number): Promise<ApiResponse<TestCase[]>>;
    /**
     * Get test case by ID
     */
    static getTestCase(projectId: number, testId: number): Promise<ApiResponse<TestCase>>;
    /**
     * Create new test case
     */
    static createTestCase(projectId: number, data: {
        name: string;
        description?: string;
        steps: TestStep[];
        variables?: any[];
    }): Promise<ApiResponse<TestCase>>;
    /**
     * Update test case
     */
    static updateTestCase(projectId: number, testId: number, data: Partial<TestCase>): Promise<ApiResponse<TestCase>>;
    /**
     * Delete test case
     */
    static deleteTestCase(projectId: number, testId: number): Promise<ApiResponse<void>>;
    /**
     * Login
     */
    static login(email: string, password: string): Promise<ApiResponse<any>>;
    /**
     * Register
     */
    static register(data: {
        name: string;
        email: string;
        password: string;
    }): Promise<ApiResponse<any>>;
    /**
     * Refresh token
     */
    static refreshToken(): Promise<ApiResponse<any>>;
    /**
     * Store auth tokens
     */
    static storeTokens(accessToken: string, refreshToken: string): void;
    /**
     * Clear auth tokens
     */
    static clearTokens(): void;
    /**
     * Check if authenticated
     */
    static isAuthenticated(): boolean;
    /**
     * Execute test case(s)
     */
    static executeTest(projectId: number, testCaseIds: number | number[], config?: any): Promise<ApiResponse<any>>;
    /**
     * Get test execution results
     */
    static getExecutionResults(executionId: number): Promise<ApiResponse<any>>;
    /**
     * Generic GET request
     */
    static get<T = any>(endpoint: string): Promise<ApiResponse<T>>;
    /**
     * Generic POST request
     */
    static post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>>;
    /**
     * Generic PUT request
     */
    static put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>>;
    /**
     * Generic DELETE request
     */
    static delete<T = any>(endpoint: string): Promise<ApiResponse<T>>;
}
//# sourceMappingURL=api.service.d.ts.map