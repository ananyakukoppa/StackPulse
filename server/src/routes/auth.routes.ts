import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public auth endpoints with brute-force rate limiter
router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);

// Protected session inspection
router.get('/me', requireAuth, authController.getMe);

export default router;
