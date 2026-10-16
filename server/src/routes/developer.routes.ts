import { Router } from 'express';
import { developerController } from '../controllers/developer.controller';

const router = Router();

// Developer profile inspection with caching
router.get('/:username', developerController.getProfile);

// Repositories exploration with search, language filter, and sorting
router.get('/:username/repos', developerController.getRepos);

// Force refresh from GitHub API
router.post('/:username/refresh', developerController.refreshProfile);

export default router;
