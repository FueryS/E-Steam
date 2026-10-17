/**
 * historyService.js
 * Builds the complete history view for a habit from its creation date up to today.
 * Pure logic — no UI, no alerts, no hooks.
 *
 * History starts from when the habit was created (or today if created today).
 * Ghost past days before creation date are never included.
 * Streaks and history can extend indefinitely ("go forever").
 */

import { getDatabase } from './databaseService';
import {
  generateDateRange,
  generateDateRangeBetween,
  getDisplayLabel,
  getTodayDate,
  formatDate,
} from './dateService';
import { hasCompletedOnDate } from './streakService';

/**
 * Generates the last 7 calendar dates, oldest first.
 * Maintained for backwards compatibility.
 * @returns {string[]} array of 7 YYYY-MM-DD strings, oldest → today
 */
export function generatePast7Dates() {
  return generateDateRange(7);
}

/**
 * Takes an array of log rows (from habitLogService.getHabitLogs) and
 * fills in any missing dates from the habit's creation date to today.
 *
 * Days with no log entry are treated as { completed: false } ("Missed").
 * Days before the habit existed are never generated.
 *
 * @param {Array<{date: string, completed: number}>} logs - raw DB rows, any order
 * @param {string} [createdAt] - habit created_at ISO string or YYYY-MM-DD
 * @returns {Array<{date: string, completed: boolean, label: string}>}
 *   Ordered newest (today) → oldest (creation date).
 */
export function fillMissingHistoryDates(logs, createdAt) {
  // Build a lookup map: date string → completed boolean
  const logMap = {};
  let earliestLogDate = null;

  for (const log of logs) {
    const formattedDate = formatDate(log.date);
    logMap[formattedDate] = log.completed === 1;
    if (!earliestLogDate || formattedDate < earliestLogDate) {
      earliestLogDate = formattedDate;
    }
  }

  const today = getTodayDate();
  let startDate = today;

  if (createdAt) {
    startDate = formatDate(createdAt);
  }
  // If seeded logs exist prior to createdAt, respect the earliest log
  if (earliestLogDate && earliestLogDate < startDate) {
    startDate = earliestLogDate;
  }
  // Clamp: never start in the future
  if (startDate > today) {
    startDate = today;
  }

  const dates = generateDateRangeBetween(startDate, today);

  return dates.map((date) => ({
    date,
    completed: logMap[date] ?? false,
    label: getDisplayLabel(date),
  }));
}

/**
 * Fetches the habit's complete history from its creation date to today.
 *
 * Each entry: { date, completed, label }
 *   - date:      YYYY-MM-DD string
 *   - completed: boolean (true = done that day)
 *   - label:     human-readable string ("Today", "Yesterday", "Mon 26", etc.)
 *
 * Ordered newest (Today) down to creation date.
 * No ghost days prior to habit creation date exist.
 *
 * @param {number} habitId
 * @param {SQLite.SQLiteDatabase} [db]
 * @returns {Promise<Array<{date: string, completed: boolean, label: string}>>}
 */
export async function getHabitHistory(habitId, db) {
  const database = db || getDatabase();

  // 1. Fetch habit to get its created_at timestamp
  const habit = await database.getFirstAsync(
    'SELECT id, name, created_at FROM habits WHERE id = ?',
    [habitId]
  );

  const today = getTodayDate();
  let startDate = today;

  if (habit && habit.created_at) {
    startDate = formatDate(habit.created_at);
  }

  // 2. Fetch all logs for this habit
  const rows = await database.getAllAsync(
    `SELECT date, completed FROM habit_logs
     WHERE habit_id = ?
     ORDER BY date DESC`,
    [habitId]
  );

  return fillMissingHistoryDates(rows, startDate);
}

/**
 * Backwards compatibility alias for getHabitHistory.
 * @param {number} habitId
 * @param {SQLite.SQLiteDatabase} [db]
 * @returns {Promise<Array<{date: string, completed: boolean, label: string}>>}
 */
export async function getLast7DaysHistory(habitId, db) {
  return getHabitHistory(habitId, db);
}
