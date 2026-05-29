import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { start, complete } from './focus.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/', start);
router.post('/:sessionId/complete', complete);

export default router;
