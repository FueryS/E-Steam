/**
 * habitLogService.js
 * Manages the `habit_logs` table — marking habits done/undone and querying status.
 * Pure data layer — no UI, no alerts, no hooks.
 *
 * Key design decision:
 *   A row in habit_logs with completed = 1 means "done on this date".
 *   A row with completed = 0 means "explicitly marked not done" (future use).
 *   No row at all means "no data / app not opened that day".
 *   This distinction matters for streak calculation — see streakService.js.
 */

import { getDatabase } from "./databaseService";
import { getTodayDate, formatDate } from "./dateService";

/**
 * Marks a habit as completed on a given date.
 * Uses INSERT OR REPLACE to handle re-marking an already-marked day safely.
 * @param {number} habitId
 * @param {string} [date] - YYYY-MM-DD, defaults to today
 * @param {SQLite.SQLiteDatabase} [db]
 * @returns {Promise<void>}
 */
export async function markHabitCompleted(habitId, date, db) {
  const database = db || getDatabase();
  const targetDate = date || getTodayDate();

  await database.runAsync(
    `INSERT INTO habit_logs (habit_id, date, completed)
     VALUES (?, ?, 1)
     ON CONFLICT(habit_id, date) DO UPDATE SET completed = 1`,
    [habitId, formatDate(targetDate)],
  );
}

/**
 * Marks a habit as NOT completed on a given date.
 * This removes the completion (sets completed = 0) but keeps the row,
 * so streak logic can distinguish "missed" from "no data".
 *
 * Note: for this app we simply delete the row on unmark, treating it as
 * "no data". This keeps streak math clean — absence = not done.
 * @param {number} habitId
 * @param {string} [date] - YYYY-MM-DD, defaults to today
 * @param {SQLite.SQLiteDatabase} [db]
 * @returns {Promise<void>}
 */
export async function unmarkHabitCompleted(habitId, date, db) {
  const database = db || getDatabase();
  const targetDate = date || getTodayDate();

  await database.runAsync(
    "DELETE FROM habit_logs WHERE habit_id = ? AND date = ?",
    [habitId, formatDate(targetDate)],
  );
}

/**
 * Reads the current completion status for a habit on a given date,
 * then flips it: done → undone, undone → done.
 * Returns the new status (true = now completed, false = now uncompleted).
 * @param {number} habitId
 * @param {string} [date] - YYYY-MM-DD, defaults to today
 * @param {SQLite.SQLiteDatabase} [db]
 * @returns {Promise<boolean>} new completed state
 */
export async function toggleHabitCompletion(habitId, date, db) {
  const database = db || getDatabase();
  const targetDate = date || getTodayDate();

  const current = await getHabitLogByDate(habitId, targetDate, database);
  const isCurrentlyDone = current !== null && current.completed === 1;

  if (isCurrentlyDone) {
    await unmarkHabitCompleted(habitId, targetDate, database);
    return false;
  } else {
    await markHabitCompleted(habitId, targetDate, database);
    return true;
  }
}

/**
 * Returns the log entry for a habit on a specific date, or null if no entry exists.
 * @param {number} habitId
 * @param {string} date - YYYY-MM-DD
 * @param {SQLite.SQLiteDatabase} [db]
 * @returns {Promise<{id: number, habit_id: number, date: string, completed: number}|null>}
 */
export async function getHabitLogByDate(habitId, date, db) {
  const database = db || getDatabase();

  const row = await database.getFirstAsync(
    "SELECT id, habit_id, date, completed FROM habit_logs WHERE habit_id = ? AND date = ?",
    [habitId, formatDate(date)],
  );

  return row ?? null;
}

/**
 * Returns ALL log entries for a habit, ordered by date descending (most recent first).
 * Used by streak and history calculations.
 * @param {number} habitId
 * @param {SQLite.SQLiteDatabase} [db]
 * @returns {Promise<Array<{id: number, habit_id: number, date: string, completed: number}>>}
 */
export async function getHabitLogs(habitId, db) {
  const database = db || getDatabase();

  const rows = await database.getAllAsync(
    `SELECT id, habit_id, date, completed
     FROM habit_logs
     WHERE habit_id = ?
     ORDER BY date DESC`,
    [habitId],
  );

  return rows;
}

/**
 * Returns whether today's habit is marked completed.
 * Convenience wrapper used by the Habit List screen.
 * @param {number} habitId
 * @param {SQLite.SQLiteDatabase} [db]
 * @returns {Promise<boolean>}
 */
export async function getTodayHabitStatus(habitId, db) {
  const database = db || getDatabase();
  const today = getTodayDate();

  const row = await getHabitLogByDate(habitId, today, database);
  return row !== null && row.completed === 1;
}
