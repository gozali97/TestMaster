import { Router } from 'express';
import { ExecutionsController } from './executions.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();
const executionsController = new ExecutionsController();

router.use(requireAuth);

router.post('/executions', (req, res) => executionsController.startExecution(req, res));
router.get('/executions/:runId', (req, res) => executionsController.getExecutionStatus(req, res));
router.get('/projects/:projectId/executions', (req, res) => executionsController.listExecutions(req, res));
router.post('/executions/:runId/stop', (req, res) => executionsController.stopExecution(req, res));

export default router;
