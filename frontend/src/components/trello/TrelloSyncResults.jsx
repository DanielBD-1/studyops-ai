import FormCard from '../ui/FormCard.jsx';
import {
  buildTrelloSyncSummaryText,
  mapTrelloSyncResultsForDisplay,
} from '../../utils/trello-sync-results.js';

/**
 * @param {{
 *   summary: import('../../services/trello.service.js').TrelloSyncSummary | null,
 *   results: import('../../services/trello.service.js').TrelloSyncResult[] | null,
 *   taskTitleById: Map<string, { title: string }>,
 * }} props
 */
export default function TrelloSyncResults({ summary, results, taskTitleById }) {
  if (!summary || !results) {
    return null;
  }

  const rows = mapTrelloSyncResultsForDisplay(results, taskTitleById);

  return (
    <FormCard className="trello-workspace__step trello-workspace__step--results">
      <p className="trello-workspace__step-label" aria-hidden="true">
        Step 5
      </p>
      <h2 className="trello-workspace__step-title form-card__title" id="trello-step-results">
        Sync results
      </h2>
      <div className="trello-sync-results__summary-band" role="status">
        <p className="trello-sync-results__summary">{buildTrelloSyncSummaryText(summary)}</p>
        <ul className="trello-sync-results__stats" aria-label="Sync summary counts">
          <li className="trello-sync-results__stat trello-sync-results__stat--success">
            <span className="trello-sync-results__stat-value">{summary.success}</span>
            <span className="trello-sync-results__stat-label">Succeeded</span>
          </li>
          <li className="trello-sync-results__stat trello-sync-results__stat--skipped">
            <span className="trello-sync-results__stat-value">{summary.skipped}</span>
            <span className="trello-sync-results__stat-label">Skipped</span>
          </li>
          <li className="trello-sync-results__stat trello-sync-results__stat--failed">
            <span className="trello-sync-results__stat-value">{summary.failed}</span>
            <span className="trello-sync-results__stat-label">Failed</span>
          </li>
        </ul>
      </div>
      <ul className="trello-sync-results">
        {rows.map((row) => (
          <li
            key={row.taskId}
            className={`trello-sync-results__item trello-sync-results__item--${row.status}`}
          >
            <div className="trello-sync-results__header">
              <p className="trello-sync-results__title">{row.title}</p>
              <span
                className={`trello-sync-results__status trello-sync-results__status--${row.status}`}
              >
                {row.statusLabel}
              </span>
            </div>
            {row.status === 'success' && row.trelloCardId && (
              <p className="trello-sync-results__detail">Trello card ID: {row.trelloCardId}</p>
            )}
            {row.error && (
              <p className="trello-sync-results__detail trello-sync-results__detail--error" role="alert">
                {row.error}
              </p>
            )}
          </li>
        ))}
      </ul>
    </FormCard>
  );
}
