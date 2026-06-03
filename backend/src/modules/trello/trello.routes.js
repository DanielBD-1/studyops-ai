import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import {
  authorizeUrl,
  boardLists,
  boards,
  connectComplete,
  connectionStatus,
  disconnect,
  sync,
} from './trello.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/connection', connectionStatus);
router.get('/authorize-url', authorizeUrl);
router.post('/connect/complete', connectComplete);
router.post('/disconnect', disconnect);
router.post('/boards', boards);
router.post('/boards/:boardId/lists', boardLists);
router.post('/sync', sync);

export default router;
