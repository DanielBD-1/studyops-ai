import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import TrelloSyncSection from '../components/trello/TrelloSyncSection.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import { ApiRequestError, listCourses } from '../services/courses.service.js';

export default function TrelloSyncPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState(
    /** @type {import('../services/courses.service.js').Course[]} */ ([])
  );
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(/** @type {string | null} */ (null));

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

  const loadCourses = useCallback(async () => {
    setCoursesLoading(true);
    setCoursesError(null);

    try {
      const data = await listCourses();
      setCourses(data.courses);
    } catch (err) {
      if (await handleAuthError(err)) return;
      setCoursesError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setCoursesLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  return (
    <main className="page page--workspace page--trello">
      <header className="page-header page-header--intro">
        <div className="page-header__intro">
          <h1>Trello sync</h1>
          <p className="page-header__lead">
            Sync selected study tasks to a Trello list.
          </p>
          <p className="page-header__note">
            Credentials are used only for this sync request and are not saved.
          </p>
        </div>
        <nav className="page-header__nav" aria-label="Secondary">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/courses">My courses</Link>
          <Link to="/tasks">All study tasks</Link>
        </nav>
      </header>

      {coursesLoading && <LoadingState message="Loading courses…" />}

      {!coursesLoading && coursesError && (
        <ErrorMessage message={coursesError} />
      )}

      {!coursesLoading && !coursesError && (
        <TrelloSyncSection courses={courses} handleAuthError={handleAuthError} />
      )}
    </main>
  );
}
