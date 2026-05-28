import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { sync } from './trello.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/sync', sync);

export default router;
