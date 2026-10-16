import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import developerRoutes from './developer.routes';

const router = Router();

// Mount API sub-routes
router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/developers', developerRoutes);

// Root API documentation endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'StackPulse API',
    description: 'Developer intelligence, profile analytics, and comparison platform',
    version: '1.2.0',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (Protected)',
      },
      developers: {
        profile: 'GET /api/developers/:username',
        repos: 'GET /api/developers/:username/repos',
        refresh: 'POST /api/developers/:username/refresh',
      },
      comparisons: 'Scheduled for Increment 3 (POST /api/comparisons, GET /api/comparisons)',
      pins: 'Scheduled for Increment 3 (POST /api/pins, GET /api/pins, PUT /api/pins/:id)',
    },
  });
});

export default router;
