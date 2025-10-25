export interface TestExecutionLog {
    testRunId: string | number;
    testCaseId: string | number;
    testCaseName: string;
    status: 'PASSED' | 'FAILED' | 'SKIPPED' | 'RUNNING' | 'ERROR';
    duration: number;
    errorMessage?: string;
    errorStack?: string;
    logs?: any[];
    screenshots?: string[];
    environment?: string;
    browser?: string;
    timestamp: Date;
}
export interface FailureEvent {
    testRunId: string | number;
    testCaseId: string | number;
    failureCategory?: string;
    errorMessage: string;
    stackTrace?: string;
    screenshot?: string;
    context?: Record<string, any>;
    embedding?: number[];
    timestamp: Date;
}
export interface HealingEvent {
    testResultId: string | number;
    objectId: string | number;
    failedLocator: string;
    healedLocator: string;
    strategy: 'FALLBACK' | 'SIMILARITY' | 'VISUAL' | 'HISTORICAL';
    confidence: number;
    autoApplied: boolean;
    timestamp: Date;
}
export interface CustomMetric {
    metricName: string;
    metricValue: number;
    tags?: Record<string, any>;
    timestamp: Date;
}
export declare class MetricsCollector {
    private static instance;
    private esClient;
    private prometheusMetrics;
    private enabled;
    private constructor();
    private initializeElasticsearch;
    static getInstance(): MetricsCollector;
    /**
     * Log test execution to Elasticsearch and Prometheus
     */
    logTestExecution(execution: TestExecutionLog): Promise<void>;
    /**
     * Log failure event to Elasticsearch
     */
    logFailure(failure: FailureEvent): Promise<void>;
    /**
     * Log self-healing event to Elasticsearch and Prometheus
     */
    logHealing(healing: HealingEvent): Promise<void>;
    /**
     * Record custom metric
     */
    recordMetric(metric: CustomMetric): Promise<void>;
    /**
     * Query test executions from Elasticsearch
     */
    queryTestExecutions(query: {
        testCaseId?: string | number;
        status?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }): Promise<TestExecutionLog[]>;
    /**
     * Get healing statistics
     */
    getHealingStatistics(days?: number): Promise<{
        totalAttempts: number;
        successRate: number;
        byStrategy: Record<string, {
            attempts: number;
            success: number;
        }>;
    }>;
    /**
     * Check if MetricsCollector is enabled
     */
    isEnabled(): boolean;
    /**
     * Close Elasticsearch connection
     */
    close(): Promise<void>;
}
declare const _default: MetricsCollector;
export default _default;
//# sourceMappingURL=MetricsCollector.d.ts.map