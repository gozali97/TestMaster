"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrometheusMetrics = void 0;
const prom_client_1 = require("prom-client");
const logger_1 = require("../utils/logger");
const logger = new logger_1.Logger('PrometheusMetrics');
class PrometheusMetrics {
    static instance;
    registry;
    // Test Execution Metrics
    testExecutionsTotal;
    testDurationSeconds;
    testFailuresTotal;
    // Self-Healing Metrics
    healingAttemptsTotal;
    healingSuccessRate;
    healingDurationSeconds;
    // API Metrics
    httpRequestsTotal;
    httpRequestDurationSeconds;
    // System Metrics
    activeTestRuns;
    queuedTests;
    constructor() {
        this.registry = new prom_client_1.Registry();
        // Collect default metrics (CPU, memory, etc.)
        (0, prom_client_1.collectDefaultMetrics)({
            register: this.registry,
            prefix: 'testmaster_',
        });
        // Initialize Test Execution Metrics
        this.testExecutionsTotal = new prom_client_1.Counter({
            name: 'test_executions_total',
            help: 'Total number of test executions',
            labelNames: ['status', 'environment', 'browser'],
            registers: [this.registry],
        });
        this.testDurationSeconds = new prom_client_1.Histogram({
            name: 'test_duration_seconds',
            help: 'Test execution duration in seconds',
            labelNames: ['testCaseId', 'status'],
            buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120, 300],
            registers: [this.registry],
        });
        this.testFailuresTotal = new prom_client_1.Counter({
            name: 'test_failures_total',
            help: 'Total number of test failures',
            labelNames: ['category', 'testCaseId'],
            registers: [this.registry],
        });
        // Initialize Self-Healing Metrics
        this.healingAttemptsTotal = new prom_client_1.Counter({
            name: 'healing_attempts_total',
            help: 'Total number of self-healing attempts',
            labelNames: ['strategy', 'success'],
            registers: [this.registry],
        });
        this.healingSuccessRate = new prom_client_1.Gauge({
            name: 'healing_success_rate',
            help: 'Self-healing success rate (0-1)',
            registers: [this.registry],
        });
        this.healingDurationSeconds = new prom_client_1.Histogram({
            name: 'healing_duration_seconds',
            help: 'Self-healing duration in seconds',
            labelNames: ['strategy'],
            buckets: [0.1, 0.5, 1, 2, 5, 10],
            registers: [this.registry],
        });
        // Initialize API Metrics
        this.httpRequestsTotal = new prom_client_1.Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status'],
            registers: [this.registry],
        });
        this.httpRequestDurationSeconds = new prom_client_1.Histogram({
            name: 'http_request_duration_seconds',
            help: 'HTTP request duration in seconds',
            labelNames: ['method', 'route', 'status'],
            buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
            registers: [this.registry],
        });
        // Initialize System Metrics
        this.activeTestRuns = new prom_client_1.Gauge({
            name: 'active_test_runs',
            help: 'Number of currently active test runs',
            registers: [this.registry],
        });
        this.queuedTests = new prom_client_1.Gauge({
            name: 'queued_tests',
            help: 'Number of tests in queue',
            registers: [this.registry],
        });
        logger.info('Prometheus metrics initialized');
    }
    static getInstance() {
        if (!PrometheusMetrics.instance) {
            PrometheusMetrics.instance = new PrometheusMetrics();
        }
        return PrometheusMetrics.instance;
    }
    getRegistry() {
        return this.registry;
    }
    async getMetrics() {
        return this.registry.metrics();
    }
    // Helper methods for recording metrics
    recordTestExecution(status, environment, browser, durationSeconds) {
        this.testExecutionsTotal.inc({ status, environment, browser });
        this.testDurationSeconds.observe({ status }, durationSeconds);
    }
    recordTestFailure(category, testCaseId) {
        this.testFailuresTotal.inc({ category, testCaseId });
    }
    recordHealingAttempt(strategy, success, durationSeconds) {
        this.healingAttemptsTotal.inc({ strategy, success: success.toString() });
        this.healingDurationSeconds.observe({ strategy }, durationSeconds);
    }
    updateHealingSuccessRate(rate) {
        this.healingSuccessRate.set(rate);
    }
    recordHttpRequest(method, route, status, durationSeconds) {
        this.httpRequestsTotal.inc({ method, route, status: status.toString() });
        this.httpRequestDurationSeconds.observe({ method, route, status: status.toString() }, durationSeconds);
    }
    setActiveTestRuns(count) {
        this.activeTestRuns.set(count);
    }
    setQueuedTests(count) {
        this.queuedTests.set(count);
    }
    incrementActiveTestRuns() {
        this.activeTestRuns.inc();
    }
    decrementActiveTestRuns() {
        this.activeTestRuns.dec();
    }
}
exports.PrometheusMetrics = PrometheusMetrics;
exports.default = PrometheusMetrics.getInstance();
//# sourceMappingURL=PrometheusMetrics.js.map