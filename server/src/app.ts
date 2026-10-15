import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/environment';
import { requestLogger } from './middleware/requestLogger';
import { standardRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes';

export const createApp = (): Express => {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  app.use(
    cors({
      origin: [config.clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request Logging
  app.use(requestLogger);

  // Rate Limiting
  app.use('/api', standardRateLimiter);

  // Mount API Routes
  app.use('/api', apiRoutes);

  // Root Welcome Route
  app.get('/', (req: Request, res: Response) => {
    res.json({
      message: 'Welcome to StackPulse API Server',
      status: 'active',
      health: '/api/health',
    });
  });

  // 404 Route Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `Route not found: ${req.method} ${req.originalUrl}`,
      timestamp: new Date().toISOString(),
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

export default createApp;
