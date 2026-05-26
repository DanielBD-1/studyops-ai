import cors from 'cors';
import express from 'express';
import { getEnv } from './config/env.js';
import authRoutes from './modules/auth/auth.routes.js';
import coursesRoutes from './modules/courses/courses.routes.js';
import studyMaterialsRoutes from './modules/study-materials/study-materials.routes.js';
import tasksRoutes from './modules/tasks/tasks.routes.js';
import flashcardsRoutes from './modules/flashcards/flashcards.routes.js';
import { ApiError } from './shared/errors/ApiError.js';
import { sendError } from './shared/utils/response.js';

const app = express();
const env = getEnv();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/study-materials', studyMaterialsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/flashcards', flashcardsRoutes);

app.use((err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof ApiError) {
    sendError(res, err.code, err.message, err.status, err.details);
    return;
  }

  sendError(res, 'SERVER_ERROR', 'An unexpected error occurred', 500);
});

export default app;
