import { Request, Response } from 'express';
import PrometheusMetrics from '../../services/PrometheusMetrics';
import { Logger } from '../../utils/logger';

const logger = new Logger('MetricsController');
const prometheusMetrics = PrometheusMetrics;

export class MetricsController {
  /**
   * GET /metrics
   * Expose Prometheus metrics
   */
  public async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await prometheusMetrics.getMetrics();
      
      res.set('Content-Type', prometheusMetrics.getRegistry().contentType);
      res.send(metrics);
    } catch (error) {
      logger.error('Error getting metrics', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get metrics',
      });
    }
  }

  /**
   * GET /metrics/health
   * Health check endpoint for metrics service
   */
  public async getHealth(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        service: 'TestMaster Metrics',
        status: 'healthy',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error in health check', error);
      res.status(500).json({
        success: false,
        message: 'Health check failed',
      });
    }
  }
}

export default new MetricsController();
