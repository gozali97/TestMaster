import { Router } from 'express';
import { MultiPanelController } from './multi-panel.controller';

const router = Router();
const controller = new MultiPanelController();

/**
 * Multi-Panel Autonomous Testing Routes
 */

// Start multi-panel testing
router.post('/start', async (req, res) => {
  await controller.startMultiPanelTesting(req, res);
});

// Get progress updates (SSE)
router.get('/progress/:sessionId', async (req, res) => {
  await controller.getProgress(req, res);
});

// Get final results
router.get('/results/:sessionId', async (req, res) => {
  await controller.getResults(req, res);
});

export default router;
