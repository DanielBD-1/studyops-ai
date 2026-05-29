import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { requireAdmin } from './admin.middleware.js';
import { accessCheck, getStats } from './admin.controller.js';

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get('/access-check', accessCheck);
router.get('/stats', getStats);

export default router;
