export declare const API_CONFIG: {
    BASE_URL: string;
    ENDPOINTS: {
        AUTH: {
            LOGIN: string;
            REGISTER: string;
            REFRESH: string;
        };
        PROJECTS: {
            LIST: string;
            DETAIL: (id: number) => string;
            CREATE: string;
            UPDATE: (id: number) => string;
            DELETE: (id: number) => string;
        };
        TESTS: {
            LIST: (projectId: number) => string;
            DETAIL: (projectId: number, testId: number) => string;
            CREATE: (projectId: number) => string;
            UPDATE: (projectId: number, testId: number) => string;
            DELETE: (projectId: number, testId: number) => string;
        };
        EXECUTIONS: {
            LIST: string;
            DETAIL: (id: number) => string;
            RUN: string;
        };
    };
    TIMEOUT: number;
    TOKEN_STORAGE_KEYS: {
        ACCESS_TOKEN: string;
        REFRESH_TOKEN: string;
    };
};
export declare function getApiUrl(endpoint: string): string;
export declare function isProduction(): boolean;
export declare function getBaseUrl(): string;
//# sourceMappingURL=api.config.d.ts.map