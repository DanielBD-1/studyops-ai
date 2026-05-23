import { DEFAULT_GEMINI_MODEL, getEnv } from '../config/env.js';
import { AppError } from '../errors.js';
import { GeminiOutputSchema } from '../schemas/gemini.schema.js';
import { logGeminiEvent } from '../utils/logger.js';
const GEMINI_TIMEOUT_MS = 30_000;
const GEMINI_API_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * @param {string} studyText trimmed study material
 * @returns {string}
 */
export function buildGeminiPrompt(studyText) {
  return `You are a study assistant. Analyze the following study material and generate a structured study plan.

Study Material:
${studyText}

Generate a JSON response with this exact structure:
{
  "summary": "A 2-3 sentence summary of the material",
  "keyTopics": ["topic1", "topic2"],
  "difficulty": "easy" | "medium" | "hard",
  "tasks": [
    {
      "title": "Task title",
      "description": "Detailed description",
      "priority": "low" | "medium" | "high",
      "estimatedMinutes": 30,
      "difficulty": "easy" | "medium" | "hard",
      "tags": ["tag1", "tag2"]
    }
  ],
  "flashcards": [
    {
      "question": "Question text",
      "answer": "Answer text",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Requirements:
- summary: 50-2000 characters
- keyTopics: 1-10 items
- tasks: 1-20 items, each 5-480 minutes
- flashcards: 1-30 items
- Respond ONLY with valid JSON, no other text`;
}

/**
 * @param {string} raw
 * @returns {string}
 */
export function extractJsonText(raw) {
  let text = raw.trim();
  const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenced) {
    text = fenced[1].trim();
  }
  return text;
}

/**
 * @param {unknown} data
 * @returns {import('zod').infer<typeof GeminiOutputSchema>}
 */
export function parseAndValidateGeminiOutput(data) {
  const jsonText = typeof data === 'string' ? extractJsonText(data) : JSON.stringify(data);
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new AppError(
      'GEMINI_INVALID_RESPONSE',
      'Invalid response from AI, please try again',
      500
    );
  }

  const result = GeminiOutputSchema.safeParse(parsed);
  if (!result.success) {
    logGeminiEvent('error', {
      event: 'gemini_schema_validation_failed',
      zodIssueCount: result.error.issues.length,
      zodPaths: result.error.issues.map((i) => i.path.join('.')),
    });
    throw new AppError(
      'GEMINI_INVALID_RESPONSE',
      'Invalid response from AI, please try again',
      500
    );
  }

  return result.data;
}

/**
 * @param {Response} response
 * @param {number} studyTextLength
 */
async function handleGeminiHttpResponse(response, studyTextLength) {
  if (response.status === 429) {
    logGeminiEvent('error', {
      event: 'gemini_rate_limit',
      httpStatus: 429,
      studyTextLength,
      errorCode: 'GEMINI_RATE_LIMIT',
    });
    throw new AppError(
      'GEMINI_RATE_LIMIT',
      'Service temporarily unavailable, please wait 1 minute',
      429
    );
  }

  if (!response.ok) {
    logGeminiEvent('error', {
      event: 'gemini_api_error',
      httpStatus: response.status,
      studyTextLength,
      errorCode: 'GEMINI_API_ERROR',
    });
    throw new AppError(
      'GEMINI_API_ERROR',
      'AI processing failed, please try again',
      500
    );
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    logGeminiEvent('error', {
      event: 'gemini_invalid_response',
      httpStatus: response.status,
      studyTextLength,
      errorCode: 'GEMINI_INVALID_RESPONSE',
    });
    throw new AppError(
      'GEMINI_INVALID_RESPONSE',
      'Invalid response from AI, please try again',
      500
    );
  }

  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== 'string' || text.length === 0) {
    logGeminiEvent('error', {
      event: 'gemini_empty_response',
      httpStatus: response.status,
      studyTextLength,
      errorCode: 'GEMINI_INVALID_RESPONSE',
    });
    throw new AppError(
      'GEMINI_INVALID_RESPONSE',
      'Invalid response from AI, please try again',
      500
    );
  }

  return parseAndValidateGeminiOutput(text);
}

/**
 * @param {string} studyText trimmed text
 * @param {{ apiKey: string, fetchFn?: typeof fetch, model?: string }} options
 */
export async function callGeminiApi(studyText, options) {
  const { apiKey, fetchFn = fetch, model = DEFAULT_GEMINI_MODEL } = options;
  const studyTextLength = studyText.length;
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const prompt = buildGeminiPrompt(studyText);
  const startedAt = Date.now();

  let response;
  try {
    response = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    });
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    if (
      err instanceof Error &&
      (err.name === 'TimeoutError' || err.name === 'AbortError')
    ) {
      logGeminiEvent('error', {
        event: 'gemini_timeout',
        durationMs,
        studyTextLength,
        errorCode: 'GEMINI_TIMEOUT',
      });
      throw new AppError(
        'GEMINI_TIMEOUT',
        'Request timed out, please try shorter text',
        504
      );
    }
    logGeminiEvent('error', {
      event: 'gemini_network_error',
      durationMs,
      studyTextLength,
      errorCode: 'GEMINI_API_ERROR',
    });
    throw new AppError(
      'GEMINI_API_ERROR',
      'AI processing failed, please try again',
      500
    );
  }

  const durationMs = Date.now() - startedAt;
  try {
    const data = await handleGeminiHttpResponse(response, studyTextLength);
    logGeminiEvent('info', {
      event: 'gemini_success',
      durationMs,
      httpStatus: response.status,
      studyTextLength,
    });
    return data;
  } catch (err) {
    if (err instanceof AppError) {
      logGeminiEvent('error', {
        event: 'gemini_failed',
        durationMs,
        httpStatus: response.status,
        studyTextLength,
        errorCode: err.code,
      });
      throw err;
    }
    throw err;
  }
}

/**
 * @param {string} studyText
 */
export async function generateStudyPlan(studyText) {
  const { GEMINI_API_KEY, GEMINI_MODEL } = getEnv();
  return callGeminiApi(studyText, { apiKey: GEMINI_API_KEY, model: GEMINI_MODEL });
}
