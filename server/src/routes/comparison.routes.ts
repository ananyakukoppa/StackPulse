import { Router } from 'express';
import { comparisonController } from '../controllers/comparison.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Matrix computation (accessible publicly or authenticated)
router.get('/matrix', comparisonController.getMatrix);

// User-specific saved comparisons (require authentication)
router.post('/', requireAuth, comparisonController.saveComparison);
router.get('/', requireAuth, comparisonController.getUserComparisons);
router.delete('/:id', requireAuth, comparisonController.deleteComparison);

export default router;
