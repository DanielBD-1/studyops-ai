import { Router } from 'express';
import { register, login, logout, me } from './auth.controller.js';
import { requireAuth } from './auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);

export default router;
