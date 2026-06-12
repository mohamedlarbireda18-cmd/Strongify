import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const ctrl = new DashboardController();

router.get('/stats', authenticate, (req, res) => ctrl.getStats(req, res));
router.get('/progress', authenticate, (req, res) => ctrl.getProgress(req, res));

export default router;