import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';
import { Logger } from '../utils/logger';

const logger = new Logger('PrometheusMetrics');

export class PrometheusMetrics {
  private static instance: PrometheusMetrics;
  private registry: Registry;

  // Test Execution Metrics
  public testExecutionsTotal: Counter;
  public testDurationSeconds: Histogram;
  public testFailuresTotal: Counter;

  // Self-Healing Metrics
  public healingAttemptsTotal: Counter;
  public healingSuccessRate: Gauge;
  public healingDurationSeconds: Histogram;

  // API Metrics
  public httpRequestsTotal: Counter;
  public httpRequestDurationSeconds: Histogram;

  // System Metrics
  public activeTestRuns: Gauge;
  public queuedTests: Gauge;

  private constructor() {
    this.registry = new Registry();

    // Collect default metrics (CPU, memory, etc.)
    collectDefaultMetrics({
      register: this.registry,
      prefix: 'testmaster_',
    });

    // Initialize Test Execution Metrics
    this.testExecutionsTotal = new Counter({
      name: 'test_executions_total',
      help: 'Total number of test executions',
      labelNames: ['status', 'environment', 'browser'],
      registers: [this.registry],
    });

    this.testDurationSeconds = new Histogram({
      name: 'test_duration_seconds',
      help: 'Test execution duration in seconds',
      labelNames: ['testCaseId', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120, 300],
      registers: [this.registry],
    });

    this.testFailuresTotal = new Counter({
      name: 'test_failures_total',
      help: 'Total number of test failures',
      labelNames: ['category', 'testCaseId'],
      registers: [this.registry],
    });

    // Initialize Self-Healing Metrics
    this.healingAttemptsTotal = new Counter({
      name: 'healing_attempts_total',
      help: 'Total number of self-healing attempts',
      labelNames: ['strategy', 'success'],
      registers: [this.registry],
    });

    this.healingSuccessRate = new Gauge({
      name: 'healing_success_rate',
      help: 'Self-healing success rate (0-1)',
      registers: [this.registry],
    });

    this.healingDurationSeconds = new Histogram({
      name: 'healing_duration_seconds',
      help: 'Self-healing duration in seconds',
      labelNames: ['strategy'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    // Initialize API Metrics
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });

    this.httpRequestDurationSeconds = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
      registers: [this.registry],
    });

    // Initialize System Metrics
    this.activeTestRuns = new Gauge({
      name: 'active_test_runs',
      help: 'Number of currently active test runs',
      registers: [this.registry],
    });

    this.queuedTests = new Gauge({
      name: 'queued_tests',
      help: 'Number of tests in queue',
      registers: [this.registry],
    });

    logger.info('Prometheus metrics initialized');
  }

  public static getInstance(): PrometheusMetrics {
    if (!PrometheusMetrics.instance) {
      PrometheusMetrics.instance = new PrometheusMetrics();
    }
    return PrometheusMetrics.instance;
  }

  public getRegistry(): Registry {
    return this.registry;
  }

  public async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  // Helper methods for recording metrics
  public recordTestExecution(status: string, environment: string, browser: string, durationSeconds: number): void {
    this.testExecutionsTotal.inc({ status, environment, browser });
    this.testDurationSeconds.observe({ status }, durationSeconds);
  }

  public recordTestFailure(category: string, testCaseId: string): void {
    this.testFailuresTotal.inc({ category, testCaseId });
  }

  public recordHealingAttempt(strategy: string, success: boolean, durationSeconds: number): void {
    this.healingAttemptsTotal.inc({ strategy, success: success.toString() });
    this.healingDurationSeconds.observe({ strategy }, durationSeconds);
  }

  public updateHealingSuccessRate(rate: number): void {
    this.healingSuccessRate.set(rate);
  }

  public recordHttpRequest(method: string, route: string, status: number, durationSeconds: number): void {
    this.httpRequestsTotal.inc({ method, route, status: status.toString() });
    this.httpRequestDurationSeconds.observe({ method, route, status: status.toString() }, durationSeconds);
  }

  public setActiveTestRuns(count: number): void {
    this.activeTestRuns.set(count);
  }

  public setQueuedTests(count: number): void {
    this.queuedTests.set(count);
  }

  public incrementActiveTestRuns(): void {
    this.activeTestRuns.inc();
  }

  public decrementActiveTestRuns(): void {
    this.activeTestRuns.dec();
  }
}

export default PrometheusMetrics.getInstance();
