import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { getById, update, remove } from './study-materials.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/:materialId', getById);
router.patch('/:materialId', update);
router.delete('/:materialId', remove);

export default router;
