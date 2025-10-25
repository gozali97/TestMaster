import { Router } from 'express';
import { ObjectsController } from './objects.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();
const objectsController = new ObjectsController();

router.use(requireAuth);

router.post('/:projectId/objects', (req, res) => objectsController.create(req, res));
router.get('/:projectId/objects', (req, res) => objectsController.list(req, res));
router.get('/:projectId/objects/:objectId', (req, res) => objectsController.getById(req, res));
router.put('/:projectId/objects/:objectId', (req, res) => objectsController.update(req, res));
router.delete('/:projectId/objects/:objectId', (req, res) => objectsController.delete(req, res));

export default router;
