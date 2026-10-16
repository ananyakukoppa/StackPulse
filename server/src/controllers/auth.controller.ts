import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { AppError } from '../middleware/errorHandler';

export class AuthController {
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseResult = registerSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errorMessages = parseResult.error.errors.map((e) => e.message).join(', ');
        throw new AppError(errorMessages, 400);
      }

      const result = await authService.register(parseResult.data);

      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errorMessages = parseResult.error.errors.map((e) => e.message).join(', ');
        throw new AppError(errorMessages, 400);
      }

      const result = await authService.login(parseResult.data);

      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throw new AppError('Unauthorized access', 401);
      }

      const user = await authService.getProfile(req.user.userId);

      res.status(200).json({
        success: true,
        data: { user },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
