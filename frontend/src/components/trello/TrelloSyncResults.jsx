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
      <p className="form-card__hint">{buildTrelloSyncSummaryText(summary)}</p>
      <ul className="trello-sync-results">
        {rows.map((row) => (
          <li key={row.taskId} className={`trello-sync-results__item trello-sync-results__item--${row.status}`}>
            <p className="trello-sync-results__title">
              <strong>{row.title}</strong>
              <span className="trello-sync-results__status">{row.statusLabel}</span>
            </p>
            {row.status === 'success' && row.trelloCardId && (
              <p className="trello-sync-results__detail">Trello card ID: {row.trelloCardId}</p>
            )}
            {row.error && (
              <p className="trello-sync-results__detail" role="alert">
                {row.error}
              </p>
            )}
          </li>
        ))}
      </ul>
    </FormCard>
  );
}
