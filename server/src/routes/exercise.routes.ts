import { Router } from 'express';
import { ExerciseController } from '../controllers/exercise.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const ctrl = new ExerciseController();

router.get('/', authenticate, (req, res) => ctrl.getAll(req, res));
router.post('/', authenticate, (req, res) => ctrl.createCustom(req, res));
router.delete('/:id', authenticate, (req, res) => ctrl.deleteCustom(req, res));
router.put('/:id', authenticate, (req, res) => ctrl.updateCustom(req, res));
export default router;