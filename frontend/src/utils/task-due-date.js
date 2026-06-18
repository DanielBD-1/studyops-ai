const ISO_CALENDAR_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * @param {unknown} value
 * @returns {{ year: number, month: number, day: number } | null}
 */
export function parseIsoCalendarDateComponents(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const match = ISO_CALENDAR_DATE_PATTERN.exec(value);
  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

/**
 * @param {number} year
 * @returns {boolean}
 */
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * @param {number} year
 * @param {number} month 1–12
 * @returns {number}
 */
function daysInMonth(year, month) {
  const monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return monthLengths[month - 1];
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidIsoCalendarDate(value) {
  const parts = parseIsoCalendarDateComponents(value);
  if (!parts) {
    return false;
  }

  const { year, month, day } = parts;
  if (year < 1 || year > 9999) {
    return false;
  }
  if (month < 1 || month > 12) {
    return false;
  }

  const maxDay = daysInMonth(year, month);
  return day >= 1 && day <= maxDay;
}

export const TASK_DUE_DATE_MESSAGE =
  'Due date must be a valid calendar date (YYYY-MM-DD)';

/**
 * @returns {string} Browser-local today as YYYY-MM-DD
 */
export function getLocalTodayIsoCalendarDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Compare two strict ISO calendar-date strings.
 *
 * @param {string} left
 * @param {string} right
 * @returns {-1 | 0 | 1}
 */
export function compareIsoCalendarDates(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

/**
 * @param {string} isoDate
 * @param {string} todayIso
 * @returns {string}
 */
function formatDueDateLabel(isoDate, todayIso) {
  const parts = parseIsoCalendarDateComponents(isoDate);
  const todayParts = parseIsoCalendarDateComponents(todayIso);
  if (!parts || !todayParts) {
    return '';
  }

  const includeYear = parts.year !== todayParts.year;
  const date = new Date(parts.year, parts.month - 1, parts.day);
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    ...(includeYear ? { year: 'numeric' } : {}),
  });
  return formatter.format(date);
}

/**
 * @param {{ dueDate?: string | null, status?: string }} task
 * @param {string} [todayIso]
 * @returns {{ label: string, dateTime: string, variant: 'future' | 'today' | 'overdue' | 'completed' } | null}
 */
export function getTaskDueDatePresentation(task, todayIso = getLocalTodayIsoCalendarDate()) {
  if (!task.dueDate) {
    return null;
  }

  const dateLabel = formatDueDateLabel(task.dueDate, todayIso);
  if (!dateLabel) {
    return null;
  }

  if (task.status === 'completed') {
    return {
      label: `Due ${dateLabel}`,
      dateTime: task.dueDate,
      variant: 'completed',
    };
  }

  const comparison = compareIsoCalendarDates(task.dueDate, todayIso);
  if (comparison === 0) {
    return {
      label: 'Due today',
      dateTime: task.dueDate,
      variant: 'today',
    };
  }

  if (comparison < 0) {
    return {
      label: `Overdue · Due ${dateLabel}`,
      dateTime: task.dueDate,
      variant: 'overdue',
    };
  }

  return {
    label: `Due ${dateLabel}`,
    dateTime: task.dueDate,
    variant: 'future',
  };
}
