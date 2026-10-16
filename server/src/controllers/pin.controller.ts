import { Request, Response, NextFunction } from 'express';
import { pinService } from '../services/pin.service';
import { AppError } from '../middleware/errorHandler';

export class PinController {
  /**
   * POST /api/pins
   * Pins a repository with optional notes and custom tags.
   */
  public pinRepository = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throw new AppError('Authentication required to pin repositories', 401);
      }

      const { repository, note, tags } = req.body;
      if (!repository || !repository.fullName || !repository.name || !repository.developerUsername) {
        throw new AppError('Repository details (name, fullName, developerUsername) are required', 400);
      }

      const pin = await pinService.pinRepository(req.user.userId, repository, note, tags);

      res.status(201).json({
        success: true,
        message: 'Repository pinned successfully',
        data: pin,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pins
   * Lists all pinned repositories for the authenticated user with optional search/tag filtering.
   */
  public getUserPins = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throw new AppError('Authentication required to access pinned repositories', 401);
      }

      const tag = typeof req.query.tag === 'string' ? req.query.tag : undefined;
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;

      const pins = await pinService.getUserPins(req.user.userId, { tag, search });

      res.status(200).json({
        success: true,
        data: pins,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pins/check
   * Returns an array of repository full names pinned by the user for instant badge checks.
   */
  public getPinnedRepoNames = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        res.status(200).json({ success: true, data: [] });
        return;
      }

      const names = await pinService.getPinnedRepoFullNames(req.user.userId);

      res.status(200).json({
        success: true,
        data: names,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/pins/:id
   * Updates note and tags for a user's pin.
   */
  public updatePin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;
      const { note, tags } = req.body;

      const updated = await pinService.updatePin(req.user.userId, id, { note, tags });

      res.status(200).json({
        success: true,
        message: 'Pin updated successfully',
        data: updated,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/pins/:id
   * Removes a pinned repository.
   */
  public deletePin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throw new AppError('Authentication required', 401);
      }

      const { id } = req.params;
      await pinService.deletePin(req.user.userId, id);

      res.status(200).json({
        success: true,
        message: 'Repository unpinned successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/pins/toggle
   * Convenient toggle to pin/unpin by repository full name.
   */
  public togglePin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        throw new AppError('Authentication required', 401);
      }

      const { repository, note, tags } = req.body;
      if (!repository || !repository.fullName) {
        throw new AppError('Repository fullName is required', 400);
      }

      const currentPinned = await pinService.getPinnedRepoFullNames(req.user.userId);
      const isAlreadyPinned = currentPinned.includes(repository.fullName);

      if (isAlreadyPinned) {
        await pinService.unpinByFullName(req.user.userId, repository.fullName);
        res.status(200).json({
          success: true,
          pinned: false,
          message: `Unpinned ${repository.fullName}`,
          timestamp: new Date().toISOString(),
        });
      } else {
        const pin = await pinService.pinRepository(req.user.userId, repository, note, tags);
        res.status(201).json({
          success: true,
          pinned: true,
          message: `Pinned ${repository.fullName}`,
          data: pin,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      next(error);
    }
  };
}

export const pinController = new PinController();
