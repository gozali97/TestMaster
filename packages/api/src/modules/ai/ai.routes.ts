import { Router } from 'express';
import { AIController } from './ai.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();
const aiController = new AIController();

router.use(requireAuth);

router.post('/generate-test', (req, res) => aiController.generateTest(req, res));
router.post('/heal-locator', (req, res) => aiController.suggestHealedLocator(req, res));
router.post('/tests/:testId/optimize', (req, res) => aiController.optimizeTest(req, res));
router.post('/identify-element', (req, res) => aiController.identifyElementFromScreenshot(req, res));
router.get('/tests/:testCaseId/suggestions', (req, res) => aiController.getAISuggestions(req, res));
router.post('/suggestions/:suggestionId/apply', (req, res) => aiController.applyAISuggestion(req, res));

export default router;
