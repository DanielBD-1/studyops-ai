/**
 * @param {{
 *   status?: 'pending' | 'completed',
 *   deadline?: 'overdue' | 'due_today',
 * }} query
 * @returns {boolean}
 */
export function usesDeadlineAwarePendingOrder(query) {
  if (query.status === 'pending') {
    return true;
  }

  return query.deadline === 'overdue' || query.deadline === 'due_today';
}

/**
 * @param {import('@supabase/postgrest-js').PostgrestFilterBuilder<any, any, any>} builder
 * @param {{
 *   status?: 'pending' | 'completed',
 *   deadline?: 'overdue' | 'due_today',
 * }} query
 */
export function applyTaskListOrdering(builder, query) {
  if (usesDeadlineAwarePendingOrder(query)) {
    return builder
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
      .order('id', { ascending: true });
  }

  return builder.order('created_at', { ascending: false }).order('id', { ascending: true });
}
