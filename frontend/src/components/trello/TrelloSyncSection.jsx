import { useCallback, useEffect, useMemo, useState } from 'react';
import { listAllTasks } from '../../services/tasks.service.js';
import { ApiRequestError, syncTasksToTrello } from '../../services/trello.service.js';
import {
  isTrelloSyncSubmitDisabled,
  TRELLO_SYNC_MAX_TASKS,
  validateTrelloSyncForm,
} from '../../utils/trello-sync-validation.js';
import TrelloSyncForm from './TrelloSyncForm.jsx';
import TrelloTaskSelector from './TrelloTaskSelector.jsx';
import TrelloSyncResults from './TrelloSyncResults.jsx';
import Button from '../ui/Button.jsx';
import ErrorMessage from '../ui/ErrorMessage.jsx';
import LoadingState from '../ui/LoadingState.jsx';

/**
 * @param {{
 *   courses: import('../../services/courses.service.js').Course[],
 *   handleAuthError: (err: unknown) => Promise<boolean>,
 * }} props
 */
export default function TrelloSyncSection({ courses, handleAuthError }) {
  const [tasks, setTasks] = useState(
    /** @type {import('../../services/tasks.service.js').StudyTask[]} */ ([])
  );
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState(/** @type {string | null} */ (null));

  const [apiKey, setApiKey] = useState('');
  const [token, setToken] = useState('');
  const [listId, setListId] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState(() => new Set());

  const [syncing, setSyncing] = useState(false);
  const [validationError, setValidationError] = useState(/** @type {string | null} */ (null));
  const [syncError, setSyncError] = useState(/** @type {string | null} */ (null));
  const [summary, setSummary] = useState(
    /** @type {import('../../services/trello.service.js').TrelloSyncSummary | null} */ (null)
  );
  const [results, setResults] = useState(
    /** @type {import('../../services/trello.service.js').TrelloSyncResult[] | null} */ (null)
  );

  const courseTitleById = useMemo(
    () => new Map(courses.map((c) => [c.id, c.title])),
    [courses]
  );

  const taskTitleById = useMemo(
    () => new Map(tasks.map((t) => [t.id, { title: t.title }])),
    [tasks]
  );

  const clearCredentials = useCallback(() => {
    setApiKey('');
    setToken('');
    setListId('');
  }, []);

  const loadTasks = useCallback(async () => {
    setTasksLoading(true);
    setTasksError(null);

    try {
      const data = await listAllTasks();
      setTasks(data.tasks);
    } catch (err) {
      if (await handleAuthError(err)) return;
      setTasksError(err instanceof Error ? err.message : 'Failed to load study tasks');
    } finally {
      setTasksLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  function handleToggleTask(taskId) {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }

  function handleSelectAll() {
    const ids = tasks.slice(0, TRELLO_SYNC_MAX_TASKS).map((t) => t.id);
    setSelectedTaskIds(new Set(ids));
  }

  function handleClearSelection() {
    setSelectedTaskIds(new Set());
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setValidationError(null);
    setSyncError(null);

    const taskIds = [...selectedTaskIds];
    const validation = validateTrelloSyncForm(apiKey, token, listId, taskIds);
    if (!validation.valid) {
      setValidationError(validation.message);
      return;
    }

    setSyncing(true);
    let backendAttempted = false;

    try {
      backendAttempted = true;
      const data = await syncTasksToTrello({
        apiKey: apiKey.trim(),
        token: token.trim(),
        listId: listId.trim(),
        taskIds,
      });
      setSummary(data.summary);
      setResults(data.results);
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError) {
        setSyncError(err.message);
      } else {
        setSyncError('Sync failed. Please try again.');
      }
    } finally {
      if (backendAttempted) {
        clearCredentials();
      }
      setSyncing(false);
    }
  }

  const submitDisabled = isTrelloSyncSubmitDisabled(
    apiKey,
    token,
    listId,
    [...selectedTaskIds],
    syncing
  );

  return (
    <>
      {tasksLoading && <LoadingState message="Loading study tasks…" />}

      {!tasksLoading && tasksError && (
        <>
          <ErrorMessage message={tasksError} />
          <Button variant="secondary" onClick={loadTasks}>
            Try again
          </Button>
        </>
      )}

      {!tasksLoading && !tasksError && (
        <form onSubmit={handleSubmit} noValidate>
          <TrelloSyncForm
            apiKey={apiKey}
            token={token}
            listId={listId}
            onApiKeyChange={setApiKey}
            onTokenChange={setToken}
            onListIdChange={setListId}
            onClearCredentials={clearCredentials}
            disabled={syncing}
          />

          <TrelloTaskSelector
            tasks={tasks}
            courseTitleById={courseTitleById}
            selectedTaskIds={selectedTaskIds}
            onToggleTask={handleToggleTask}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            disabled={syncing}
          />

          {validationError && <ErrorMessage message={validationError} />}
          {syncError && <ErrorMessage message={syncError} />}

          <div className="form-actions">
            <Button type="submit" disabled={submitDisabled}>
              {syncing ? 'Syncing…' : 'Sync to Trello'}
            </Button>
          </div>
        </form>
      )}

      <TrelloSyncResults summary={summary} results={results} taskTitleById={taskTitleById} />
    </>
  );
}
