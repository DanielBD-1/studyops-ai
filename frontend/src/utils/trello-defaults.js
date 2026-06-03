/**
 * @param {Array<{ id: string }>} boards
 * @param {string | null | undefined} savedBoardId
 * @returns {{ boardId: string, notice: string | null }}
 */
export function resolveSavedBoardPreselect(boards, savedBoardId) {
  if (savedBoardId == null || savedBoardId.trim().length === 0) {
    return { boardId: '', notice: null };
  }

  const match = boards.some((board) => board.id === savedBoardId);
  if (match) {
    return { boardId: savedBoardId, notice: null };
  }

  return {
    boardId: '',
    notice: 'Your saved board is no longer available. Select a board below.',
  };
}

/**
 * @param {Array<{ id: string }>} lists
 * @param {string | null | undefined} savedListId
 * @returns {{ listId: string, notice: string | null }}
 */
export function resolveSavedListPreselect(lists, savedListId) {
  if (savedListId == null || savedListId.trim().length === 0) {
    return { listId: '', notice: null };
  }

  const match = lists.some((list) => list.id === savedListId);
  if (match) {
    return { listId: savedListId, notice: null };
  }

  return {
    listId: '',
    notice: 'Your saved list is no longer on this board. Select a list below.',
  };
}
