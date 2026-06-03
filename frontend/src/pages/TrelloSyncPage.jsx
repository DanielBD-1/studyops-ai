import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import TrelloConnectionPanel from '../components/trello/TrelloConnectionPanel.jsx';
import TrelloSyncSection from '../components/trello/TrelloSyncSection.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { ApiRequestError, listCourses } from '../services/courses.service.js';

/**
 * @typedef {{ type: 'success' | 'error', message: string }} TrelloConnectFlash
 */

export default function TrelloSyncPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [courses, setCourses] = useState(
    /** @type {import('../services/courses.service.js').Course[]} */ ([])
  );
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(/** @type {string | null} */ (null));
  const [connectFlash, setConnectFlash] = useState(
    /** @type {TrelloConnectFlash | null} */ (null)
  );
  const [panelStatusMessage, setPanelStatusMessage] = useState(
    /** @type {{ type: 'success' | 'error', text: string } | null} */ (null)
  );

  useEffect(() => {
    /** @type {TrelloConnectFlash | undefined} */
    const flash = location.state?.trelloConnectFlash;
    if (flash?.type && flash.message) {
      setConnectFlash(flash);
      navigate('/trello', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

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
    <main className="page page--cockpit page--trello trello-workspace">
      <PageHeader
        intro
        title="Trello sync"
        lead="Connect with your Trello credentials, choose a destination list, and sync study tasks as cards."
        note="Credentials are used only for this session's requests — they are never saved or stored."
      />

      {connectFlash?.type === 'success' && (
        <p role="status" className="alert alert--success trello-workspace__connect-flash">
          {connectFlash.message}
        </p>
      )}

      {connectFlash?.type === 'error' && (
        <div className="trello-workspace__connect-flash">
          <ErrorMessage message={connectFlash.message} />
        </div>
      )}

      {panelStatusMessage?.type === 'success' && (
        <p role="status" className="alert alert--success trello-workspace__connect-flash">
          {panelStatusMessage.text}
        </p>
      )}

      <TrelloConnectionPanel
        handleAuthError={handleAuthError}
        onStatusMessage={setPanelStatusMessage}
      />

      {coursesLoading && (
        <div className="trello-workspace__page-loading">
          <LoadingState message="Loading courses…" />
        </div>
      )}

      {!coursesLoading && coursesError && (
        <div className="trello-workspace__page-error">
          <ErrorMessage message={coursesError} />
        </div>
      )}

      {!coursesLoading && !coursesError && (
        <TrelloSyncSection courses={courses} handleAuthError={handleAuthError} />
      )}
    </main>
  );
}
