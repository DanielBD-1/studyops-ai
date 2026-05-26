import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { list, update, remove } from './flashcards.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', list);
router.patch('/:flashcardId', update);
router.delete('/:flashcardId', remove);

export default router;

