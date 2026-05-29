/**
 * habitService.js
 * CRUD operations for the `habits` table.
 * Pure data layer — no UI, no alerts, no hooks.
 *
 * Every function accepts an optional `db` parameter so callers can pass in
 * a specific connection or, more commonly, leave it to getDatabase().
 */

import { getDatabase } from './databaseService';
import { getTodayDate } from './dateService';

/**
 * Creates a new habit and returns the newly inserted row.
 * @param {string} name - habit display name (trimmed before insert)
 * @param {SQLite.SQLiteDatabase} [db]
 * @returns {Promise<{id: number, name: string, created_at: string}>}
 */
export async function createHabit(name, db) {
  const database = db || getDatabase();
  const trimmed = name.trim();

  if (!trimmed) {
    throw new Error('Habit name cannot be empty.');
  }

  const createdAt = new Date().toISOString();

  const result = await database.runAsync(
    'INSERT INTO habits (name, created_at) VALUES (?, ?)',
    [trimmed, createdAt]
  );

  return {
    id: result.lastInsertRowId,
    name: trimmed,
    created_at: createdAt,
  };
}

/**
 * Returns every habit, ordered by creation date ascending (oldest first).
 * This is the list shown on the Habit List screen.
 * @param {SQLite.SQLiteDatabase} [db]
 * @returns {Promise<Array<{id: number, name: string, created_at: string}>>}
 */
export async function getAllHabits(db) {
  const database = db || getDatabase();
  const rows = await database.getAllAsync(
    'SELECT id, name, created_at FROM habits ORDER BY created_at ASC'
  );
  return rows;
}

/**
 * Returns a single habit by its primary key, or null if not found.
 * @param {number} habitId
 * @param {SQLite.SQLiteDatabase} [db]
 * @returns {Promise<{id: number, name: string, created_at: string}|null>}
 */
export async function getHabitById(habitId, db) {
  const database = db || getDatabase();
  const row = await database.getFirstAsync(
    'SELECT id, name, created_at FROM habits WHERE id = ?',
    [habitId]
  );
  return row ?? null;
}

/**
 * Updates the display name of an existing habit.
 * @param {number} habitId
 * @param {string} name - new name (will be trimmed)
 * @param {SQLite.SQLiteDatabase} [db]
 * @returns {Promise<boolean>} true if a row was updated, false if habitId not found
 */
export async function updateHabitName(habitId, name, db) {
  const database = db || getDatabase();
  const trimmed = name.trim();

  if (!trimmed) {
    throw new Error('Habit name cannot be empty.');
  }

  const result = await database.runAsync(
    'UPDATE habits SET name = ? WHERE id = ?',
    [trimmed, habitId]
  );

  return result.changes > 0;
}

/**
 * Permanently deletes a habit and all its log entries.
 * Cascade is handled by the FK constraint defined in databaseService,
 * but we also delete logs explicitly for safety (in case PRAGMA foreign_keys is off).
 * @param {number} habitId
 * @param {SQLite.SQLiteDatabase} [db]
 * @returns {Promise<boolean>} true if the habit existed and was deleted
 */
export async function deleteHabit(habitId, db) {
  const database = db || getDatabase();

  // Explicit log cleanup (belt + suspenders alongside FK cascade)
  await database.runAsync('DELETE FROM habit_logs WHERE habit_id = ?', [habitId]);

  const result = await database.runAsync(
    'DELETE FROM habits WHERE id = ?',
    [habitId]
  );

  return result.changes > 0;
}
