import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { boardLists, boards, sync } from './trello.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/boards', boards);
router.post('/boards/:boardId/lists', boardLists);
router.post('/sync', sync);

export default router;
