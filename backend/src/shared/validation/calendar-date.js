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
 * Deterministic YYYY-MM-DD validation for years 0001–9999 without implicit UTC parsing.
 *
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

export const ISO_CALENDAR_DATE_MESSAGE =
  'Due date must be a valid calendar date (YYYY-MM-DD)';

/**
 * UTC calendar today as strict YYYY-MM-DD (injectable for tests).
 *
 * @param {Date} [date]
 * @returns {string}
 */
export function getUtcTodayIsoCalendarDate(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add calendar days to a validated YYYY-MM-DD date without timezone/DST behavior.
 *
 * @param {string} isoDate
 * @param {number} days Non-negative whole calendar days to add.
 * @returns {string}
 */
export function addCalendarDaysToIsoDate(isoDate, days) {
  const parts = parseIsoCalendarDateComponents(isoDate);
  if (!parts || !Number.isInteger(days) || days < 0) {
    throw new RangeError('addCalendarDaysToIsoDate requires a valid ISO date and non-negative days');
  }

  let { year, month, day } = parts;

  for (let offset = 0; offset < days; offset += 1) {
    day += 1;
    const maxDay = daysInMonth(year, month);
    if (day > maxDay) {
      day = 1;
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
  }

  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
