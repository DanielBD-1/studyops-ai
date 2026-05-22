import { z } from 'zod';

export const STUDY_TEXT_MIN = 100;
export const STUDY_TEXT_MAX = 50000;

export const ProcessRequestSchema = z
  .object({
    studyText: z
      .string()
      .trim()
      .min(STUDY_TEXT_MIN, `Study material must be at least ${STUDY_TEXT_MIN} characters`)
      .max(STUDY_TEXT_MAX, `Study material must be at most ${STUDY_TEXT_MAX} characters`),
  })
  .strict();
