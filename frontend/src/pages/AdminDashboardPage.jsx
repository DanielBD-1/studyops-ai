import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ApiRequestError } from '../services/courses.service.js';
import { getAdminStats } from '../services/admin.service.js';
import {
  formatFocusMinutes,
  formatTaskCompletionPercent,
} from '../utils/dashboard-format.js';

/**
 * @param {{ label: string, value: number | string, detail?: string }} props
 */
function StatItem({ label, value, detail }) {
  return (
    <div className="dashboard-stat">
      <dt className="dashboard-stat__label">{label}</dt>
      <dd className="dashboard-stat__value">{value}</dd>
      {detail && <dd className="dashboard-stat__detail">{detail}</dd>}
    </div>
  );
}

/**
 * @param {{ title: string, children: import('react').ReactNode, bandClass?: string }} props
 */
function StatBand({ title, children, bandClass }) {
  const bandClasses = ['dashboard-band', bandClass].filter(Boolean).join(' ');

  return (
    <section className={bandClasses}>
      <h2 className="dashboard-band__title">{title}</h2>
      <dl className="dashboard-stats">{children}</dl>
    </section>
  );
}

/**
 * @param {string} backendStatus
 * @returns {string}
 */
function formatBackendHealth(backendStatus) {
  if (backendStatus === 'ok') {
    return 'Backend: OK';
  }
  return `Backend: ${backendStatus}`;
}

export default function AdminDashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(
    /** @type {import('../services/admin.service.js').AdminStats | null} */ (null)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [forbidden, setForbidden] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

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

  const loadStats = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setLoading(true);
        setError(null);
        setForbidden(false);
      } else {
        setRefreshing(true);
      }

      try {
        const data = await getAdminStats();
        if (!mountedRef.current) return;
        setStats(data);
      } catch (err) {
        if (!mountedRef.current) return;
        if (await handleAuthError(err)) return;
        if (err instanceof ApiRequestError && err.code === 'FORBIDDEN') {
          if (!silent) {
            setForbidden(true);
          }
          return;
        }
        if (!silent) {
          setError('Could not load admin stats. Please try again.');
        }
      } finally {
        if (mountedRef.current) {
          if (!silent) {
            setLoading(false);
          } else {
            setRefreshing(false);
          }
        }
      }
    },
    [handleAuthError]
  );

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const taskCompletionPercent =
    stats && formatTaskCompletionPercent(stats.completedTasks, stats.totalTasks);

  return (
    <main className="page page--workspace page--admin-dashboard">
      <PageHeader
        intro
        title="Admin dashboard"
        lead="Platform-wide aggregate counts — no individual user data is shown here."
        note="Counts reflect all users on the platform. Refresh to load the latest totals."
      >
        {!loading && !error && !forbidden && stats && (
          <div className="page-header__actions">
            <Button
              variant="secondary"
              disabled={refreshing}
              onClick={() => loadStats({ silent: true })}
            >
              {refreshing ? 'Refreshing…' : 'Refresh stats'}
            </Button>
          </div>
        )}
      </PageHeader>

      {loading && <LoadingState message="Loading admin stats…" />}

      {!loading && forbidden && (
        <div className="admin-forbidden-card">
          <p className="admin-forbidden-card__lead">Admin access required</p>
          <p className="admin-forbidden-card__text">
            You do not have permission to view platform admin stats.
          </p>
          <p>
            <Link to="/dashboard">Back to dashboard</Link>
          </p>
        </div>
      )}

      {!loading && error && (
        <>
          <ErrorMessage message={error} />
          <Button variant="secondary" onClick={() => loadStats()}>
            Try again
          </Button>
        </>
      )}

      {!loading && !error && !forbidden && stats && (
        <>
          <p className="admin-disclaimer" role="note">
            Aggregate totals only — no emails, content, or individual records are displayed.
          </p>

          <div className="dashboard-cockpit admin-cockpit">
            <StatBand title="Platform overview" bandClass="dashboard-band--admin-overview">
              <StatItem label="Total users" value={stats.totalUsers} />
              <StatItem label="Total courses" value={stats.totalCourses} />
              <StatItem label="Study materials" value={stats.totalStudyMaterials} />
              <StatItem label="Generated plans" value={stats.totalGeneratedPlans} />
            </StatBand>

            <div className="dashboard-cockpit__row">
              <StatBand title="Tasks" bandClass="dashboard-band--tasks">
                <StatItem label="Total tasks" value={stats.totalTasks} />
                <StatItem label="Pending" value={stats.pendingTasks} />
                <StatItem
                  label="Completed"
                  value={stats.completedTasks}
                  detail={
                    taskCompletionPercent !== null
                      ? `${taskCompletionPercent}% complete`
                      : undefined
                  }
                />
              </StatBand>

              <StatBand title="Focus" bandClass="dashboard-band--focus">
                <StatItem
                  label="Focus time"
                  value={formatFocusMinutes(stats.totalFocusMinutes)}
                />
                <StatItem label="Completed sessions" value={stats.completedFocusSessions} />
              </StatBand>
            </div>

            <div className="dashboard-cockpit__row dashboard-cockpit__row--compact">
              <StatBand title="Learning assets" bandClass="dashboard-band--assets">
                <StatItem label="Flashcards" value={stats.totalFlashcards} />
              </StatBand>

              <StatBand title="Trello" bandClass="dashboard-band--trello">
                <StatItem label="Synced tasks" value={stats.trelloSyncedTasks} />
              </StatBand>
            </div>

            <StatBand title="Trello today (UTC)" bandClass="dashboard-band--trello-today">
              <StatItem
                label="Sync attempts today (UTC)"
                value={stats.trelloSyncAttemptsToday}
              />
              <StatItem
                label="Succeeded today (UTC)"
                value={stats.trelloSyncSucceededToday}
              />
              <StatItem label="Failed today (UTC)" value={stats.trelloSyncFailedToday} />
              <StatItem label="Skipped today (UTC)" value={stats.trelloSyncSkippedToday} />
            </StatBand>

            <StatBand title="System health" bandClass="dashboard-band--health">
              <StatItem
                label="Status"
                value={formatBackendHealth(stats.systemHealth.backend)}
              />
            </StatBand>
          </div>
        </>
      )}
    </main>
  );
}
