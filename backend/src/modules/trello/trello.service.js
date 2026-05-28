import { createCard, trelloClientErrorMessage } from '../../clients/trello.client.js';
import { getSupabaseAdmin } from '../../config/supabase.js';
import { ApiError } from '../../shared/errors/ApiError.js';

const SYNC_TASK_COLUMNS = 'id, title, description, tags, trello_card_id';
const MAX_CARD_DESC_LENGTH = 16_000;

/**
 * @param {{ description: string, tags: string[] | null }} task
 * @returns {string}
 */
export function buildTrelloCardDescription(task) {
  let desc = (task.description ?? '').trim();
  const tags = task.tags ?? [];

  if (tags.length > 0) {
    const tagsLine = `Tags: ${tags.join(', ')}`;
    desc = desc ? `${desc}\n\n${tagsLine}` : tagsLine;
  }

  if (desc.length > MAX_CARD_DESC_LENGTH) {
    return desc.slice(0, MAX_CARD_DESC_LENGTH);
  }

  return desc;
}

/**
 * @param {string} userId
 * @param {string} taskId
 * @param {'success' | 'failed' | 'skipped'} status
 * @param {string | null} trelloCardId
 * @param {string | null} errorMessage
 */
async function insertSyncLog(userId, taskId, status, trelloCardId, errorMessage) {
  const { error } = await getSupabaseAdmin().from('trello_sync_logs').insert({
    user_id: userId,
    task_id: taskId,
    status,
    trello_card_id: trelloCardId,
    error_message: errorMessage,
  });

  if (error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to record Trello sync log', 500);
  }
}

/**
 * @param {string} userId
 * @param {string} taskId
 * @param {string} trelloCardId
 */
async function updateTaskTrelloCardId(userId, taskId, trelloCardId) {
  const { error } = await getSupabaseAdmin()
    .from('study_tasks')
    .update({ trello_card_id: trelloCardId })
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to save sync result', 500);
  }
}

/**
 * @param {string} userId
 * @param {string[]} taskIds
 */
async function loadOwnedSyncTasks(userId, taskIds) {
  const { data, error } = await getSupabaseAdmin()
    .from('study_tasks')
    .select(SYNC_TASK_COLUMNS)
    .eq('user_id', userId)
    .in('id', taskIds);

  if (error) {
    throw new ApiError('DATABASE_ERROR', 'Failed to load study tasks', 500);
  }

  /** @type {Map<string, { id: string, title: string, description: string, tags: string[] | null, trello_card_id: string | null }>} */
  const byId = new Map();
  for (const row of data ?? []) {
    byId.set(row.id, row);
  }
  return byId;
}

/**
 * @param {string} userId
 * @param {{ apiKey: string, token: string, listId: string, taskIds: string[] }} input
 */
export async function syncTasksToTrello(userId, input) {
  const { apiKey, token, listId, taskIds } = input;
  const taskMap = await loadOwnedSyncTasks(userId, taskIds);

  /** @type {Array<{ taskId: string, status: 'success' | 'failed' | 'skipped', trelloCardId: string | null, error: string | null }>} */
  const results = [];

  /** @type {string | null} */
  let trelloShortCircuitMessage = null;

  for (const taskId of taskIds) {
    const task = taskMap.get(taskId);

    if (!task) {
      results.push({
        taskId,
        status: 'failed',
        trelloCardId: null,
        error: 'Task not found',
      });
      continue;
    }

    if (task.trello_card_id) {
      const skipMessage = 'Already synced to Trello';
      await insertSyncLog(userId, taskId, 'skipped', null, skipMessage);
      results.push({
        taskId,
        status: 'skipped',
        trelloCardId: null,
        error: skipMessage,
      });
      continue;
    }

    if (trelloShortCircuitMessage) {
      await insertSyncLog(userId, taskId, 'failed', null, trelloShortCircuitMessage);
      results.push({
        taskId,
        status: 'failed',
        trelloCardId: null,
        error: trelloShortCircuitMessage,
      });
      continue;
    }

    const cardResult = await createCard({
      apiKey,
      token,
      listId,
      name: task.title,
      desc: buildTrelloCardDescription(task),
    });

    if (!cardResult.ok) {
      const errorMessage = trelloClientErrorMessage(cardResult.code);
      if (cardResult.code === 'TRELLO_AUTH' || cardResult.code === 'TRELLO_LIST_NOT_FOUND') {
        trelloShortCircuitMessage = errorMessage;
      }
      await insertSyncLog(userId, taskId, 'failed', null, errorMessage);
      results.push({
        taskId,
        status: 'failed',
        trelloCardId: null,
        error: errorMessage,
      });
      continue;
    }

    try {
      await updateTaskTrelloCardId(userId, taskId, cardResult.cardId);
    } catch (err) {
      const saveMessage =
        err instanceof ApiError && err.message === 'Failed to save sync result'
          ? 'Failed to save sync result'
          : 'Failed to save sync result';
      await insertSyncLog(userId, taskId, 'failed', null, saveMessage);
      results.push({
        taskId,
        status: 'failed',
        trelloCardId: null,
        error: saveMessage,
      });
      continue;
    }

    await insertSyncLog(userId, taskId, 'success', cardResult.cardId, null);
    results.push({
      taskId,
      status: 'success',
      trelloCardId: cardResult.cardId,
      error: null,
    });
  }

  const summary = {
    total: results.length,
    success: results.filter((r) => r.status === 'success').length,
    skipped: results.filter((r) => r.status === 'skipped').length,
    failed: results.filter((r) => r.status === 'failed').length,
  };

  return { results, summary };
}
