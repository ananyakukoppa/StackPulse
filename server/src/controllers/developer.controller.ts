import { Request, Response, NextFunction } from 'express';
import { developerService } from '../services/developer.service';
import { AppError } from '../middleware/errorHandler';

export class DeveloperController {
  /**
   * GET /api/developers/:username
   * Retrieves full developer profile with computed aggregates and repositories.
   */
  public getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username } = req.params;
      if (!username || !username.trim()) {
        throw new AppError('GitHub username is required', 400);
      }

      const forceRefresh = req.query.refresh === 'true';
      const profile = await developerService.getDeveloperProfile(username, forceRefresh);

      // Return cache indicator header
      res.setHeader('X-Cache-Status', profile.isCached ? 'HIT' : 'MISS');

      res.status(200).json({
        success: true,
        data: profile,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/developers/:username/repos
   * Retrieves filtered, sorted, and paginated repositories for a developer.
   */
  public getRepos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username } = req.params;
      if (!username || !username.trim()) {
        throw new AppError('GitHub username is required', 400);
      }

      const query = typeof req.query.q === 'string' ? req.query.q : undefined;
      const language = typeof req.query.language === 'string' ? req.query.language : undefined;
      const sortBy = req.query.sortBy as 'stars' | 'pushed' | 'name' | undefined;
      const order = req.query.order as 'asc' | 'desc' | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await developerService.getDeveloperRepos(username, {
        query,
        language,
        sortBy,
        order,
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/developers/:username/refresh
   * Forces fresh data retrieval from GitHub API, updating the cache.
   */
  public refreshProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username } = req.params;
      if (!username || !username.trim()) {
        throw new AppError('GitHub username is required', 400);
      }

      const profile = await developerService.getDeveloperProfile(username, true);

      res.status(200).json({
        success: true,
        message: `Profile data for @${username} refreshed from live GitHub API`,
        data: profile,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };
}

export const developerController = new DeveloperController();
