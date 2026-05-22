import express from 'express';
import { postProcess } from './controllers/process.controller.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { generateStudyPlan } from './services/gemini.service.js';

/**
 * @param {{ geminiGenerate?: (studyText: string) => Promise<unknown> }} [options]
 */
export function createApp(options = {}) {
  const app = express();

  app.use(express.json({ limit: '512kb' }));

  app.locals.geminiGenerate = options.geminiGenerate ?? generateStudyPlan;

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'document-service' });
  });

  app.post('/process', postProcess);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp();
