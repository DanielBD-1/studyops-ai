import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { list, update, remove, review } from './flashcards.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', list);
router.post('/:flashcardId/review', review);
router.patch('/:flashcardId', update);
router.delete('/:flashcardId', remove);

export default router;

