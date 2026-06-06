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
import { getCourseAccentKey } from '../utils/course-accent.js';
import {
  deriveCoursePendingTasks,
  deriveDashboardRecommendation,
} from '../utils/dashboard-recommendation.js';

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
 * @param {import('../utils/dashboard-recommendation.js').DashboardRecommendation} recommendation
 */
/**
 * @param {{ label: string, value: number }} props
 */
function PulseMetric({ label, value }) {
  return (
    <div className="dashboard-pulse-metric">
      <span className="dashboard-pulse-metric__value">{value}</span>
      <span className="dashboard-pulse-metric__label">{label}</span>
    </div>
  );
}

function DashboardDecisionHero({ recommendation }) {
  return (
    <section
      className="dashboard-hero dashboard-hero--flagship"
      aria-labelledby="dashboard-hero-title"
    >
      <p className="dashboard-hero__eyebrow">What should I study next?</p>
      <h2 id="dashboard-hero-title" className="dashboard-hero__headline">
        {recommendation.headline}
      </h2>
      <p className="dashboard-hero__context">{recommendation.context}</p>
      <div className="dashboard-hero__actions">
        <Link to={recommendation.primaryCta.to} className="btn btn--primary dashboard-hero__cta">
          {recommendation.primaryCta.label}
        </Link>
        {recommendation.secondaryCta && (
          <Link
            to={recommendation.secondaryCta.to}
            className="link-btn link-btn--secondary dashboard-hero__cta"
          >
            {recommendation.secondaryCta.label}
          </Link>
        )}
      </div>
    </section>
  );
}

/**
 * @param {{ pending: number, completed: number, total: number, label: string, compact?: boolean, showHeader?: boolean }} props
 */
function TaskProgressBar({
  pending,
  completed,
  total,
  label,
  compact = false,
  showHeader = true,
}) {
  if (total <= 0) {
    return null;
  }

  const pendingPercent = Math.round((pending / total) * 100);
  const completedPercent = Math.round((completed / total) * 100);
  const barClasses = ['dashboard-progress', compact && 'dashboard-progress--compact']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={barClasses}>
      {showHeader && (
        <div className="dashboard-progress__header">
          <span className="dashboard-progress__label">{label}</span>
          <span className="dashboard-progress__meta">
            {pending} pending · {completed} completed
          </span>
        </div>
      )}
      <div
        className="dashboard-progress__track"
        role="img"
        aria-label={`${label}: ${pending} pending, ${completed} completed out of ${total} tasks`}
      >
        <div
          className="dashboard-progress__segment dashboard-progress__segment--pending"
          style={{ width: `${pendingPercent}%` }}
        />
        <div
          className="dashboard-progress__segment dashboard-progress__segment--completed"
          style={{ width: `${completedPercent}%` }}
        />
      </div>
    </div>
  );
}

/**
 * @param {{ stats: import('../services/dashboard.service.js').DashboardStats }} props
 */
function DashboardStudyPulse({ stats }) {
  const hasGlobalTasks = stats.totalTasks > 0;
  const coursesWithTasks = stats.courseStats.filter((course) => course.totalTasks > 0);

  if (!hasGlobalTasks && coursesWithTasks.length === 0) {
    return null;
  }

  return (
    <section
      className="dashboard-study-pulse dashboard-study-pulse--cockpit"
      aria-labelledby="dashboard-study-pulse-title"
    >
      <div className="dashboard-study-pulse__header">
        <h2 id="dashboard-study-pulse-title" className="dashboard-study-pulse__title">
          Study pulse
        </h2>
        <p className="dashboard-study-pulse__subtitle">Pending and completed tasks from your stats</p>
      </div>

      {hasGlobalTasks && (
        <div className="dashboard-study-pulse__band">
          <div
            className="dashboard-study-pulse__metrics"
            aria-label="All tasks: pending, completed, and total counts"
          >
            <PulseMetric label="Pending" value={stats.pendingTasks} />
            <PulseMetric label="Completed" value={stats.completedTasks} />
            <PulseMetric label="Total" value={stats.totalTasks} />
          </div>
          <TaskProgressBar
            label="All tasks"
            pending={stats.pendingTasks}
            completed={stats.completedTasks}
            total={stats.totalTasks}
          />
        </div>
      )}

      {coursesWithTasks.length > 0 && (
        <ul className="dashboard-study-pulse__courses">
          {coursesWithTasks.map((course) => {
            const pending = deriveCoursePendingTasks(course);
            return (
              <li key={course.courseId}>
                <TaskProgressBar
                  compact
                  label={course.courseName}
                  pending={pending}
                  completed={course.completedTasks}
                  total={course.totalTasks}
                />
              </li>
            );
          })}
        </ul>
      )}
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
  const recommendation = stats ? deriveDashboardRecommendation(stats) : null;

  return (
    <main className="page page--cockpit page--dashboard dashboard-workspace">
      <PageHeader
        intro
        title="Dashboard"
        lead="Your study command center — see what to do next, then review your stats."
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

      {loading && (
        <div className="dashboard-workspace__page-loading">
          <LoadingState message="Loading dashboard…" />
        </div>
      )}

      {!loading && error && (
        <div className="dashboard-workspace__page-error">
          <ErrorMessage message={error} />
          <div className="dashboard-workspace__error-actions">
            <Button variant="secondary" onClick={() => loadStats()}>
              Try again
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && stats && recommendation && (
        <>
          <DashboardDecisionHero recommendation={recommendation} />

          <DashboardStudyPulse stats={stats} />

          <section className="section section--compact dashboard-courses dashboard-courses--deck">
            <div className="section__header-row dashboard-courses__header">
              <h2 className="section__title section__title--sm dashboard-courses__title">
                Course workload
              </h2>
              <p className="section__subtitle">Pending tasks and flashcards by subject</p>
            </div>
            {stats.courseStats.length === 0 ? (
              <div className="dashboard-band dashboard-band--empty">
                <p className="dashboard-empty-courses">No courses to show yet.</p>
              </div>
            ) : (
              <ul className="card-list dashboard-course-list">
                {stats.courseStats.map((course) => {
                  const pendingTasks = deriveCoursePendingTasks(course);
                  const accentKey = getCourseAccentKey({
                    courseId: course.courseId,
                    courseName: course.courseName,
                  });
                  return (
                    <li key={course.courseId}>
                      <article
                        className="source-card source-card--subject source-card--dashboard-course source-card--navigable"
                        data-course-accent={accentKey}
                      >
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
                            <span className="source-card__stat-value">{pendingTasks}</span>
                            <span className="source-card__stat-label">pending</span>
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
                        {course.totalTasks > 0 && (
                          <TaskProgressBar
                            compact
                            showHeader={false}
                            label={`${course.courseName} tasks`}
                            pending={pendingTasks}
                            completed={course.completedTasks}
                            total={course.totalTasks}
                          />
                        )}
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section
            className="dashboard-secondary dashboard-secondary--tertiary"
            aria-labelledby="dashboard-secondary-title"
          >
            <div className="dashboard-secondary__header">
              <h2 id="dashboard-secondary-title" className="dashboard-secondary__title">
                At a glance
              </h2>
              <p className="dashboard-secondary__subtitle">Supporting stats from your account</p>
            </div>

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
                  <StatItem
                    label="Due now"
                    value={stats.dueFlashcardsCount ?? 0}
                    detail={
                      stats.dueFlashcardsCount > 0 ? (
                        <>
                          Ready for review ·{' '}
                          <Link to="/flashcards" className="link-btn link-btn--secondary">
                            Review flashcards
                          </Link>
                        </>
                      ) : undefined
                    }
                  />
                </StatBand>

                <StatBand title="Trello" bandClass="dashboard-band--trello">
                  <StatItem label="Synced tasks" value={stats.trelloSyncedTasks} />
                </StatBand>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
