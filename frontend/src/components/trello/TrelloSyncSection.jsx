import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDashboardRefresh } from '../../context/DashboardContext.jsx';
import { listAllTasks } from '../../services/tasks.service.js';
import {
  fetchTrelloBoardLists,
  fetchTrelloBoards,
  saveTrelloConnectionDefaults,
  syncTasksToTrello,
} from '../../services/trello.service.js';
import { resolveSavedBoardPreselect, resolveSavedListPreselect } from '../../utils/trello-defaults.js';
import { mapTrelloSyncError } from '../../utils/trello-sync-errors.js';
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

/** @typedef {import('../../utils/trello-sync-validation.js').TrelloSyncCredentialMode} TrelloSyncCredentialMode */

/**
 * @param {{
 *   courses: import('../../services/courses.service.js').Course[],
 *   handleAuthError: (err: unknown) => Promise<boolean>,
 *   syncMode: TrelloSyncCredentialMode,
 *   connectedUsername?: string | null,
 *   defaultBoardId?: string | null,
 *   defaultListId?: string | null,
 * }} props
 */
export default function TrelloSyncSection({
  courses,
  handleAuthError,
  syncMode,
  connectedUsername = null,
  defaultBoardId = null,
  defaultListId = null,
}) {
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
  const [savedBoardNotice, setSavedBoardNotice] = useState(/** @type {string | null} */ (null));
  const [savedListNotice, setSavedListNotice] = useState(/** @type {string | null} */ (null));
  const [defaultsSaveError, setDefaultsSaveError] = useState(/** @type {string | null} */ (null));
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

  const isConnectedMode = syncMode === 'connected';
  const validationMode = syncMode === 'connected' ? 'connected' : syncMode === 'loading' ? 'loading' : 'manual';
  const errorMode = isConnectedMode ? 'connected' : 'manual';

  const courseTitleById = useMemo(
    () => new Map(courses.map((c) => [c.id, c.title])),
    [courses]
  );

  const taskTitleById = useMemo(
    () => new Map(tasks.map((t) => [t.id, { title: t.title }])),
    [tasks]
  );

  const connectedLabel = useMemo(() => {
    if (connectedUsername) {
      return `@${connectedUsername}`;
    }
    return 'your connected Trello account';
  }, [connectedUsername]);

  const resetPickerState = useCallback(() => {
    setBoards([]);
    setLists([]);
    setSelectedBoardId('');
    setSelectedListId('');
    setBoardsAttempted(false);
    setListsAttempted(false);
    setBoardsError(null);
    setListsError(null);
    setSavedBoardNotice(null);
    setSavedListNotice(null);
    setDefaultsSaveError(null);
  }, []);

  const clearSyncResults = useCallback(() => {
    setSummary(null);
    setResults(null);
    setValidationError(null);
    setSyncError(null);
  }, []);

  const clearConnectedSessionState = useCallback(() => {
    resetPickerState();
    clearSyncResults();
    setSelectedTaskIds(new Set());
  }, [resetPickerState, clearSyncResults]);

  const clearCredentials = useCallback(() => {
    setApiKey('');
    setToken('');
    resetPickerState();
  }, [resetPickerState]);

  const clearCredentialsAfterSync = useCallback(() => {
    setApiKey('');
    setToken('');
  }, []);

  const prevSyncModeRef = useRef(syncMode);

  useEffect(() => {
    const prevSyncMode = prevSyncModeRef.current;
    prevSyncModeRef.current = syncMode;

    if (prevSyncMode === 'connected' && syncMode !== 'connected') {
      clearConnectedSessionState();
      setApiKey('');
      setToken('');
      return;
    }

    if (prevSyncMode !== 'connected' && syncMode === 'connected') {
      clearConnectedSessionState();
      setApiKey('');
      setToken('');
    }
  }, [syncMode, clearConnectedSessionState]);

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

  const persistConnectionDefaults = useCallback(
    async (boardId, listId) => {
      if (!isConnectedMode || !boardId || !listId) {
        return;
      }

      setDefaultsSaveError(null);

      try {
        await saveTrelloConnectionDefaults({ boardId, listId });
      } catch (err) {
        if (await handleAuthError(err)) return;
        setDefaultsSaveError(
          'Could not save your default list. Your selection still works for this session.'
        );
      }
    },
    [handleAuthError, isConnectedMode]
  );

  const loadListsForBoard = useCallback(
    async (boardId, options = {}) => {
      const { savedListId: listIdToPreselect = null, skipListPreselect = false } = options;

      setSelectedBoardId(boardId);
      setSelectedListId('');
      setLists([]);
      setListsError(null);
      setListsAttempted(false);
      setSavedListNotice(null);

      if (!boardId) {
        return;
      }

      const validation = validateTrelloLoadBoards(apiKey, token, validationMode);
      if (!validation.valid) {
        setListsError(validation.message);
        return;
      }

      setListsLoading(true);

      try {
        const data = isConnectedMode
          ? await fetchTrelloBoardLists({ boardId })
          : await fetchTrelloBoardLists({
              apiKey: apiKey.trim(),
              token: token.trim(),
              boardId,
            });
        setLists(data.lists);
        setListsAttempted(true);

        if (isConnectedMode && !skipListPreselect && listIdToPreselect) {
          const { listId, notice } = resolveSavedListPreselect(data.lists, listIdToPreselect);
          setSelectedListId(listId);
          setSavedListNotice(notice);
        }
      } catch (err) {
        if (await handleAuthError(err)) return;
        setListsError(mapTrelloSyncError(err, { mode: errorMode, context: 'lists' }));
        setListsAttempted(true);
      } finally {
        setListsLoading(false);
      }
    },
    [apiKey, token, validationMode, isConnectedMode, errorMode, handleAuthError]
  );

  async function handleLoadBoards() {
    setBoardsError(null);
    setListsError(null);
    setSavedBoardNotice(null);
    setSavedListNotice(null);
    setDefaultsSaveError(null);
    setValidationError(null);

    const validation = validateTrelloLoadBoards(apiKey, token, validationMode);
    if (!validation.valid) {
      setBoardsError(validation.message);
      return;
    }

    setBoardsLoading(true);
    resetPickerState();
    setBoardsAttempted(false);
    setListsAttempted(false);

    try {
      const data = isConnectedMode
        ? await fetchTrelloBoards()
        : await fetchTrelloBoards({
            apiKey: apiKey.trim(),
            token: token.trim(),
          });
      setBoards(data.boards);
      setBoardsAttempted(true);

      if (isConnectedMode && defaultBoardId) {
        const { boardId, notice } = resolveSavedBoardPreselect(data.boards, defaultBoardId);
        setSavedBoardNotice(notice);
        if (boardId) {
          await loadListsForBoard(boardId, { savedListId: defaultListId });
        }
      }
    } catch (err) {
      if (await handleAuthError(err)) return;
      setBoardsError(mapTrelloSyncError(err, { mode: errorMode, context: 'boards' }));
      setBoardsAttempted(true);
    } finally {
      setBoardsLoading(false);
    }
  }

  async function handleBoardChange(boardId) {
    setSavedBoardNotice(null);
    setSavedListNotice(null);
    await loadListsForBoard(boardId, { skipListPreselect: true });
  }

  async function handleListChange(listId) {
    setSelectedListId(listId);

    if (!isConnectedMode || !listId || !selectedBoardId) {
      return;
    }

    await persistConnectionDefaults(selectedBoardId, listId);
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
    const validation = validateTrelloSyncForm(apiKey, token, selectedListId, taskIds, validationMode);
    if (!validation.valid) {
      setValidationError(validation.message);
      return;
    }

    setSyncing(true);
    let backendAttempted = false;

    try {
      backendAttempted = true;
      const data = isConnectedMode
        ? await syncTasksToTrello({
            listId: selectedListId.trim(),
            taskIds,
          })
        : await syncTasksToTrello({
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
      setSyncError(mapTrelloSyncError(err, { mode: errorMode, context: 'sync' }));
    } finally {
      if (backendAttempted && !isConnectedMode) {
        clearCredentialsAfterSync();
      }
      setSyncing(false);
    }
  }

  const loadBoardsDisabled =
    syncMode === 'loading' ||
    syncing ||
    validateTrelloLoadBoards(apiKey, token, validationMode).valid !== true;

  const submitDisabled = isTrelloSyncSubmitDisabled(
    apiKey,
    token,
    selectedListId,
    [...selectedTaskIds],
    syncing,
    validationMode
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
            {syncMode === 'loading' && (
              <div className="trello-workspace__loading">
                <LoadingState message="Checking Trello account status…" />
              </div>
            )}

            {isConnectedMode && (
              <p role="status" className="form-card__hint trello-workspace__trust-note">
                Sync uses your connected Trello account ({connectedLabel}).
              </p>
            )}

            {syncMode === 'manual' && (
              <p className="form-card__hint trello-workspace__trust-note">
                Connect your Trello account above for one-click sync, or use advanced manual
                credentials below.
              </p>
            )}

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

            {!tasksLoading && !tasksError && syncMode !== 'loading' && (
              <div className="trello-workspace__flow-deck">
                <form
                  className="trello-sync__form trello-workspace__flow"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  {syncMode === 'manual' && (
                    <details className="trello-workspace__manual-credentials">
                      <summary className="trello-workspace__manual-credentials-summary">
                        Advanced manual credentials
                      </summary>
                      <TrelloSyncForm
                        apiKey={apiKey}
                        token={token}
                        onApiKeyChange={setApiKey}
                        onTokenChange={setToken}
                        onClearCredentials={clearCredentials}
                        disabled={syncing}
                      />
                    </details>
                  )}

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
                    savedBoardNotice={savedBoardNotice}
                    savedListNotice={savedListNotice}
                    defaultsSaveError={defaultsSaveError}
                    loadBoardsDisabled={loadBoardsDisabled}
                    onLoadBoards={handleLoadBoards}
                    onBoardChange={handleBoardChange}
                    onListChange={handleListChange}
                    disabled={syncing}
                    credentialMode={isConnectedMode ? 'connected' : 'manual'}
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
                      {isConnectedMode
                        ? `Create cards in your selected list using ${connectedLabel}.`
                        : 'Create cards in your selected Trello list.'}
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

        {!tasksLoading && !tasksError && syncMode !== 'loading' && (
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
