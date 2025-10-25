import { Registry, Counter, Histogram, Gauge } from 'prom-client';
export declare class PrometheusMetrics {
    private static instance;
    private registry;
    testExecutionsTotal: Counter;
    testDurationSeconds: Histogram;
    testFailuresTotal: Counter;
    healingAttemptsTotal: Counter;
    healingSuccessRate: Gauge;
    healingDurationSeconds: Histogram;
    httpRequestsTotal: Counter;
    httpRequestDurationSeconds: Histogram;
    activeTestRuns: Gauge;
    queuedTests: Gauge;
    private constructor();
    static getInstance(): PrometheusMetrics;
    getRegistry(): Registry;
    getMetrics(): Promise<string>;
    recordTestExecution(status: string, environment: string, browser: string, durationSeconds: number): void;
    recordTestFailure(category: string, testCaseId: string): void;
    recordHealingAttempt(strategy: string, success: boolean, durationSeconds: number): void;
    updateHealingSuccessRate(rate: number): void;
    recordHttpRequest(method: string, route: string, status: number, durationSeconds: number): void;
    setActiveTestRuns(count: number): void;
    setQueuedTests(count: number): void;
    incrementActiveTestRuns(): void;
    decrementActiveTestRuns(): void;
}
declare const _default: PrometheusMetrics;
export default _default;
//# sourceMappingURL=PrometheusMetrics.d.ts.map