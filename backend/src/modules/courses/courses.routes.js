import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { listByCourse, createForCourse } from '../study-materials/study-materials.controller.js';
import { listByCourse as listTasksByCourse, createForCourse as createTaskForCourse } from '../tasks/tasks.controller.js';
import { list, create, getById, update, remove } from './courses.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', list);
router.post('/', create);
router.get('/:id/materials', listByCourse);
router.post('/:id/materials', createForCourse);
router.get('/:id/tasks', listTasksByCourse);
router.post('/:id/tasks', createTaskForCourse);
router.get('/:id', getById);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;
