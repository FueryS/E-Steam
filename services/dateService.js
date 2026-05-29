/**
 * dateService.js
 * Pure date utility functions — no React, no UI, no side effects.
 * All dates are represented as YYYY-MM-DD strings for SQLite compatibility.
 */

/**
 * Returns today's date as a YYYY-MM-DD string.
 * Uses local time (not UTC) so the "day" aligns with what the user sees on screen.
 * @returns {string} e.g. "2025-05-29"
 */
export function getTodayDate() {
  const now = new Date();
  return formatDate(now);
}

/**
 * Returns yesterday's date as a YYYY-MM-DD string.
 * @returns {string} e.g. "2025-05-28"
 */
export function getYesterdayDate() {
  return subtractDays(getTodayDate(), 1);
}

/**
 * Formats a Date object or date string into YYYY-MM-DD.
 * Accepts both Date objects and existing YYYY-MM-DD strings (pass-through).
 * @param {Date|string} date
 * @returns {string} YYYY-MM-DD
 */
export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date + 'T00:00:00');
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Subtracts a number of days from a YYYY-MM-DD string and returns a new YYYY-MM-DD string.
 * Uses local midnight to avoid DST edge cases shifting the date.
 * @param {string} dateStr - YYYY-MM-DD
 * @param {number} days - number of days to subtract
 * @returns {string} YYYY-MM-DD
 */
export function subtractDays(dateStr, days) {
  // Append T00:00:00 so JS parses as local time, not UTC midnight
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - days);
  return formatDate(d);
}

/**
 * Checks whether two YYYY-MM-DD strings represent the same calendar day.
 * @param {string} date1 - YYYY-MM-DD
 * @param {string} date2 - YYYY-MM-DD
 * @returns {boolean}
 */
export function isSameDate(date1, date2) {
  return formatDate(date1) === formatDate(date2);
}

/**
 * Generates an array of the last N calendar dates (inclusive of today),
 * ordered from oldest to newest.
 * e.g. generateDateRange(3) → ["2025-05-27", "2025-05-28", "2025-05-29"]
 * @param {number} days - how many days back to include (including today)
 * @returns {string[]} array of YYYY-MM-DD strings, oldest first
 */
export function generateDateRange(days) {
  const today = getTodayDate();
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(subtractDays(today, i));
  }
  return dates;
}

/**
 * Returns a human-readable label for a YYYY-MM-DD string.
 * Shows "Today", "Yesterday", or the short weekday+day (e.g. "Mon 26").
 * Used by the History screen to label each day tile.
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {string}
 */
export function getDisplayLabel(dateStr) {
  const today = getTodayDate();
  const yesterday = getYesterdayDate();

  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';

  // Short weekday + day number for older dates
  const d = new Date(dateStr + 'T00:00:00');
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = d.getDate();
  return `${weekday} ${dayNum}`;
}
