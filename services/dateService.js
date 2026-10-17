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
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  if (typeof date === "string") {
    // Already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Full ISO timestamp (e.g. from habits.created_at)
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }

  const d = new Date(date + "T00:00:00");
  if (isNaN(d.getTime())) throw new Error("Invalid date: " + date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
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
  const d = new Date(formatDate(dateStr) + "T00:00:00");
  d.setDate(d.getDate() - days);
  return formatDate(d);
}

/**
 * Adds a number of days to a YYYY-MM-DD string and returns a new YYYY-MM-DD string.
 * @param {string} dateStr - YYYY-MM-DD
 * @param {number} days - number of days to add
 * @returns {string} YYYY-MM-DD
 */
export function addDays(dateStr, days) {
  const d = new Date(formatDate(dateStr) + "T00:00:00");
  d.setDate(d.getDate() + days);
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
 * Calculates the number of days between two dates inclusive.
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {number}
 */
export function countDaysBetween(startDate, endDate) {
  const start = new Date(formatDate(startDate) + "T00:00:00");
  const end = new Date(formatDate(endDate) + "T00:00:00");
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays) + 1;
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
 * Generates an array of all calendar dates between startDate and endDate (inclusive).
 * Order: newest first (today/endDate down to startDate).
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} [endDate] - YYYY-MM-DD, defaults to getTodayDate()
 * @returns {string[]} array of YYYY-MM-DD strings (newest to oldest)
 */
export function generateDateRangeBetween(startDate, endDate = getTodayDate()) {
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start > end) {
    return [end];
  }

  const dates = [];
  let cursor = end;
  while (cursor >= start) {
    dates.push(cursor);
    cursor = subtractDays(cursor, 1);
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

  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";

  // Short weekday + day number for older dates
  const d = new Date(dateStr + "T00:00:00");
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const dayNum = d.getDate();
  return `${weekday} ${dayNum}`;
}
