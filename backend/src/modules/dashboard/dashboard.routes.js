import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { getStats } from './dashboard.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/stats', getStats);

export default router;
