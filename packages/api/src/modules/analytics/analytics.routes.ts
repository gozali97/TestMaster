import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

router.use(requireAuth);

router.get('/dashboard/metrics', (req, res) => analyticsController.getDashboardMetrics(req, res));
router.get('/analytics/trends', (req, res) => analyticsController.getExecutionTrends(req, res));
router.get('/projects/:projectId/stats', (req, res) => analyticsController.getTestCaseStats(req, res));
router.get('/projects/:projectId/flaky-tests', (req, res) => analyticsController.getFlakyTests(req, res));
router.get('/executions/:runId/timeline', (req, res) => analyticsController.getExecutionTimeline(req, res));

export default router;
