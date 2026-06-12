import { Router } from 'express';
import { WorkoutController } from '../controllers/workout.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const ctrl = new WorkoutController();

router.get('/', authenticate, (req, res) => ctrl.getUserWorkouts(req, res));
router.get('/:id', authenticate, (req, res) => ctrl.getWorkoutById(req, res));
router.post('/', authenticate, (req, res) => ctrl.createWorkout(req, res));
router.post('/:id/session', authenticate, (req, res) => ctrl.addSession(req, res));
router.get('/:id/progress', authenticate, (req, res) => ctrl.getWorkoutProgress(req, res));
router.delete('/:id', authenticate, (req, res) => ctrl.deleteWorkout(req, res));

export default router;