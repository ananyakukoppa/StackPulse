import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import developerRoutes from './developer.routes';
import comparisonRoutes from './comparison.routes';
import pinRoutes from './pin.routes';

const router = Router();

// Mount all REST API sub-routes
router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/developers', developerRoutes);
router.use('/comparisons', comparisonRoutes);
router.use('/pins', pinRoutes);

// Root API documentation endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'StackPulse API',
    description: 'Developer intelligence, profile analytics, and comparison platform',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
      },
      developers: {
        profile: 'GET /api/developers/:username',
        repos: 'GET /api/developers/:username/repos',
        refresh: 'POST /api/developers/:username/refresh',
      },
      comparisons: {
        matrix: 'GET /api/comparisons/matrix?devs=user1,user2,...',
        save: 'POST /api/comparisons',
        list: 'GET /api/comparisons',
        delete: 'DELETE /api/comparisons/:id',
      },
      pins: {
        list: 'GET /api/pins',
        check: 'GET /api/pins/check',
        pin: 'POST /api/pins',
        toggle: 'POST /api/pins/toggle',
        update: 'PUT /api/pins/:id',
        delete: 'DELETE /api/pins/:id',
      },
    },
  });
});

export default router;
