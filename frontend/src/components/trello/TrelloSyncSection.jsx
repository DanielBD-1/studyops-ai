import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDashboardRefresh } from '../../context/DashboardContext.jsx';
import { listAllTasks } from '../../services/tasks.service.js';
import {
  ApiRequestError,
  fetchTrelloBoardLists,
  fetchTrelloBoards,
  syncTasksToTrello,
} from '../../services/trello.service.js';
import {
  isTrelloSyncSubmitDisabled,
  TRELLO_SYNC_MAX_TASKS,
  validateTrelloLoadBoards,
  validateTrelloSyncForm,
} from '../../utils/trello-sync-validation.js';
import TrelloBoardListPicker from './TrelloBoardListPicker.jsx';
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
  const { refreshStats } = useDashboardRefresh();
  const [tasks, setTasks] = useState(
    /** @type {import('../../services/tasks.service.js').StudyTask[]} */ ([])
  );
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState(/** @type {string | null} */ (null));

  const [apiKey, setApiKey] = useState('');
  const [token, setToken] = useState('');
  const [boards, setBoards] = useState(
    /** @type {import('../../services/trello.service.js').TrelloNamedItem[]} */ ([])
  );
  const [lists, setLists] = useState(
    /** @type {import('../../services/trello.service.js').TrelloNamedItem[]} */ ([])
  );
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [selectedListId, setSelectedListId] = useState('');
  const [boardsLoading, setBoardsLoading] = useState(false);
  const [listsLoading, setListsLoading] = useState(false);
  const [boardsAttempted, setBoardsAttempted] = useState(false);
  const [listsAttempted, setListsAttempted] = useState(false);
  const [boardsError, setBoardsError] = useState(/** @type {string | null} */ (null));
  const [listsError, setListsError] = useState(/** @type {string | null} */ (null));
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

  const resetPickerState = useCallback(() => {
    setBoards([]);
    setLists([]);
    setSelectedBoardId('');
    setSelectedListId('');
    setBoardsAttempted(false);
    setListsAttempted(false);
    setBoardsError(null);
    setListsError(null);
  }, []);

  const clearCredentials = useCallback(() => {
    setApiKey('');
    setToken('');
    resetPickerState();
  }, [resetPickerState]);

  const clearCredentialsAfterSync = useCallback(() => {
    setApiKey('');
    setToken('');
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

  async function handleLoadBoards() {
    setBoardsError(null);
    setListsError(null);
    setValidationError(null);

    const validation = validateTrelloLoadBoards(apiKey, token);
    if (!validation.valid) {
      setBoardsError(validation.message);
      return;
    }

    setBoardsLoading(true);
    resetPickerState();
    setBoardsAttempted(false);
    setListsAttempted(false);

    try {
      const data = await fetchTrelloBoards({
        apiKey: apiKey.trim(),
        token: token.trim(),
      });
      setBoards(data.boards);
      setBoardsAttempted(true);
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError) {
        setBoardsError(err.message);
      } else {
        setBoardsError('Failed to load Trello boards. Please try again.');
      }
      setBoardsAttempted(true);
    } finally {
      setBoardsLoading(false);
    }
  }

  async function handleBoardChange(boardId) {
    setSelectedBoardId(boardId);
    setSelectedListId('');
    setLists([]);
    setListsError(null);
    setListsAttempted(false);

    if (!boardId) {
      return;
    }

    const validation = validateTrelloLoadBoards(apiKey, token);
    if (!validation.valid) {
      setListsError(validation.message);
      return;
    }

    setListsLoading(true);

    try {
      const data = await fetchTrelloBoardLists({
        apiKey: apiKey.trim(),
        token: token.trim(),
        boardId,
      });
      setLists(data.lists);
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError) {
        setListsError(err.message);
      } else {
        setListsError('Failed to load Trello lists. Please try again.');
      }
    } finally {
      setListsLoading(false);
      setListsAttempted(true);
    }
  }

  function handleListChange(listId) {
    setSelectedListId(listId);
  }

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
    const validation = validateTrelloSyncForm(apiKey, token, selectedListId, taskIds);
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
        listId: selectedListId.trim(),
        taskIds,
      });
      setSummary(data.summary);
      setResults(data.results);
      if (data.summary.success > 0) {
        refreshStats();
      }
    } catch (err) {
      if (await handleAuthError(err)) return;
      if (err instanceof ApiRequestError) {
        setSyncError(err.message);
      } else {
        setSyncError('Sync failed. Please try again.');
      }
    } finally {
      if (backendAttempted) {
        clearCredentialsAfterSync();
      }
      setSyncing(false);
    }
  }

  const loadBoardsDisabled = validateTrelloLoadBoards(apiKey, token).valid !== true;

  const submitDisabled = isTrelloSyncSubmitDisabled(
    apiKey,
    token,
    selectedListId,
    [...selectedTaskIds],
    syncing
  );

  return (
    <section className="section trello-workspace__main" aria-label="Trello integration">
      <div className="trello-sync">
        <div className="trello-workspace__command-band trello-workspace__command-band--deck">
          <div className="trello-workspace__command-header section__header-row">
            <h2 className="section__title section__title--sm trello-workspace__command-title">
              Trello integration
            </h2>
            <p className="section__subtitle trello-workspace__command-subtitle">
              Connect and sync study tasks to Trello
            </p>
          </div>

          <div className="trello-workspace__command-body">
            {tasksLoading && (
              <div className="trello-workspace__loading">
                <LoadingState message="Loading study tasks…" />
              </div>
            )}

            {!tasksLoading && tasksError && (
              <div className="trello-sync__error-block">
                <ErrorMessage message={tasksError} />
                <div className="trello-sync__actions trello-workspace__error-actions">
                  <Button variant="secondary" onClick={loadTasks}>
                    Try again
                  </Button>
                </div>
              </div>
            )}

            {!tasksLoading && !tasksError && (
              <div className="trello-workspace__flow-deck">
                <form
                  className="trello-sync__form trello-workspace__flow"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <TrelloSyncForm
                    apiKey={apiKey}
                    token={token}
                    onApiKeyChange={setApiKey}
                    onTokenChange={setToken}
                    onClearCredentials={clearCredentials}
                    disabled={syncing}
                  />

                  <TrelloBoardListPicker
                    boards={boards}
                    lists={lists}
                    selectedBoardId={selectedBoardId}
                    selectedListId={selectedListId}
                    boardsLoading={boardsLoading}
                    listsLoading={listsLoading}
                    boardsAttempted={boardsAttempted}
                    listsAttempted={listsAttempted}
                    boardsError={boardsError}
                    listsError={listsError}
                    loadBoardsDisabled={loadBoardsDisabled}
                    onLoadBoards={handleLoadBoards}
                    onBoardChange={handleBoardChange}
                    onListChange={handleListChange}
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

                  {(validationError || syncError) && (
                    <div className="trello-sync__messages">
                      {validationError && <ErrorMessage message={validationError} />}
                      {syncError && <ErrorMessage message={syncError} />}
                    </div>
                  )}

                  <div className="trello-workspace__step trello-workspace__step--sync trello-sync__submit">
                    <p className="trello-workspace__step-label" aria-hidden="true">
                      Step 4
                    </p>
                    <h2 className="trello-workspace__step-title" id="trello-step-sync">
                      Sync to Trello
                    </h2>
                    <p className="trello-workspace__step-hint">
                      Create cards in your selected Trello list.
                    </p>
                    <div className="trello-sync__submit-actions">
                      <Button type="submit" disabled={submitDisabled}>
                        {syncing ? 'Syncing…' : 'Sync to Trello'}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {!tasksLoading && !tasksError && (
          <div className="trello-workspace__results-zone">
            <TrelloSyncResults
              summary={summary}
              results={results}
              taskTitleById={taskTitleById}
            />
          </div>
        )}
      </div>
    </section>
  );
}
