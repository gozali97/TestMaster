import { Router } from 'express';
import { AutonomousTestingController } from './autonomous-testing.controller';
// import { AutonomousTestingSimpleController } from './autonomous-testing-simple.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();
const controller = new AutonomousTestingController();
// const controller = new AutonomousTestingSimpleController();

console.log('🔧 [ROUTES] Autonomous Testing routes loaded (REAL Playwright Testing - Auth Required)');

// Apply authentication to all autonomous testing routes
router.use(requireAuth);

// Autonomous testing routes - AUTHENTICATION REQUIRED
// Start autonomous testing
router.post('/start', (req, res) => controller.startTesting(req, res));

// Get progress updates (SSE)
router.get('/progress/:sessionId', (req, res) => controller.getProgress(req, res));

// Get final results
router.get('/results/:sessionId', (req, res) => controller.getResults(req, res));

// List all sessions
router.get('/sessions', (req, res) => controller.listSessions(req, res));

export default router;
