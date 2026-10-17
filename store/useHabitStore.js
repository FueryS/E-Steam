/**
 * useHabitStore.js
 * Central Zustand store for the habit tracker.
 *
 * Architecture position:
 *   UI screens → useHabitStore → services → SQLite
 *
 * Rules enforced here:
 *    Calls services only (no raw SQL)
 *    Owns all loading flags and error state
 *    Keeps streak/status updates surgical (no full reload on toggle)
 *    No navigation
 *    No Alert / UI code
 *    No Zustand persist (SQLite is the source of truth)
 */

import { create } from "zustand";

// ── Service imports ───────────────────────────────────────────────────────────
import { initializeDatabase } from "../services/databaseService";
import {
  getAllHabits,
  createHabit,
  deleteHabit,
} from "../services/habitService";
import {
  toggleHabitCompletion,
  getTodayHabitStatus,
} from "../services/habitLogService";
import {
  calculateHabitStreak,
  calculateMultipleHabitStreaks,
} from "../services/streakService";
import { getHabitHistory, getLast7DaysHistory } from "../services/historyService";

// ── Error helper ──────────────────────────────────────────────────────────────
/**
 * Extracts a readable string from anything thrown in a catch block.
 * Services throw Error objects; this handles both that and unexpected throws.
 */
function getErrorMessage(error) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useHabitStore = create((set, get) => ({
  // ── State ────────────────────────────────────────────────────────────────

  /** Raw habit rows from SQLite: [{ id, name, created_at }] */
  habits: [],

  /** Map of habitId → current streak number: { 1: 5, 2: 0 } */
  streaks: {},

  /** Map of habitId → today's completion boolean: { 1: true, 2: false } */
  todayStatus: {},

  /** The habit object currently viewed on the History screen */
  selectedHabit: null,

  /** Full history for selectedHabit (creation date to today): [{ date, completed, label }] */
  selectedHabitHistory: [],

  // Loading flags — each action owns exactly one flag
  isInitializing: false,
  isLoadingHabits: false,
  isAddingHabit: false,
  isTogglingHabit: false,
  isDeletingHabit: false,
  isLoadingHistory: false,

  /** Readable error string, or null when no error is present */
  error: null,

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * initializeApp()
   * Opens SQLite and loads the first habit list.
   * Call once from the root component (App.js useEffect).
   * Nothing else should be called before this resolves.
   */
  initializeApp: async () => {
    set({ isInitializing: true, error: null });
    try {
      await initializeDatabase();
      // loadHabits depends on the DB being open — only safe to call now
      await get().loadHabits();
    } catch (e) {
      set({ error: getErrorMessage(e) });
    } finally {
      set({ isInitializing: false });
    }
  },

  /**
   * loadHabits()
   * Fetches all habits plus their current streaks and today's completion
   * status. Called after init, after add, and on manual refresh.
   *
   * todayStatus uses Promise.all — these are lightweight single-row reads.
   * Streak calculation uses calculateMultipleHabitStreaks which runs them
   * sequentially inside the service (safer for SQLite on low-end devices).
   */
  loadHabits: async () => {
    set({ isLoadingHabits: true, error: null });
    try {
      const habits = await getAllHabits();

      // Streaks — one service call, returns { [habitId]: number }
      const streaks = await calculateMultipleHabitStreaks(habits);

      // Today status — parallel reads, one per habit
      const statusEntries = await Promise.all(
        habits.map(async (habit) => {
          const done = await getTodayHabitStatus(habit.id);
          return [habit.id, done];
        }),
      );
      const todayStatus = Object.fromEntries(statusEntries);

      set({ habits, streaks, todayStatus });
    } catch (e) {
      set({ error: getErrorMessage(e) });
    } finally {
      set({ isLoadingHabits: false });
    }
  },

  /**
   * addHabit(name)
   * Validates name, creates the habit, then reloads the full list so the
   * new habit appears with streak 0 and todayStatus false.
   * Returns the created habit object so the screen can react (e.g. navigate back).
   * Does NOT navigate — that decision belongs to the screen.
   */
  addHabit: async (name) => {
    // Store-level guard: keeps the service call clean
    if (!name || !name.trim()) {
      set({ error: "Habit name cannot be empty." });
      return null;
    }

    set({ isAddingHabit: true, error: null });
    try {
      const created = await createHabit(name.trim());
      // Full reload so streaks/todayStatus maps include the new entry
      await get().loadHabits();
      return created;
    } catch (e) {
      set({ error: getErrorMessage(e) });
      return null;
    } finally {
      set({ isAddingHabit: false });
    }
  },

  /**
   * toggleHabit(habitId)
   * Flips today's done/not-done for one habit, then updates only that
   * habit's streak and todayStatus — no full list reload needed.
   *
   * Immutable spread ensures other habits' values are preserved:
   *   { ...prev.todayStatus, [habitId]: newValue }
   */
  toggleHabit: async (habitId) => {
    set({ isTogglingHabit: true, error: null });
    try {
      // Returns the NEW completion boolean after the flip
      const newDoneStatus = await toggleHabitCompletion(habitId);

      // Recalculate streak for this habit only
      const newStreak = await calculateHabitStreak(habitId);

      set((prev) => ({
        todayStatus: { ...prev.todayStatus, [habitId]: newDoneStatus },
        streaks: { ...prev.streaks, [habitId]: newStreak },
      }));
    } catch (e) {
      set({ error: getErrorMessage(e) });
    } finally {
      set({ isTogglingHabit: false });
    }
  },

  /**
   * deleteHabitById(habitId)
   * Deletes from SQLite, then surgically removes the habit from all three
   * state maps without reloading. Clears history state if the deleted habit
   * was currently selected.
   * Returns true if deleted, false if service reported no row was found.
   */
  deleteHabitById: async (habitId) => {
    set({ isDeletingHabit: true, error: null });
    try {
      const wasDeleted = await deleteHabit(habitId);

      if (wasDeleted) {
        set((prev) => {
          // Remove from streaks map
          const { [habitId]: _s, ...remainingStreaks } = prev.streaks;
          // Remove from todayStatus map
          const { [habitId]: _t, ...remainingStatus } = prev.todayStatus;

          // If this habit is open on the History screen, clear that too
          const isSelected = prev.selectedHabit?.id === habitId;

          return {
            habits: prev.habits.filter((h) => h.id !== habitId),
            streaks: remainingStreaks,
            todayStatus: remainingStatus,
            selectedHabit: isSelected ? null : prev.selectedHabit,
            selectedHabitHistory: isSelected ? [] : prev.selectedHabitHistory,
          };
        });
      }

      return wasDeleted;
    } catch (e) {
      set({ error: getErrorMessage(e) });
      return false;
    } finally {
      set({ isDeletingHabit: false });
    }
  },

  /**
   * selectHabit(habit)
   * Sets the active habit for the History screen.
   * History is loaded separately via loadHabitHistory() so screens control timing.
   */
  selectHabit: (habit) => {
    set({ selectedHabit: habit });
  },

  /**
   * loadHabitHistory(habitId)
   * Fetches the complete history from creation date to today for the selected habit.
   * Expected shape from service: [{ date, completed, label }]
   */
  loadHabitHistory: async (habitId) => {
    set({ isLoadingHistory: true, error: null });
    try {
      const history = await getHabitHistory(habitId);
      set({ selectedHabitHistory: history });
    } catch (e) {
      set({ error: getErrorMessage(e) });
    } finally {
      set({ isLoadingHistory: false });
    }
  },

  /**
   * clearSelectedHabit()
   * Resets History screen state when navigating away.
   * Call in the screen's cleanup (useFocusEffect return / useEffect cleanup).
   */
  clearSelectedHabit: () => {
    set({ selectedHabit: null, selectedHabitHistory: [] });
  },

  /**
   * clearError()
   * Dismisses the current error. Call after showing an error banner/toast
   * so it doesn't re-render on the next state change.
   */
  clearError: () => {
    set({ error: null });
  },
}));
