import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { list, create, getById, update, remove } from './courses.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', list);
router.post('/', create);
router.get('/:id', getById);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;
