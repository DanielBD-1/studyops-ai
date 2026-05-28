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
    <FormCard>
      <h2 className="form-card__title">Sync results</h2>
      <p className="trello-sync-results__summary">{buildTrelloSyncSummaryText(summary)}</p>
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
