import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import FormCard from '../components/ui/FormCard.jsx';
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
 * @param {{ title: string, children: import('react').ReactNode }} props
 */
function StatSection({ title, children }) {
  return (
    <section className="section section--compact">
      <h2 className="section__title section__title--sm">{title}</h2>
      <FormCard>
        <dl className="dashboard-stats">{children}</dl>
      </FormCard>
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
      <PageHeader title="Admin dashboard" />

      {loading && <LoadingState message="Loading admin stats…" />}

      {!loading && forbidden && (
        <>
          <p className="page__lead">Admin access required</p>
          <p>
            <Link to="/dashboard">Back to dashboard</Link>
          </p>
        </>
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
          <p className="section__actions">
            <Button
              variant="secondary"
              disabled={refreshing}
              onClick={() => loadStats({ silent: true })}
            >
              {refreshing ? 'Refreshing…' : 'Refresh stats'}
            </Button>
          </p>

          <StatSection title="Platform overview">
            <StatItem label="Total users" value={stats.totalUsers} />
            <StatItem label="Total courses" value={stats.totalCourses} />
            <StatItem label="Study materials" value={stats.totalStudyMaterials} />
            <StatItem label="Generated plans" value={stats.totalGeneratedPlans} />
          </StatSection>

          <StatSection title="Tasks">
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
          </StatSection>

          <StatSection title="Focus">
            <StatItem
              label="Focus time"
              value={formatFocusMinutes(stats.totalFocusMinutes)}
            />
            <StatItem label="Completed sessions" value={stats.completedFocusSessions} />
          </StatSection>

          <StatSection title="Learning assets">
            <StatItem label="Flashcards" value={stats.totalFlashcards} />
          </StatSection>

          <StatSection title="Trello">
            <StatItem label="Synced tasks" value={stats.trelloSyncedTasks} />
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
          </StatSection>

          <StatSection title="System health">
            <StatItem
              label="Status"
              value={formatBackendHealth(stats.systemHealth.backend)}
            />
          </StatSection>
        </>
      )}
    </main>
  );
}
