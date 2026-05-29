/**
 * historyService.js
 * Builds the 7-day history view for a habit.
 * Pure logic — no UI, no alerts, no hooks.
 *
 * The History screen needs a guaranteed 7-entry array (one per day),
 * ordered oldest → newest, with a "done" boolean on each entry.
 * Days with no log entry are treated as NOT done (absence = missed).
 */

import { getDatabase } from './databaseService';
import { generateDateRange, getDisplayLabel, getTodayDate } from './dateService';
import { hasCompletedOnDate } from './streakService';

/**
 * Generates the last 7 calendar dates, oldest first.
 * Extracted as a standalone export so screens can use it for rendering
 * without needing to fetch data first.
 * @returns {string[]} array of 7 YYYY-MM-DD strings, oldest → today
 */
export function generatePast7Dates() {
  return generateDateRange(7);
}

/**
 * Takes an array of log rows (from habitLogService.getHabitLogs) and
 * fills in any missing dates within the last 7 days with { completed: false }.
 *
 * This is the "fill gaps" step — SQLite only has rows for days the user
 * opened the app, so we must synthesize the missing ones.
 *
 * @param {Array<{date: string, completed: number}>} logs - raw DB rows, any order
 * @returns {Array<{date: string, completed: boolean, label: string}>}
 *   Guaranteed 7 entries, ordered oldest → newest.
 */
export function fillMissingHistoryDates(logs) {
  // Build a lookup map: date string → completed boolean
  const logMap = {};
  for (const log of logs) {
    logMap[log.date] = log.completed === 1;
  }

  const dates = generatePast7Dates();

  return dates.map((date) => ({
    date,
    completed: logMap[date] ?? false,
    label: getDisplayLabel(date),
  }));
}

/**
 * Fetches the habit's completion status for the last 7 days and returns
 * a filled, ordered array ready for the History screen to render.
 *
 * Each entry: { date, completed, label }
 *   - date:      YYYY-MM-DD string
 *   - completed: boolean (true = done that day)
 *   - label:     human-readable string ("Today", "Yesterday", "Mon 26", etc.)
 *
 * @param {number} habitId
 * @param {SQLite.SQLiteDatabase} [db]
 * @returns {Promise<Array<{date: string, completed: boolean, label: string}>>}
 */
export async function getLast7DaysHistory(habitId, db) {
  const database = db || getDatabase();
  const dates = generatePast7Dates();

  // Fetch completion status for each of the 7 dates.
  // We query per-day rather than a bulk SELECT so we reuse the already-tested
  // hasCompletedOnDate logic and keep this layer thin.
  const history = await Promise.all(
    dates.map(async (date) => {
      const completed = await hasCompletedOnDate(habitId, date, database);
      return {
        date,
        completed,
        label: getDisplayLabel(date),
      };
    })
  );

  // Already ordered oldest → newest by generatePast7Dates
  return history;
}
