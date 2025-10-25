import { describe, it, expect, beforeAll, afterAll } from '@playwright/test';
import { MetricsCollector } from '../../src/services/MetricsCollector';

describe('MetricsCollector', () => {
  let metricsCollector: MetricsCollector;

  beforeAll(() => {
    metricsCollector = MetricsCollector.getInstance();
  });

  afterAll(async () => {
    await metricsCollector.close();
  });

  it('should be a singleton', () => {
    const instance1 = MetricsCollector.getInstance();
    const instance2 = MetricsCollector.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should log test execution', async () => {
    const execution = {
      testRunId: '123',
      testCaseId: '456',
      testCaseName: 'Sample Test',
      status: 'PASSED' as const,
      duration: 5000,
      environment: 'development',
      browser: 'chromium',
      timestamp: new Date(),
    };

    // Should not throw
    await expect(metricsCollector.logTestExecution(execution)).resolves.not.toThrow();
  });

  it('should log failure event', async () => {
    const failure = {
      testRunId: '123',
      testCaseId: '456',
      errorMessage: 'Element not found',
      timestamp: new Date(),
    };

    // Should not throw
    await expect(metricsCollector.logFailure(failure)).resolves.not.toThrow();
  });

  it('should log healing event', async () => {
    const healing = {
      testResultId: '789',
      objectId: '101',
      failedLocator: '#old-id',
      healedLocator: '#new-id',
      strategy: 'FALLBACK' as const,
      confidence: 0.95,
      autoApplied: true,
      timestamp: new Date(),
    };

    // Should not throw
    await expect(metricsCollector.logHealing(healing)).resolves.not.toThrow();
  });

  it('should record custom metric', async () => {
    const metric = {
      metricName: 'custom_metric',
      metricValue: 42,
      tags: { environment: 'test' },
      timestamp: new Date(),
    };

    // Should not throw
    await expect(metricsCollector.recordMetric(metric)).resolves.not.toThrow();
  });

  it('should return healing statistics', async () => {
    const stats = await metricsCollector.getHealingStatistics(7);
    
    expect(stats).toHaveProperty('totalAttempts');
    expect(stats).toHaveProperty('successRate');
    expect(stats).toHaveProperty('byStrategy');
    expect(typeof stats.totalAttempts).toBe('number');
    expect(typeof stats.successRate).toBe('number');
  });
});
