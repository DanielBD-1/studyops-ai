import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import FormCard from '../components/ui/FormCard.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
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

export default function DashboardStub() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(
    /** @type {import('../services/dashboard.service.js').DashboardStats | null} */ (null)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));

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

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      if (await handleAuthError(err)) return;
      setError('Could not load dashboard stats. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const taskCompletionPercent =
    stats && formatTaskCompletionPercent(stats.completedTasks, stats.totalTasks);

  const isEmptyAccount = stats?.totalCourses === 0;

  return (
    <main className="page page--workspace">
      <header className="page-header">
        <h1>Dashboard</h1>
        <nav className="page-header__nav" aria-label="Secondary">
          <Link to="/courses">My courses</Link>
          <Link to="/tasks">All study tasks</Link>
          <Link to="/flashcards">All flashcards</Link>
          <Link to="/trello">Trello sync</Link>
        </nav>
      </header>

      {user && (
        <p className="page__lead">
          Signed in as <strong>{user.email}</strong>
        </p>
      )}

      {loading && <LoadingState message="Loading dashboard…" />}

      {!loading && error && (
        <>
          <ErrorMessage message={error} />
          <Button variant="secondary" onClick={loadStats}>
            Try again
          </Button>
        </>
      )}

      {!loading && !error && stats && (
        <>
          {isEmptyAccount && (
            <section className="dashboard-empty-cta">
              <p className="dashboard-empty-cta__text">
                You have not created any courses yet. Start by adding a course to organize your
                study materials.
              </p>
              <Link to="/courses">Go to My courses</Link>
            </section>
          )}

          <StatSection title="Overview">
            <StatItem label="Courses" value={stats.totalCourses} />
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
          </StatSection>

          <section className="section section--compact">
            <h2 className="section__title section__title--sm">Per course</h2>
            {stats.courseStats.length === 0 ? (
              <FormCard>
                <p className="dashboard-empty-courses">No courses to show yet.</p>
              </FormCard>
            ) : (
              <ul className="card-list dashboard-course-list">
                {stats.courseStats.map((course) => (
                  <li key={course.courseId}>
                    <article className="source-card">
                      <h3 className="source-card__title">
                        <Link
                          to={`/courses/${course.courseId}`}
                          className="source-card__link"
                        >
                          {course.courseName}
                        </Link>
                      </h3>
                      <p className="source-card__meta">
                        {course.totalTasks} tasks · {course.completedTasks} completed ·{' '}
                        {course.totalFlashcards} flashcards
                      </p>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <p className="dashboard-actions">
        <Button variant="secondary" onClick={handleLogout}>
          Log out
        </Button>
      </p>
    </main>
  );
}
