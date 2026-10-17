/**
 * databaseService.js
 * Owns the SQLite connection and schema.
 * All other services receive `db` from here — they never open their own connection.
 *
 *  * Schema design decisions:
 *  - habits.created_at stored as ISO string for portability
 *  - habit_logs uses a UNIQUE constraint on (habit_id, date) so toggling
 *    can safely use INSERT OR REPLACE without producing duplicate rows
 *  - date column is YYYY-MM-DD text — matches dateService output exactly
 */

import * as SQLite from "expo-sqlite";

/** Singleton db reference — module-level so it's shared across the app */
let _db = null;

/**
 * Opens (or reuses) the SQLite database and ensures all tables exist.
 * Call once at app startup (e.g. in App.js useEffect).
 * @returns {Promise<SQLite.SQLiteDatabase>} the open database handle
 */
export async function initializeDatabase() {
  if (_db) return _db;

  _db = await SQLite.openDatabaseAsync("habittracker.adb");

  // WAL mode gives better concurrent read performance on mobile
  await _db.execAsync("PRAGMA journal_mode = WAL;");

  // note: CreateTable is a user defined function
  await createTables(_db);
  return _db;
}

/**
 * Returns the already-opened database handle.
 * Throws if initializeDatabase() hasn't been called yet.
 * Services call this to get `db` without re-opening.
 * @returns {SQLite.SQLiteDatabase}
 */
export function getDatabase() {
  if (!_db) {
    throw new Error(
      "Database not initialised. Call initializeDatabase() before using any service.",
    );
  }
  return _db;
}

/**
 * Creates all tables if they don't already exist.
 * Idempotent — safe to call on every app launch.
 * @param {SQLite.SQLiteDatabase} db
 */
export async function createTables(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habits (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      created_at  TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id    INTEGER NOT NULL,
      date        TEXT    NOT NULL,
      completed   INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      UNIQUE(habit_id, date)
    );
  `);
}

/**
 * Drops all app tables. Useful during development to reset state.
 * NOT exported for production builds — call manually if needed.
 * @param {SQLite.SQLiteDatabase} db
 */
export async function dropTables(db) {
  const target = db || getDatabase();
  await target.execAsync(`
    DROP TABLE IF EXISTS habit_logs;
    DROP TABLE IF EXISTS habits;
  `);
  console.warn("[databaseService] All tables dropped.");
}

/**
 * Convenience: drop then recreate. Hard reset for dev/testing.
 */
export async function resetDatabase() {
  const db = getDatabase();
  await dropTables(db);
  await createTables(db);
}
