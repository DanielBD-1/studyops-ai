import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDashboardRefresh } from '../context/DashboardContext.jsx';
import { ApiRequestError } from '../services/courses.service.js';
import { getDashboardStats } from '../services/dashboard.service.js';
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

export default function DashboardStub() {
  const { user, logout } = useAuth();
  const { subscribeToRefresh } = useDashboardRefresh();
  const navigate = useNavigate();
  const [stats, setStats] = useState(
    /** @type {import('../services/dashboard.service.js').DashboardStats | null} */ (null)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [refreshing, setRefreshing] = useState(false);
  const mountedRef = useRef(true);
  const silentRefreshInFlightRef = useRef(false);
  const pendingSilentRefreshRef = useRef(false);

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
      } else {
        setRefreshing(true);
      }

      try {
        const data = await getDashboardStats();
        if (!mountedRef.current) return;
        setStats(data);
      } catch (err) {
        if (!mountedRef.current) return;
        if (await handleAuthError(err)) return;
        if (!silent) {
          setError('Could not load dashboard stats. Please try again.');
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

  const runSilentRefresh = useCallback(async () => {
    if (silentRefreshInFlightRef.current) {
      pendingSilentRefreshRef.current = true;
      return;
    }

    silentRefreshInFlightRef.current = true;
    try {
      await loadStats({ silent: true });
    } finally {
      silentRefreshInFlightRef.current = false;
      if (pendingSilentRefreshRef.current) {
        pendingSilentRefreshRef.current = false;
        await runSilentRefresh();
      }
    }
  }, [loadStats]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    return subscribeToRefresh(() => {
      if (stats !== null && !loading) {
        runSilentRefresh();
      }
    });
  }, [subscribeToRefresh, stats, loading, runSilentRefresh]);

  const taskCompletionPercent =
    stats && formatTaskCompletionPercent(stats.completedTasks, stats.totalTasks);

  const isEmptyAccount = stats?.totalCourses === 0;

  return (
    <main className="page page--cockpit page--dashboard">
      <PageHeader
        intro
        title="Dashboard"
        lead="Your study cockpit — a calm overview of courses, tasks, and learning activity."
        note={user ? `Signed in as ${user.email}` : undefined}
      >
        {!loading && !error && stats && (
          <div className="page-header__actions">
            <Button
              variant="secondary"
              disabled={refreshing}
              onClick={() => runSilentRefresh()}
            >
              {refreshing ? 'Refreshing…' : 'Refresh stats'}
            </Button>
          </div>
        )}
      </PageHeader>

      {loading && <LoadingState message="Loading dashboard…" />}

      {!loading && error && (
        <>
          <ErrorMessage message={error} />
          <Button variant="secondary" onClick={() => loadStats()}>
            Try again
          </Button>
        </>
      )}

      {!loading && !error && stats && (
        <>
          {isEmptyAccount && (
            <section className="dashboard-empty-cta" aria-label="Get started">
              <p className="dashboard-empty-cta__eyebrow">Get started</p>
              <p className="dashboard-empty-cta__text">
                You have not created any courses yet. Start by adding a course to organize your
                study materials.
              </p>
              <Link to="/courses" className="dashboard-empty-cta__link">
                Go to My courses
              </Link>
            </section>
          )}

          <div className="dashboard-cockpit">
            <StatBand title="Overview" bandClass="dashboard-band--overview">
              <StatItem label="Courses" value={stats.totalCourses} />
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
          </div>

          <section className="section section--compact dashboard-courses">
            <div className="section__header-row">
              <h2 className="section__title section__title--sm">Per course</h2>
              <p className="section__subtitle">Jump into a subject workspace</p>
            </div>
            {stats.courseStats.length === 0 ? (
              <div className="dashboard-band dashboard-band--empty">
                <p className="dashboard-empty-courses">No courses to show yet.</p>
              </div>
            ) : (
              <ul className="card-list dashboard-course-list">
                {stats.courseStats.map((course) => (
                  <li key={course.courseId}>
                    <article className="source-card source-card--subject source-card--dashboard-course">
                      <h3 className="source-card__title">
                        <Link
                          to={`/courses/${course.courseId}`}
                          className="source-card__link"
                        >
                          {course.courseName}
                        </Link>
                      </h3>
                      <ul className="source-card__stat-row" aria-label="Course stats">
                        <li className="source-card__stat">
                          <span className="source-card__stat-value">{course.totalTasks}</span>
                          <span className="source-card__stat-label">tasks</span>
                        </li>
                        <li className="source-card__stat">
                          <span className="source-card__stat-value">{course.completedTasks}</span>
                          <span className="source-card__stat-label">completed</span>
                        </li>
                        <li className="source-card__stat">
                          <span className="source-card__stat-value">{course.totalFlashcards}</span>
                          <span className="source-card__stat-label">flashcards</span>
                        </li>
                      </ul>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
