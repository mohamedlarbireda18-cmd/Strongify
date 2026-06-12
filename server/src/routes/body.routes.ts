import { Router } from 'express';
import { BodyController } from '../controllers/body.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const ctrl = new BodyController();

router.post('/logs', authenticate, (req, res) => ctrl.addWeightLog(req, res));
router.get('/logs', authenticate, (req, res) => ctrl.getWeightLogs(req, res));
router.get('/calculate', authenticate, (req, res) => ctrl.calculateBMR(req, res));

export default router;