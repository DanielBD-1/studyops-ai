import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useDashboardRefresh } from '../context/DashboardContext.jsx';
import Button from '../components/ui/Button.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import {
  ApiRequestError,
  startFocusSession,
  completeFocusSession,
} from '../services/focus.service.js';

const DEFAULT_DURATION_MINUTES = 25;

/** @type {Map<string, Promise<{ session: import('../services/focus.service.js').FocusSession }>>} */
const focusStartRequests = new Map();

/**
 * @param {string} taskId
 * @param {number} durationMinutes
 * @returns {string}
 */
function focusStartRequestKey(taskId, durationMinutes) {
  return `${taskId}:${durationMinutes}`;
}

/**
 * One in-flight POST /api/focus per task+duration; remounts share the same promise.
 * @param {string} taskId
 * @param {number} durationMinutes
 */
function beginFocusStart(taskId, durationMinutes) {
  const key = focusStartRequestKey(taskId, durationMinutes);
  const existing = focusStartRequests.get(key);
  if (existing) {
    return existing;
  }

  const promise = startFocusSession(taskId, durationMinutes)
    .then(({ session }) => ({ session }))
    .finally(() => {
      if (focusStartRequests.get(key) === promise) {
        focusStartRequests.delete(key);
      }
    });

  focusStartRequests.set(key, promise);
  return promise;
}

/**
 * @param {number} totalSeconds
 * @returns {string}
 */
function formatCountdown(totalSeconds) {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * @param {unknown} err
 * @returns {'task-not-found' | 'completed-task' | 'session-conflict' | 'network' | 'other'}
 */
function classifyStartError(err) {
  if (!(err instanceof ApiRequestError)) {
    return 'network';
  }
  if (err.code === 'NOT_FOUND') {
    return 'task-not-found';
  }
  if (
    err.code === 'VALIDATION_ERROR' &&
    err.message === 'Cannot start focus on a completed task'
  ) {
    return 'completed-task';
  }
  if (err.code === 'DATABASE_ERROR') {
    return 'network';
  }
  return 'other';
}

/**
 * @param {unknown} err
 * @returns {'session-conflict' | 'not-found' | 'network' | 'other'}
 */
function classifyCompleteError(err) {
  if (!(err instanceof ApiRequestError)) {
    return 'network';
  }
  if (err.code === 'CONFLICT') {
    return 'session-conflict';
  }
  if (err.code === 'NOT_FOUND') {
    return 'not-found';
  }
  if (err.code === 'DATABASE_ERROR') {
    return 'network';
  }
  return 'other';
}

export default function FocusPage() {
  const { taskId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { refreshStats } = useDashboardRefresh();

  /** @type {{ taskTitle?: string, courseId?: string, returnTo?: string } | null} */
  const navState = location.state ?? null;
  const taskTitle = navState?.taskTitle ?? null;
  const courseId = navState?.courseId ?? null;
  const returnTo = navState?.returnTo ?? '/tasks';

  const [startKey, setStartKey] = useState(0);

  const [phase, setPhase] = useState(
    /** @type {'starting' | 'active' | 'start-error' | 'done'} */ ('starting')
  );
  const [startErrorKind, setStartErrorKind] = useState(
    /** @type {'task-not-found' | 'completed-task' | 'session-conflict' | 'network' | 'other' | null} */ (
      null
    )
  );
  const [startErrorMessage, setStartErrorMessage] = useState(/** @type {string | null} */ (null));
  const [session, setSession] = useState(
    /** @type {import('../services/focus.service.js').FocusSession | null} */ (null)
  );
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_DURATION_MINUTES * 60);
  const [markTaskComplete, setMarkTaskComplete] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState(/** @type {string | null} */ (null));
  const [completedSession, setCompletedSession] = useState(
    /** @type {import('../services/focus.service.js').FocusSession | null} */ (null)
  );
  const [completedTask, setCompletedTask] = useState(
    /** @type {import('../services/tasks.service.js').StudyTask | null} */ (null)
  );

  const handleAuthError = useCallback(
    async (err) => {
      if (err instanceof ApiRequestError && err.code === 'AUTH_REQUIRED') {
        await logout();
        navigate('/');
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  const retryStart = useCallback(() => {
    setPhase('starting');
    setStartErrorKind(null);
    setStartErrorMessage(null);
    setSession(null);
    setCompleteError(null);
    setCompletedSession(null);
    setCompletedTask(null);
    setStartKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (!taskId) {
      return undefined;
    }

    let cancelled = false;

    (async () => {
      try {
        const { session: started } = await beginFocusStart(taskId, DEFAULT_DURATION_MINUTES);
        if (cancelled) return;
        setSession(started);
        setSecondsLeft(started.durationMinutes * 60);
        setPhase('active');
      } catch (err) {
        if (cancelled) return;
        if (await handleAuthError(err)) return;

        const kind = classifyStartError(err);
        setStartErrorKind(kind);
        if (kind === 'task-not-found') {
          setStartErrorMessage('Task not found.');
        } else if (kind === 'completed-task') {
          setStartErrorMessage('This task is already completed. Start focus from a pending task.');
        } else if (kind === 'network') {
          setStartErrorMessage('Could not start focus session. Check your connection and try again.');
        } else {
          setStartErrorMessage(
            err instanceof Error ? err.message : 'Could not start focus session.'
          );
        }
        setPhase('start-error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [taskId, handleAuthError, startKey]);

  useEffect(() => {
    if (phase !== 'active' || !session) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [phase, session]);

  async function handleCompleteSession() {
    if (!session || completing || phase === 'done') {
      return;
    }

    setCompleting(true);
    setCompleteError(null);

    try {
      const result = await completeFocusSession(session.id, markTaskComplete);
      setCompletedSession(result.session);
      setCompletedTask(result.task ?? null);
      setPhase('done');
      refreshStats();
    } catch (err) {
      if (await handleAuthError(err)) return;

      const kind = classifyCompleteError(err);
      if (kind === 'session-conflict') {
        setCompleteError('This focus session was already completed.');
        setPhase('start-error');
        setStartErrorKind('session-conflict');
        setStartErrorMessage('This focus session was already completed.');
      } else if (kind === 'not-found') {
        setCompleteError('Focus session not found.');
      } else if (kind === 'network') {
        setCompleteError('Could not complete session. Check your connection and try again.');
      } else {
        setCompleteError(err instanceof Error ? err.message : 'Could not complete session.');
      }
    } finally {
      setCompleting(false);
    }
  }

  const showCourseBack = Boolean(courseId);
  const tasksBackPath = returnTo.startsWith('/') ? returnTo : '/tasks';

  return (
    <main className="page page--workspace page--focus">
      <PageHeader title="Focus session" lead={taskTitle || undefined}>
        <nav className="page-header__nav" aria-label="Secondary">
          <Link to={tasksBackPath}>Back to tasks</Link>
          {showCourseBack ? <Link to={`/courses/${courseId}`}>Back to course</Link> : null}
        </nav>
      </PageHeader>

      {phase === 'starting' && <LoadingState message="Starting focus session…" />}

      {phase === 'start-error' && (
        <section aria-live="polite">
          <ErrorMessage
            message={
              startErrorMessage ??
              (startErrorKind === 'session-conflict'
                ? 'This focus session was already completed.'
                : 'Could not start focus session.')
            }
          />
          <div className="form-row">
            {startErrorKind === 'network' ? (
              <Button type="button" variant="secondary" onClick={retryStart}>
                Try again
              </Button>
            ) : null}
            <Link to="/tasks">Go to all tasks</Link>
          </div>
        </section>
      )}

      {phase === 'active' && session && (
        <section className="focus-panel" aria-live="polite">
          <p className="focus-timer">{formatCountdown(secondsLeft)}</p>
          <p className="focus-panel__hint">
            {session.durationMinutes}-minute focus timer
          </p>

          <label className="focus-panel__checkbox">
            <input
              type="checkbox"
              checked={markTaskComplete}
              disabled={completing}
              onChange={(e) => setMarkTaskComplete(e.target.checked)}
            />
            Mark task as complete
          </label>

          {completeError ? <ErrorMessage message={completeError} /> : null}

          <div className="focus-panel__actions">
            <Button
              type="button"
              variant="primary"
              disabled={completing}
              onClick={handleCompleteSession}
            >
              {completing ? 'Completing…' : 'Complete session'}
            </Button>
          </div>
        </section>
      )}

      {phase === 'done' && completedSession && (
        <section className="focus-done" aria-live="polite">
          <p>
            Session complete. You focused for {completedSession.durationMinutes} minute
            {completedSession.durationMinutes === 1 ? '' : 's'}.
          </p>
          {completedTask ? (
            <p>Task marked complete: {completedTask.title}</p>
          ) : null}
          <div className="focus-panel__actions">
            <Link to={tasksBackPath}>Back to tasks</Link>
            {showCourseBack ? <Link to={`/courses/${courseId}`}>Back to course</Link> : null}
          </div>
        </section>
      )}
    </main>
  );
}
