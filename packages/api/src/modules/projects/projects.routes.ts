import { Router } from 'express';
import { ProjectsController } from './projects.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();
const projectsController = new ProjectsController();

router.use(requireAuth);

router.post('/', (req, res) => projectsController.create(req, res));
router.get('/', (req, res) => projectsController.list(req, res));
router.get('/:id', (req, res) => projectsController.getById(req, res));
router.put('/:id', (req, res) => projectsController.update(req, res));
router.delete('/:id', (req, res) => projectsController.delete(req, res));

export default router;
