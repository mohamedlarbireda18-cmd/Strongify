import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

// POST /api/auth/register
router.post('/register', (req, res) => authController.register(req, res));

// POST /api/auth/verify
router.post('/verify', (req, res) => authController.verifyEmail(req, res));

// POST /api/auth/resend-code
router.post('/resend-code', (req, res) => authController.resendCode(req, res));

// POST /api/auth/login
router.post('/login', (req, res) => authController.login(req, res));

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => authController.forgotPassword(req, res));

// POST /api/auth/verify-reset-code
router.post('/verify-reset-code', (req, res) => authController.verifyResetCode(req, res));

// POST /api/auth/reset-password
router.post('/reset-password', (req, res) => authController.resetPassword(req, res));

export default router;