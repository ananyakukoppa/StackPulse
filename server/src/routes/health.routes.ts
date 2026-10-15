import { Router, Request, Response } from 'express';
import { checkDatabaseConnection } from '../db/prisma';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  const dbStatus = await checkDatabaseConnection();

  const healthData = {
    service: 'StackPulse API',
    version: '1.0.0',
    increment: 'Increment 1 - Foundation & Data Model',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: {
      provider: 'postgresql',
      connected: dbStatus.connected,
      details: dbStatus.message,
    },
  };

  res.status(200).json(healthData);
});

export default router;
