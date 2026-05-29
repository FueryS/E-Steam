/**
 * storageService.js
 * Optional abstraction layer for data portability.
 * Currently a thin wrapper around SQLite exports/imports.
 *
 * This layer exists so that if the app ever:
 *   - moves to a cloud backend (Supabase, Firebase, etc.)
 *   - adds cross-device sync
 *   - needs local caching on top of remote data
 * … the swap happens here, not scattered across every service.
 *
 * For the current submission scope (local-only SQLite), these functions
 * export/import the raw data as plain JSON — useful for user backup flows
 * or development seed data.
 */

import { getDatabase } from './databaseService';

/**
 * Exports all habits and their logs as a plain JSON-serialisable object.
 * Can be stringified and saved to the device filesystem, clipboard, or
 * shared via the OS share sheet.
 *
 * Shape:
 * {
 *   exportedAt: ISO string,
 *   version: 1,
 *   habits: [{ id, name, created_at }],
 *   habitLogs: [{ id, habit_id, date, completed }]
 * }
 *
 * @param {SQLite.SQLiteDatabase} [db]
 * @returns {Promise<object>} backup payload
 */
export async function backupData(db) {
  const database = db || getDatabase();

  const habits = await database.getAllAsync(
    'SELECT id, name, created_at FROM habits ORDER BY id ASC'
  );

  const habitLogs = await database.getAllAsync(
    'SELECT id, habit_id, date, completed FROM habit_logs ORDER BY habit_id ASC, date ASC'
  );

  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    habits,
    habitLogs,
  };
}

/**
 * Restores habits and logs from a backup payload produced by backupData().
 * Existing data is cleared first — this is a full replacement, not a merge.
 *
 * Safety checks:
 *  - Validates version field before proceeding.
 *  - Wraps everything in a transaction so a mid-import failure doesn't leave
 *    the DB in a half-restored state.
 *
 * @param {object} payload - the object returned by backupData()
 * @param {SQLite.SQLiteDatabase} [db]
 * @returns {Promise<{ habitsRestored: number, logsRestored: number }>}
 */
export async function restoreData(payload, db) {
  const database = db || getDatabase();

  if (!payload || payload.version !== 1) {
    throw new Error('Invalid or incompatible backup format (expected version 1).');
  }

  const { habits = [], habitLogs = [] } = payload;

  await database.withTransactionAsync(async () => {
    // Clear existing data
    await database.runAsync('DELETE FROM habit_logs');
    await database.runAsync('DELETE FROM habits');

    // Restore habits — preserve original IDs so foreign keys stay intact
    for (const h of habits) {
      await database.runAsync(
        'INSERT INTO habits (id, name, created_at) VALUES (?, ?, ?)',
        [h.id, h.name, h.created_at]
      );
    }

    // Restore logs
    for (const log of habitLogs) {
      await database.runAsync(
        'INSERT INTO habit_logs (id, habit_id, date, completed) VALUES (?, ?, ?, ?)',
        [log.id, log.habit_id, log.date, log.completed]
      );
    }
  });

  return {
    habitsRestored: habits.length,
    logsRestored: habitLogs.length,
  };
}
