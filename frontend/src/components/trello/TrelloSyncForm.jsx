import Button from '../ui/Button.jsx';
import FormCard from '../ui/FormCard.jsx';
import Input from '../ui/Input.jsx';

/**
 * @param {{
 *   apiKey: string,
 *   token: string,
 *   onApiKeyChange: (value: string) => void,
 *   onTokenChange: (value: string) => void,
 *   onClearCredentials: () => void,
 *   disabled?: boolean,
 * }} props
 */
export default function TrelloSyncForm({
  apiKey,
  token,
  onApiKeyChange,
  onTokenChange,
  onClearCredentials,
  disabled = false,
}) {
  return (
    <FormCard className="trello-workspace__step trello-workspace__step--credentials">
      <p className="trello-workspace__step-label" aria-hidden="true">
        Step 1
      </p>
      <h2 className="form-card__title" id="trello-step-credentials">
        Connect to Trello
      </h2>
      <p className="form-card__hint trello-workspace__trust-note">
        Enter your API key and token below. They are used only for this session and are cleared
        after sync — StudyOps never stores them.
      </p>
      <div className="trello-sync__fields">
        <TrelloSyncFormFields
          apiKey={apiKey}
          token={token}
          onApiKeyChange={onApiKeyChange}
          onTokenChange={onTokenChange}
          disabled={disabled}
        />
      </div>
      <div className="trello-sync__actions trello-sync__actions--credentials">
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
 *   onApiKeyChange: (value: string) => void,
 *   onTokenChange: (value: string) => void,
 *   disabled?: boolean,
 * }} props
 */
export function TrelloSyncFormFields({
  apiKey,
  token,
  onApiKeyChange,
  onTokenChange,
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
    </>
  );
}
