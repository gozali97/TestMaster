import { Router } from 'express';
import { TestsController } from './tests.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();
const testsController = new TestsController();

router.use(requireAuth);

router.post('/:projectId/tests', (req, res) => testsController.create(req, res));
router.get('/:projectId/tests', (req, res) => testsController.list(req, res));
router.get('/:projectId/tests/:testId', (req, res) => testsController.getById(req, res));
router.put('/:projectId/tests/:testId', (req, res) => testsController.update(req, res));
router.delete('/:projectId/tests/:testId', (req, res) => testsController.delete(req, res));
router.post('/:projectId/tests/:testId/duplicate', (req, res) => testsController.duplicate(req, res));

export default router;
