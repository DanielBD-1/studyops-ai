import { useCallback, useEffect, useState } from 'react';
import Button from '../ui/Button.jsx';
import ErrorMessage from '../ui/ErrorMessage.jsx';
import FormCard from '../ui/FormCard.jsx';
import LoadingState from '../ui/LoadingState.jsx';
import {
  disconnectTrello,
  fetchTrelloAuthorizeUrl,
  fetchTrelloConnection,
} from '../../services/trello.service.js';
import { mapTrelloConnectError } from '../../utils/trello-connect-errors.js';

/**
 * @typedef {'loading' | 'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'error'} TrelloConnectionPanelStatus
 */

/**
 * @param {{
 *   handleAuthError: (err: unknown) => Promise<boolean>,
 *   onStatusMessage?: (message: { type: 'success' | 'error', text: string }) => void,
 *   onConnectionChange?: (payload: {
 *     status: TrelloConnectionPanelStatus,
 *     connection: import('../../services/trello.service.js').TrelloConnectionConnected | null,
 *   }) => void,
 *   refreshTrigger?: number,
 * }} props
 */
export default function TrelloConnectionPanel({
  handleAuthError,
  onStatusMessage,
  onConnectionChange,
  refreshTrigger = 0,
}) {
  const [status, setStatus] = useState(
    /** @type {TrelloConnectionPanelStatus} */ ('loading')
  );
  const [connection, setConnection] = useState(
    /** @type {import('../../services/trello.service.js').TrelloConnectionConnected | null} */ (null)
  );
  const [errorMessage, setErrorMessage] = useState(/** @type {string | null} */ (null));

  const notifyConnectionChange = useCallback(
    (
      nextStatus,
      nextConnection
    ) => {
      onConnectionChange?.({
        status: nextStatus,
        connection: nextConnection,
      });
    },
    [onConnectionChange]
  );

  const loadConnection = useCallback(async () => {
    setErrorMessage(null);
    setStatus('loading');
    notifyConnectionChange('loading', null);

    try {
      const data = await fetchTrelloConnection();
      if (data.connected) {
        setConnection(data);
        setStatus('connected');
        notifyConnectionChange('connected', data);
      } else {
        setConnection(null);
        setStatus('disconnected');
        notifyConnectionChange('disconnected', null);
      }
    } catch (err) {
      if (await handleAuthError(err)) {
        return;
      }

      setConnection(null);
      setStatus('error');
      setErrorMessage(mapTrelloConnectError(err, { context: 'panel' }));
      notifyConnectionChange('error', null);
    }
  }, [handleAuthError, notifyConnectionChange]);

  useEffect(() => {
    loadConnection();
  }, [loadConnection, refreshTrigger]);

  async function handleConnect() {
    setErrorMessage(null);
    setStatus('connecting');
    notifyConnectionChange('connecting', connection);

    try {
      const { authorizeUrl } = await fetchTrelloAuthorizeUrl();
      window.location.assign(authorizeUrl);
    } catch (err) {
      if (await handleAuthError(err)) {
        return;
      }

      const restoredStatus = connection ? 'connected' : 'disconnected';
      setStatus(restoredStatus);
      notifyConnectionChange(restoredStatus, connection);
      setErrorMessage(mapTrelloConnectError(err, { context: 'panel' }));
    }
  }

  async function handleDisconnect() {
    setErrorMessage(null);
    setStatus('disconnecting');
    notifyConnectionChange('disconnecting', connection);

    try {
      await disconnectTrello();
      setConnection(null);
      setStatus('disconnected');
      notifyConnectionChange('disconnected', null);
      onStatusMessage?.({ type: 'success', text: 'Trello account disconnected.' });
    } catch (err) {
      if (await handleAuthError(err)) {
        return;
      }

      const restoredStatus = connection ? 'connected' : 'disconnected';
      setStatus(restoredStatus);
      notifyConnectionChange(restoredStatus, connection);
      setErrorMessage(mapTrelloConnectError(err, { context: 'panel' }));
    }
  }

  const isBusy = status === 'connecting' || status === 'disconnecting';
  const connectedLabel =
    connection?.trelloUsername != null && connection.trelloUsername.trim().length > 0
      ? `@${connection.trelloUsername.trim()}`
      : 'your Trello account';

  const trustNote =
    status === 'connected'
      ? 'Boards, lists, and sync use your connected Trello account.'
      : 'Connect your account for simpler sync, or use advanced manual credentials below.';

  return (
    <section className="section trello-workspace__account" aria-label="Trello account connection">
      <FormCard className="trello-workspace__step trello-workspace__step--account">
        <p className="trello-workspace__step-label" aria-hidden="true">
          Account
        </p>
        <h2 className="trello-workspace__step-title form-card__title" id="trello-step-account">
          Trello account
        </h2>
        {status !== 'loading' && (
          <p className="form-card__hint trello-workspace__trust-note">{trustNote}</p>
        )}

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
