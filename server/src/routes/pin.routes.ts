import { Router } from 'express';
import { pinController } from '../controllers/pin.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// All pin routes are strictly gated by authentication to guarantee user data privacy
router.post('/', requireAuth, pinController.pinRepository);
router.post('/toggle', requireAuth, pinController.togglePin);
router.get('/', requireAuth, pinController.getUserPins);
router.get('/check', requireAuth, pinController.getPinnedRepoNames);
router.put('/:id', requireAuth, pinController.updatePin);
router.delete('/:id', requireAuth, pinController.deletePin);

export default router;
