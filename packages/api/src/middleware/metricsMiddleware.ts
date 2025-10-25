import { Request, Response, NextFunction } from 'express';
import PrometheusMetrics from '../services/PrometheusMetrics';

const prometheusMetrics = PrometheusMetrics;

/**
 * Middleware to collect HTTP request metrics
 */
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Capture response finish event
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Convert to seconds
    const route = req.route?.path || req.path || 'unknown';
    const method = req.method;
    const status = res.statusCode;

    // Record metrics
    prometheusMetrics.recordHttpRequest(method, route, status, duration);
  });

  next();
};
