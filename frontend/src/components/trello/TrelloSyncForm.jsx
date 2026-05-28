import Button from '../ui/Button.jsx';
import FormCard from '../ui/FormCard.jsx';
import Input from '../ui/Input.jsx';

/**
 * @param {{
 *   apiKey: string,
 *   token: string,
 *   listId: string,
 *   onApiKeyChange: (value: string) => void,
 *   onTokenChange: (value: string) => void,
 *   onListIdChange: (value: string) => void,
 *   onClearCredentials: () => void,
 *   disabled?: boolean,
 * }} props
 */
export default function TrelloSyncForm({
  apiKey,
  token,
  listId,
  onApiKeyChange,
  onTokenChange,
  onListIdChange,
  onClearCredentials,
  disabled = false,
}) {
  return (
    <FormCard>
      <h2 className="form-card__title">Trello credentials</h2>
      <p className="form-card__hint">
        Credentials are used only for this sync request and are not saved.
      </p>
      <div className="trello-sync__fields">
        <TrelloSyncFormFields
          apiKey={apiKey}
          token={token}
          listId={listId}
          onApiKeyChange={onApiKeyChange}
          onTokenChange={onTokenChange}
          onListIdChange={onListIdChange}
          disabled={disabled}
        />
      </div>
      <div className="trello-sync__actions">
        <Button type="button" variant="secondary" onClick={onClearCredentials} disabled={disabled}>
          Clear credentials
        </Button>
      </div>
    </FormCard>
  );
}

/**
 * @param {{
 *   apiKey: string,
 *   token: string,
 *   listId: string,
 *   onApiKeyChange: (value: string) => void,
 *   onTokenChange: (value: string) => void,
 *   onListIdChange: (value: string) => void,
 *   disabled?: boolean,
 * }} props
 */
export function TrelloSyncFormFields({
  apiKey,
  token,
  listId,
  onApiKeyChange,
  onTokenChange,
  onListIdChange,
  disabled = false,
}) {
  return (
    <>
      <Input
        id="trello-api-key"
        label="Trello API key"
        type="password"
        autoComplete="off"
        value={apiKey}
        onChange={onApiKeyChange}
        required
        disabled={disabled}
      />
      <Input
        id="trello-token"
        label="Trello token"
        type="password"
        autoComplete="off"
        value={token}
        onChange={onTokenChange}
        required
        disabled={disabled}
      />
      <Input
        id="trello-list-id"
        label="Trello list ID"
        type="text"
        autoComplete="off"
        value={listId}
        onChange={onListIdChange}
        required
        disabled={disabled}
      />
    </>
  );
}
