import { Client } from '@elastic/elasticsearch';
import { Logger } from '../utils/logger';
import PrometheusMetrics from './PrometheusMetrics';

const logger = new Logger('MetricsCollector');

export interface TestExecutionLog {
  testRunId: string | number;
  testCaseId: string | number;
  testCaseName: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED' | 'RUNNING' | 'ERROR';
  duration: number;
  errorMessage?: string;
  errorStack?: string;
  logs?: any[];  // Changed from string[] to any[] to accept ExecutionLog[]
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

export class MetricsCollector {
  private static instance: MetricsCollector;
  private esClient: Client | null = null;
  private prometheusMetrics: typeof PrometheusMetrics;
  private enabled: boolean;

  private constructor() {
    this.prometheusMetrics = PrometheusMetrics;
    this.enabled = process.env.ELASTICSEARCH_URL ? true : false;

    if (this.enabled) {
      this.initializeElasticsearch();
    } else {
      logger.warn('Elasticsearch URL not configured. Metrics collection disabled for Elasticsearch.');
    }
  }

  private initializeElasticsearch(): void {
    try {
      this.esClient = new Client({
        node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      });

      // Test connection
      this.esClient.ping()
        .then(() => {
          logger.info('Connected to Elasticsearch successfully');
        })
        .catch((error) => {
          logger.error('Failed to connect to Elasticsearch', error);
          this.esClient = null;
          this.enabled = false;
        });
    } catch (error) {
      logger.error('Error initializing Elasticsearch client', error);
      this.enabled = false;
    }
  }

  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  /**
   * Log test execution to Elasticsearch and Prometheus
   */
  public async logTestExecution(execution: TestExecutionLog): Promise<void> {
    try {
      // Log to Elasticsearch
      if (this.enabled && this.esClient) {
        await this.esClient.index({
          index: process.env.ELASTICSEARCH_INDEX_EXECUTIONS || 'testmaster-executions',
          document: {
            ...execution,
            '@timestamp': execution.timestamp.toISOString(),
          },
        });
      }

      // Record Prometheus metrics
      const durationSeconds = execution.duration / 1000;
      this.prometheusMetrics.recordTestExecution(
        execution.status,
        execution.environment || 'unknown',
        execution.browser || 'unknown',
        durationSeconds
      );

      // Log failure if status is FAILED
      if (execution.status === 'FAILED' && execution.errorMessage) {
        await this.logFailure({
          testRunId: execution.testRunId,
          testCaseId: execution.testCaseId,
          errorMessage: execution.errorMessage,
          stackTrace: execution.errorStack,
          screenshot: execution.screenshots?.[execution.screenshots.length - 1],
          timestamp: execution.timestamp,
        });
      }

      logger.debug(`Logged test execution: ${execution.testCaseName} - ${execution.status}`);
    } catch (error) {
      logger.error('Error logging test execution', error);
    }
  }

  /**
   * Log failure event to Elasticsearch
   */
  public async logFailure(failure: FailureEvent): Promise<void> {
    try {
      if (this.enabled && this.esClient) {
        await this.esClient.index({
          index: process.env.ELASTICSEARCH_INDEX_FAILURES || 'testmaster-failures',
          document: {
            ...failure,
            '@timestamp': failure.timestamp.toISOString(),
          },
        });
      }

      // Record Prometheus metric
      if (failure.failureCategory) {
        this.prometheusMetrics.recordTestFailure(
          failure.failureCategory,
          failure.testCaseId.toString()
        );
      }

      logger.debug(`Logged failure event for test: ${failure.testCaseId}`);
    } catch (error) {
      logger.error('Error logging failure event', error);
    }
  }

  /**
   * Log self-healing event to Elasticsearch and Prometheus
   */
  public async logHealing(healing: HealingEvent): Promise<void> {
    try {
      if (this.enabled && this.esClient) {
        await this.esClient.index({
          index: process.env.ELASTICSEARCH_INDEX_HEALING || 'testmaster-healing',
          document: {
            ...healing,
            '@timestamp': healing.timestamp.toISOString(),
          },
        });
      }

      // Record Prometheus metric
      this.prometheusMetrics.recordHealingAttempt(
        healing.strategy,
        healing.confidence > 0.7,
        0 // Duration will be tracked separately
      );

      logger.debug(`Logged healing event: ${healing.strategy} - confidence: ${healing.confidence}`);
    } catch (error) {
      logger.error('Error logging healing event', error);
    }
  }

  /**
   * Record custom metric
   */
  public async recordMetric(metric: CustomMetric): Promise<void> {
    try {
      if (this.enabled && this.esClient) {
        await this.esClient.index({
          index: process.env.ELASTICSEARCH_INDEX_METRICS || 'testmaster-metrics',
          document: {
            ...metric,
            '@timestamp': metric.timestamp.toISOString(),
          },
        });
      }

      logger.debug(`Recorded metric: ${metric.metricName} = ${metric.metricValue}`);
    } catch (error) {
      logger.error('Error recording metric', error);
    }
  }

  /**
   * Query test executions from Elasticsearch
   */
  public async queryTestExecutions(query: {
    testCaseId?: string | number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<TestExecutionLog[]> {
    if (!this.enabled || !this.esClient) {
      logger.warn('Elasticsearch not available for queries');
      return [];
    }

    try {
      const must: any[] = [];

      if (query.testCaseId) {
        must.push({ term: { testCaseId: query.testCaseId } });
      }

      if (query.status) {
        must.push({ term: { status: query.status } });
      }

      if (query.startDate || query.endDate) {
        const range: any = {};
        if (query.startDate) range.gte = query.startDate.toISOString();
        if (query.endDate) range.lte = query.endDate.toISOString();
        must.push({ range: { timestamp: range } });
      }

      // @ts-ignore - Elasticsearch query types are complex
      const response = await this.esClient.search({
        index: process.env.ELASTICSEARCH_INDEX_EXECUTIONS || 'testmaster-executions',
        body: {
          query: must.length > 0 ? { bool: { must } } : { match_all: {} },
          size: query.limit || 100,
          sort: [{ timestamp: { order: 'desc' } }],
        },
      });

      return response.hits.hits.map((hit: any) => hit._source as TestExecutionLog);
    } catch (error) {
      logger.error('Error querying test executions', error);
      return [];
    }
  }

  /**
   * Get healing statistics
   */
  public async getHealingStatistics(days: number = 30): Promise<{
    totalAttempts: number;
    successRate: number;
    byStrategy: Record<string, { attempts: number; success: number }>;
  }> {
    if (!this.enabled || !this.esClient) {
      logger.warn('Elasticsearch not available for statistics');
      return { totalAttempts: 0, successRate: 0, byStrategy: {} };
    }

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // @ts-ignore - Elasticsearch aggregation types are complex
      const response = await this.esClient.search({
        index: process.env.ELASTICSEARCH_INDEX_HEALING || 'testmaster-healing',
        body: {
          query: {
            range: {
              timestamp: {
                gte: startDate.toISOString(),
              },
            },
          },
          size: 0,
          aggs: {
            total_attempts: {
              value_count: {
                field: 'strategy.keyword',
              },
            },
            successful_heals: {
              filter: {
                range: {
                  confidence: {
                    gte: 0.7,
                  },
                },
              },
            },
            by_strategy: {
              terms: {
                field: 'strategy.keyword',
              },
              aggs: {
                successful: {
                  filter: {
                    range: {
                      confidence: {
                        gte: 0.7,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const totalAttempts = (response.aggregations?.total_attempts as any)?.value || 0;
      const successfulHeals = (response.aggregations?.successful_heals as any)?.doc_count || 0;
      const successRate = totalAttempts > 0 ? successfulHeals / totalAttempts : 0;

      const byStrategy: Record<string, { attempts: number; success: number }> = {};
      const strategyBuckets = (response.aggregations?.by_strategy as any)?.buckets || [];

      for (const bucket of strategyBuckets) {
        byStrategy[bucket.key] = {
          attempts: bucket.doc_count,
          success: bucket.successful.doc_count,
        };
      }

      // Update Prometheus gauge
      this.prometheusMetrics.updateHealingSuccessRate(successRate);

      return {
        totalAttempts,
        successRate,
        byStrategy,
      };
    } catch (error) {
      logger.error('Error getting healing statistics', error);
      return { totalAttempts: 0, successRate: 0, byStrategy: {} };
    }
  }

  /**
   * Check if MetricsCollector is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Close Elasticsearch connection
   */
  public async close(): Promise<void> {
    if (this.esClient) {
      await this.esClient.close();
      logger.info('Elasticsearch connection closed');
    }
  }
}

export default MetricsCollector.getInstance();
