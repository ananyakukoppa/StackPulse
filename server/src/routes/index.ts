import { Router } from 'express';
import healthRoutes from './health.routes';

const router = Router();

// Mount sub-routes
router.use('/', healthRoutes);

// Root API information endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'StackPulse API',
    description: 'Developer intelligence, profile analytics, and comparison platform',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      health: 'GET /api/health',
      auth: 'Pending Increment 2 (POST /api/auth/register, POST /api/auth/login)',
      developers: 'Pending Increment 3 (GET /api/developers/:username, GET /api/developers/:username/repos)',
      comparisons: 'Pending Increment 4 (POST /api/comparisons, GET /api/comparisons)',
      pins: 'Pending Increment 5 (POST /api/pins, GET /api/pins, PUT /api/pins/:id)',
    },
  });
});

export default router;
