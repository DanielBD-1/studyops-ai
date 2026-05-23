import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { list, update, complete, remove } from './tasks.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', list);
router.post('/:taskId/complete', complete);
router.patch('/:taskId', update);
router.delete('/:taskId', remove);

export default router;
