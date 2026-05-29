/**
 * @typedef {{ id: string, name: string }} TrelloNamedItem
 */

/**
 * @typedef {{ value: string, label: string }} TrelloSelectOption
 */

/**
 * Maps backend board/list rows to select options (id + display name only).
 *
 * @param {TrelloNamedItem[]} items
 * @returns {TrelloSelectOption[]}
 */
export function mapTrelloNamedOptions(items) {
  return items.map((item) => ({
    value: item.id,
    label: item.name,
  }));
}
