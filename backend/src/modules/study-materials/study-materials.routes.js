import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import {
  getById,
  update,
  remove,
  generate,
  getGeneratedPlan,
  deleteGeneratedPlan,
  importPlanTasks,
  importPlanFlashcards,
} from './study-materials.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/:materialId/import/tasks', importPlanTasks);
router.post('/:materialId/import/flashcards', importPlanFlashcards);
router.post('/:materialId/generate', generate);
router.get('/:materialId/generated-plan', getGeneratedPlan);
router.delete('/:materialId/generated-plan', deleteGeneratedPlan);
router.get('/:materialId', getById);
router.patch('/:materialId', update);
router.delete('/:materialId', remove);

export default router;
