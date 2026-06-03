import { useCallback, useEffect, useState } from 'react';
import Button from '../ui/Button.jsx';
import ErrorMessage from '../ui/ErrorMessage.jsx';
import FormCard from '../ui/FormCard.jsx';
import LoadingState from '../ui/LoadingState.jsx';
import {
  ApiRequestError,
  disconnectTrello,
  fetchTrelloAuthorizeUrl,
  fetchTrelloConnection,
} from '../../services/trello.service.js';
import { mapTrelloConnectError } from '../../utils/trello-connect-errors.js';

/**
 * @param {{
 *   handleAuthError: (err: unknown) => Promise<boolean>,
 *   onStatusMessage?: (message: { type: 'success' | 'error', text: string }) => void,
 * }} props
 */
export default function TrelloConnectionPanel({ handleAuthError, onStatusMessage }) {
  const [status, setStatus] = useState(
    /** @type {'loading' | 'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'error'} */ (
      'loading'
    )
  );
  const [connection, setConnection] = useState(
    /** @type {import('../../services/trello.service.js').TrelloConnectionConnected | null} */ (null)
  );
  const [errorMessage, setErrorMessage] = useState(/** @type {string | null} */ (null));

  const loadConnection = useCallback(async () => {
    setErrorMessage(null);

    try {
      const data = await fetchTrelloConnection();
      if (data.connected) {
        setConnection(data);
        setStatus('connected');
      } else {
        setConnection(null);
        setStatus('disconnected');
      }
    } catch (err) {
      if (await handleAuthError(err)) {
        return;
      }

      setConnection(null);
      setStatus('error');
      setErrorMessage(mapTrelloConnectError(err, { context: 'panel' }));
    }
  }, [handleAuthError]);

  useEffect(() => {
    loadConnection();
  }, [loadConnection]);

  async function handleConnect() {
    setErrorMessage(null);
    setStatus('connecting');

    try {
      const { authorizeUrl } = await fetchTrelloAuthorizeUrl();
      window.location.assign(authorizeUrl);
    } catch (err) {
      if (await handleAuthError(err)) {
        return;
      }

      setStatus(connection ? 'connected' : 'disconnected');
      setErrorMessage(mapTrelloConnectError(err, { context: 'panel' }));
    }
  }

  async function handleDisconnect() {
    setErrorMessage(null);
    setStatus('disconnecting');

    try {
      await disconnectTrello();
      setConnection(null);
      setStatus('disconnected');
      onStatusMessage?.({ type: 'success', text: 'Trello account disconnected.' });
    } catch (err) {
      if (await handleAuthError(err)) {
        return;
      }

      setStatus(connection ? 'connected' : 'disconnected');
      setErrorMessage(mapTrelloConnectError(err, { context: 'panel' }));
    }
  }

  const isBusy = status === 'connecting' || status === 'disconnecting';
  const connectedLabel =
    connection?.trelloUsername != null && connection.trelloUsername.trim().length > 0
      ? `@${connection.trelloUsername.trim()}`
      : 'your Trello account';

  return (
    <section className="section trello-workspace__account" aria-label="Trello account connection">
      <FormCard className="trello-workspace__step trello-workspace__step--account">
        <p className="trello-workspace__step-label" aria-hidden="true">
          Account
        </p>
        <h2 className="trello-workspace__step-title form-card__title" id="trello-step-account">
          Trello account
        </h2>
        <p className="form-card__hint trello-workspace__trust-note">
          Task sync below still uses manual API key and token for this session.
        </p>

        {status === 'loading' && (
          <div className="trello-workspace__account-loading">
            <LoadingState message="Loading Trello account status…" />
          </div>
        )}

        {status !== 'loading' && errorMessage && <ErrorMessage message={errorMessage} />}

        {status === 'disconnected' && (
          <>
            <p className="trello-workspace__account-status">No Trello account connected</p>
            <div className="trello-sync__actions">
              <Button type="button" onClick={handleConnect} disabled={isBusy}>
                Connect account
              </Button>
            </div>
          </>
        )}

        {status === 'connected' && (
          <>
            <p className="trello-workspace__account-status">
              Connected as {connectedLabel}
            </p>
            <div className="trello-sync__actions">
              <Button type="button" variant="secondary" onClick={handleDisconnect} disabled={isBusy}>
                Disconnect
              </Button>
            </div>
          </>
        )}

        {status === 'connecting' && (
          <>
            <p className="trello-workspace__account-status">Redirecting to Trello…</p>
            <div className="trello-sync__actions">
              <Button type="button" disabled>
                Connecting…
              </Button>
            </div>
          </>
        )}

        {status === 'disconnecting' && (
          <>
            <p className="trello-workspace__account-status">
              Connected as {connectedLabel}
            </p>
            <div className="trello-sync__actions">
              <Button type="button" variant="secondary" disabled>
                Disconnecting…
              </Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <div className="trello-sync__actions trello-workspace__error-actions">
            <Button type="button" variant="secondary" onClick={loadConnection}>
              Try again
            </Button>
          </div>
        )}
      </FormCard>
    </section>
  );
}
