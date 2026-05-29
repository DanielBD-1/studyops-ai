import { mapTrelloNamedOptions } from '../../utils/trello-picker.js';
import Button from '../ui/Button.jsx';
import ErrorMessage from '../ui/ErrorMessage.jsx';
import FormCard from '../ui/FormCard.jsx';
import LoadingState from '../ui/LoadingState.jsx';

/**
 * @param {{
 *   boards: import('../../services/trello.service.js').TrelloNamedItem[],
 *   lists: import('../../services/trello.service.js').TrelloNamedItem[],
 *   selectedBoardId: string,
 *   selectedListId: string,
 *   boardsLoading: boolean,
 *   listsLoading: boolean,
 *   boardsAttempted: boolean,
 *   listsAttempted: boolean,
 *   boardsError: string | null,
 *   listsError: string | null,
 *   loadBoardsDisabled: boolean,
 *   onLoadBoards: () => void,
 *   onBoardChange: (boardId: string) => void,
 *   onListChange: (listId: string) => void,
 *   disabled?: boolean,
 * }} props
 */
export default function TrelloBoardListPicker({
  boards,
  lists,
  selectedBoardId,
  selectedListId,
  boardsLoading,
  listsLoading,
  boardsAttempted,
  listsAttempted,
  boardsError,
  listsError,
  loadBoardsDisabled,
  onLoadBoards,
  onBoardChange,
  onListChange,
  disabled = false,
}) {
  const boardOptions = mapTrelloNamedOptions(boards);
  const listOptions = mapTrelloNamedOptions(lists);

  const showEmptyBoards =
    boardsAttempted && !boardsLoading && !boardsError && boards.length === 0;
  const showEmptyLists =
    Boolean(selectedBoardId) &&
    listsAttempted &&
    !listsLoading &&
    !listsError &&
    lists.length === 0;

  return (
    <FormCard>
      <h2 className="form-card__title">Board and list</h2>
      <p className="form-card__hint">
        Load your Trello boards, choose a board, then choose the list where cards will be created.
      </p>

      <div className="trello-picker">
        <div className="trello-picker__load">
          <Button
            type="button"
            variant="secondary"
            onClick={onLoadBoards}
            disabled={disabled || boardsLoading || loadBoardsDisabled}
          >
            {boardsLoading ? 'Loading boards…' : 'Load boards'}
          </Button>
        </div>

        {boardsError && (
          <div className="trello-picker__message">
            <ErrorMessage message={boardsError} />
          </div>
        )}

        {showEmptyBoards && (
          <p className="trello-picker__empty" role="status">
            No open boards found for these credentials.
          </p>
        )}

        {boards.length > 0 && (
          <label htmlFor="trello-board-select" className="field trello-picker__field">
            Board
            <select
              id="trello-board-select"
              className="field__select"
              value={selectedBoardId}
              onChange={(e) => onBoardChange(e.target.value)}
              disabled={disabled || boardsLoading}
            >
              <option value="">Select a board…</option>
              {boardOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {listsLoading && (
          <div className="trello-picker__lists-loading">
            <LoadingState message="Loading lists…" />
          </div>
        )}

        {listsError && (
          <div className="trello-picker__message">
            <ErrorMessage message={listsError} />
          </div>
        )}

        {showEmptyLists && (
          <p className="trello-picker__empty" role="status">
            No open lists found on this board.
          </p>
        )}

        {listOptions.length > 0 && (
          <label htmlFor="trello-list-select" className="field trello-picker__field">
            List
            <select
              id="trello-list-select"
              className="field__select"
              value={selectedListId}
              onChange={(e) => onListChange(e.target.value)}
              disabled={disabled || listsLoading || !selectedBoardId}
            >
              <option value="">Select a list…</option>
              {listOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </FormCard>
  );
}
