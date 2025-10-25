"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsCollector = void 0;
const elasticsearch_1 = require("@elastic/elasticsearch");
const logger_1 = require("../utils/logger");
const PrometheusMetrics_1 = __importDefault(require("./PrometheusMetrics"));
const logger = new logger_1.Logger('MetricsCollector');
class MetricsCollector {
    static instance;
    esClient = null;
    prometheusMetrics;
    enabled;
    constructor() {
        this.prometheusMetrics = PrometheusMetrics_1.default;
        this.enabled = process.env.ELASTICSEARCH_URL ? true : false;
        if (this.enabled) {
            this.initializeElasticsearch();
        }
        else {
            logger.warn('Elasticsearch URL not configured. Metrics collection disabled for Elasticsearch.');
        }
    }
    initializeElasticsearch() {
        try {
            this.esClient = new elasticsearch_1.Client({
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
        }
        catch (error) {
            logger.error('Error initializing Elasticsearch client', error);
            this.enabled = false;
        }
    }
    static getInstance() {
        if (!MetricsCollector.instance) {
            MetricsCollector.instance = new MetricsCollector();
        }
        return MetricsCollector.instance;
    }
    /**
     * Log test execution to Elasticsearch and Prometheus
     */
    async logTestExecution(execution) {
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
            this.prometheusMetrics.recordTestExecution(execution.status, execution.environment || 'unknown', execution.browser || 'unknown', durationSeconds);
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
        }
        catch (error) {
            logger.error('Error logging test execution', error);
        }
    }
    /**
     * Log failure event to Elasticsearch
     */
    async logFailure(failure) {
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
                this.prometheusMetrics.recordTestFailure(failure.failureCategory, failure.testCaseId.toString());
            }
            logger.debug(`Logged failure event for test: ${failure.testCaseId}`);
        }
        catch (error) {
            logger.error('Error logging failure event', error);
        }
    }
    /**
     * Log self-healing event to Elasticsearch and Prometheus
     */
    async logHealing(healing) {
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
            this.prometheusMetrics.recordHealingAttempt(healing.strategy, healing.confidence > 0.7, 0 // Duration will be tracked separately
            );
            logger.debug(`Logged healing event: ${healing.strategy} - confidence: ${healing.confidence}`);
        }
        catch (error) {
            logger.error('Error logging healing event', error);
        }
    }
    /**
     * Record custom metric
     */
    async recordMetric(metric) {
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
        }
        catch (error) {
            logger.error('Error recording metric', error);
        }
    }
    /**
     * Query test executions from Elasticsearch
     */
    async queryTestExecutions(query) {
        if (!this.enabled || !this.esClient) {
            logger.warn('Elasticsearch not available for queries');
            return [];
        }
        try {
            const must = [];
            if (query.testCaseId) {
                must.push({ term: { testCaseId: query.testCaseId } });
            }
            if (query.status) {
                must.push({ term: { status: query.status } });
            }
            if (query.startDate || query.endDate) {
                const range = {};
                if (query.startDate)
                    range.gte = query.startDate.toISOString();
                if (query.endDate)
                    range.lte = query.endDate.toISOString();
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
            return response.hits.hits.map((hit) => hit._source);
        }
        catch (error) {
            logger.error('Error querying test executions', error);
            return [];
        }
    }
    /**
     * Get healing statistics
     */
    async getHealingStatistics(days = 30) {
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
            const totalAttempts = response.aggregations?.total_attempts?.value || 0;
            const successfulHeals = response.aggregations?.successful_heals?.doc_count || 0;
            const successRate = totalAttempts > 0 ? successfulHeals / totalAttempts : 0;
            const byStrategy = {};
            const strategyBuckets = response.aggregations?.by_strategy?.buckets || [];
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
        }
        catch (error) {
            logger.error('Error getting healing statistics', error);
            return { totalAttempts: 0, successRate: 0, byStrategy: {} };
        }
    }
    /**
     * Check if MetricsCollector is enabled
     */
    isEnabled() {
        return this.enabled;
    }
    /**
     * Close Elasticsearch connection
     */
    async close() {
        if (this.esClient) {
            await this.esClient.close();
            logger.info('Elasticsearch connection closed');
        }
    }
}
exports.MetricsCollector = MetricsCollector;
exports.default = MetricsCollector.getInstance();
//# sourceMappingURL=MetricsCollector.js.map