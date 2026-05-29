import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import GlobalFlashcardsSection from '../components/flashcards/GlobalFlashcardsSection.jsx';
import Button from '../components/ui/Button.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { ApiRequestError, listCourses } from '../services/courses.service.js';

export default function FlashcardsPage() {
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
    <main className="page page--workspace">
      <PageHeader title="All saved flashcards" />

      {coursesLoading && <LoadingState message="Loading courses…" />}

      {!coursesLoading && coursesError && (
        <>
          <ErrorMessage message={coursesError} />
          <Button variant="secondary" onClick={loadCourses}>
            Try again
          </Button>
        </>
      )}

      {!coursesLoading && !coursesError && (
        <GlobalFlashcardsSection courses={courses} handleAuthError={handleAuthError} />
      )}
    </main>
  );
}
