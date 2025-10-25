import { Router } from 'express';
import metricsController from './metrics.controller';

const router = Router();

/**
 * @route   GET /metrics
 * @desc    Get Prometheus metrics
 * @access  Public (should be restricted in production)
 */
router.get('/', metricsController.getMetrics.bind(metricsController));

/**
 * @route   GET /metrics/health
 * @desc    Health check for metrics service
 * @access  Public
 */
router.get('/health', metricsController.getHealth.bind(metricsController));

export default router;
