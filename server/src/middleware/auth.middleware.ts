import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { AppError } from './errorHandler';
import { AuthTokenPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

/**
 * Middleware requiring a valid Bearer JWT token in the Authorization header.
 * Attaches the decoded user payload to `req.user`.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Missing Bearer token.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as AuthTokenPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Session expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid authentication token.', 401));
  }
};

/**
 * Optional authentication middleware. If token is present and valid,
 * attaches `req.user`. Does not reject request if omitted.
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as AuthTokenPayload;
    req.user = decoded;
  } catch {
    // Ignore invalid optional tokens
  }

  next();
};
