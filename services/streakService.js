/**
 * streakService.js
 * Calculates habit streaks from the habit_logs table.
 * Pure logic — no UI, no alerts, no hooks.
 *
 * ─── STREAK DEFINITION ────────────────────────────────────────────────────────
 *
 * A streak is the number of consecutive days a habit has been marked DONE,
 * counting backwards from the most recent "valid anchor day".
 *
 * "Valid anchor day" rule (the key design decision):
 *   - If the habit is marked done TODAY → streak counts from today backwards.
 *   - If the habit is NOT done today but WAS done YESTERDAY → streak counts
 *     from yesterday backwards. (Grace: today isn't over yet.)
 *   - If neither today nor yesterday has a completion → streak = 0.
 *
 * Why this definition?
 *   Option A — "breaks on any missed day, period":
 *     Harsh. If a user forgets to open the app today, their streak dies.
 *     This kills motivation and contradicts why people use habit trackers.
 *
 *   Option B — "grace period of N days":
 *     Too lenient. A 3-day grace means you can skip 2 days and still claim
 *     a "daily" habit streak. That's dishonest.
 *
 *   Option C (chosen) — "today or yesterday is the anchor":
 *     Balanced. Today isn't over; the user still has time to complete the
 *     habit. But if they also skipped yesterday, the streak is gone — no
 *     multi-day free pass. One day of patience, zero days of dishonesty.
 *
 * What happens when the app is first opened in 3 days?
 *   → streak = 0. Neither today nor yesterday shows a completion. The
 *     user sees a clear "0" and knows their streak broke, with today visible
 *     as an opportunity to start fresh.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { getDatabase } from './databaseService';
import { getTodayDate, getYesterdayDate, subtractDays } from './dateService';

/**
 * Returns whether a habit was completed on a specific date.
 * Used internally and by historyService.
 * @param {number} habitId
 * @param {string} date - YYYY-MM-DD
 * @param {SQLite.SQLiteDatabase} [db]
 * @returns {Promise<boolean>}
 */
export async function hasCompletedOnDate(habitId, date, db) {
  const database = db || getDatabase();

  const row = await database.getFirstAsync(
    `SELECT id FROM habit_logs
     WHERE habit_id = ? AND date = ? AND completed = 1`,
    [habitId, date]
  );

  return row !== null;
}

/**
 * Calculates the current streak for a single habit.
 *
 * Algorithm:
 *  1. Determine the anchor day (today if done, yesterday if not, else 0).
 *  2. Walk backwards day by day from the anchor.
 *  3. Stop at the first day that has no completion.
 *  4. Return the count of consecutive completed days found.
 *
 * This is O(streak_length) DB reads. For typical streaks (1–365 days) this
 * is fast enough on mobile SQLite. If streaks grew into thousands of days,
 * a SQL window-function approach would be faster — see habitService notes.
 *
 * @param {number} habitId
 * @param {SQLite.SQLiteDatabase} [db]
 * @returns {Promise<number>} current streak count (0 or more)
 */
export async function calculateHabitStreak(habitId, db) {
  const database = db || getDatabase();
  const today = getTodayDate();
  const yesterday = getYesterdayDate();

  // Step 1: determine anchor
  const doneToday = await hasCompletedOnDate(habitId, today, database);
  const doneYesterday = await hasCompletedOnDate(habitId, yesterday, database);

  let anchor;
  if (doneToday) {
    anchor = today;
  } else if (doneYesterday) {
    anchor = yesterday;
  } else {
    // Neither today nor yesterday done → streak is broken
    return 0;
  }

  // Step 2–4: walk backwards from anchor
  let streak = 0;
  let cursor = anchor;

  while (true) {
    const done = await hasCompletedOnDate(habitId, cursor, database);
    if (!done) break;
    streak += 1;
    cursor = subtractDays(cursor, 1);
  }

  return streak;
}

/**
 * Calculates streaks for multiple habits in one call.
 * Returns a map of habitId → streak count.
 * Used by the Habit List screen to load all streaks efficiently.
 *
 * Runs habit streak calculations sequentially (not in parallel) to avoid
 * overwhelming SQLite with concurrent reads on lower-end Android devices.
 *
 * @param {Array<{id: number}>} habits - array of habit objects (only id needed)
 * @param {SQLite.SQLiteDatabase} [db]
 * @returns {Promise<Object.<number, number>>} e.g. { 1: 5, 2: 0, 3: 12 }
 */
export async function calculateMultipleHabitStreaks(habits, db) {
  const database = db || getDatabase();
  const streakMap = {};

  for (const habit of habits) {
    streakMap[habit.id] = await calculateHabitStreak(habit.id, database);
  }

  return streakMap;
}
