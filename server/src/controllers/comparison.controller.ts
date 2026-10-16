import { Request, Response, NextFunction } from 'express';
import { comparisonService } from '../services/comparison.service';
import { AppError } from '../middleware/errorHandler';

export class ComparisonController {
  /**
   * GET /api/comparisons/matrix?devs=user1,user2,...
   * Returns side-by-side comparison data for multiple developers.
   */
  public getMatrix = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const devsParam = req.query.devs as string;
      if (!devsParam || !devsParam.trim()) {
        throw new AppError('Query parameter "devs" with comma-separated GitHub usernames is required', 400);
      }

      const usernames = devsParam.split(',').map((u) => u.trim()).filter((u) => u.length > 0);
      const matrix = await comparisonService.getComparisonMatrix(usernames);

      res.status(200).json({
        success: true,
        data: matrix,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/comparisons
   * Saves a named comparison for the authenticated user.
   */
  public saveComparison = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throw new AppError('Authentication required to save comparisons', 401);
      }

      const { name, description, developers } = req.body;
      if (!name || typeof name !== 'string') {
        throw new AppError('Comparison name is required', 400);
      }

      if (!Array.isArray(developers) || developers.length < 2) {
        throw new AppError('At least 2 developer usernames are required', 400);
      }

      const saved = await comparisonService.saveComparison(
        req.user.userId,
        name,
        description,
        developers
      );

      res.status(201).json({
        success: true,
        message: 'Comparison saved successfully',
        data: saved,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/comparisons
   * Lists all saved comparisons for the current user.
   */
  public getUserComparisons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throw new AppError('Authentication required to retrieve saved comparisons', 401);
      }

      const list = await comparisonService.getUserComparisons(req.user.userId);

      res.status(200).json({
        success: true,
        data: list,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/comparisons/:id
   * Deletes a saved comparison.
   */
  public deleteComparison = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throw new AppError('Authentication required to delete comparisons', 401);
      }

      const { id } = req.params;
      await comparisonService.deleteComparison(req.user.userId, id);

      res.status(200).json({
        success: true,
        message: 'Saved comparison deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };
}

export const comparisonController = new ComparisonController();
