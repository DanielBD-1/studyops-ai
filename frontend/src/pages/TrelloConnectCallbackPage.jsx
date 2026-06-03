import { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingState from '../components/ui/LoadingState.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ApiRequestError, completeTrelloConnection } from '../services/trello.service.js';
import { mapTrelloConnectError } from '../utils/trello-connect-errors.js';
import {
  parseTrelloOAuthCallback,
  sanitizeOAuthCallbackUrl,
} from '../utils/trello-oauth-callback.js';
import { beginOAuthExchange } from '../utils/trello-oauth-exchange-guard.js';

/**
 * @param {'success' | 'error'} type
 * @param {string} message
 */
function buildConnectFlash(type, message) {
  return { trelloConnectFlash: { type, message } };
}

export default function TrelloConnectCallbackPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useLayoutEffect(() => {
    const { search, hash, pathname } = window.location;
    const { state, token } = parseTrelloOAuthCallback(search, hash);

    beginOAuthExchange(async () => {
      sanitizeOAuthCallbackUrl(pathname, window.history);

      if (!state || !token) {
        navigate('/trello', {
          replace: true,
          state: buildConnectFlash(
            'error',
            mapTrelloConnectError(null, { context: 'callback' })
          ),
        });
        return;
      }

      try {
        await completeTrelloConnection({ token, state });

        navigate('/trello', {
          replace: true,
          state: buildConnectFlash('success', 'Trello account connected successfully.'),
        });
      } catch (err) {
        if (err instanceof ApiRequestError && err.code === 'AUTH_REQUIRED') {
          await logout();
          navigate('/', { replace: true });
          return;
        }

        navigate('/trello', {
          replace: true,
          state: buildConnectFlash(
            'error',
            mapTrelloConnectError(err, { context: 'callback' })
          ),
        });
      }
    });
  }, [logout, navigate]);

  return (
    <main className="page page--cockpit page--trello trello-workspace">
      <PageHeader title="Trello account" />
      <div className="trello-workspace__page-loading">
        <LoadingState message="Completing Trello connection…" />
      </div>
    </main>
  );
}
