/**
 * TestDashboard.js
 * Internal dev screen for validating all service layer functions.
 * Drop this into your screens/ folder and add it to your navigator temporarily.
 *
 * Usage in App.js (swap out when done):
 *   import TestDashboard from './screens/TestDashboard';
 *   export default function App() { return <TestDashboard />; }
 *
 * No fancy styling — this is a dev tool, not a product screen.
 */

import React, { useState, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

// ── Services ──────────────────────────────────────────────────────────────────
import {
  initializeDatabase,
  dropTables,
  createTables,
  resetDatabase,
  getDatabase,
} from "../services/databaseService";

import {
  createHabit,
  getAllHabits,
  deleteHabit,
} from "../services/habitService";

import {
  markHabitCompleted,
  unmarkHabitCompleted,
  toggleHabitCompletion,
  getHabitLogByDate,
} from "../services/habitLogService";

import { calculateHabitStreak } from "../services/streakService";

import { getHabitHistory, getLast7DaysHistory } from "../services/historyService";

import {
  getTodayDate,
  getYesterdayDate,
  subtractDays,
} from "../services/dateService";

// ─────────────────────────────────────────────────────────────────────────────
// Reusable primitives
// ─────────────────────────────────────────────────────────────────────────────

/** Simple labelled button — one style throughout the whole dashboard */
function Btn({ label, onPress, color = "#2563eb" }) {
  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.btnText}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Labelled text input */
function Input({ label, value, onChangeText, placeholder }) {
  return (
    <View style={styles.inputWrap}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? label}
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

/** Section card */
function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function TestDashboardServiceLevel() {
  // ── Shared debug log ───────────────────────────────────────────────────────
  const [log, setLog] = useState("// Output will appear here");
  const logScrollRef = useRef(null);

  function out(label, result) {
    const ts = new Date().toLocaleTimeString();
    const body =
      result === undefined ? "(void)" : JSON.stringify(result, null, 2);
    setLog(`[${ts}] ${label}\n${body}`);
    // Scroll debug pane to top so the latest result is immediately visible
    setTimeout(
      () => logScrollRef.current?.scrollTo({ y: 0, animated: true }),
      50,
    );
  }

  function err(label, error) {
    const ts = new Date().toLocaleTimeString();
    setLog(`[${ts}] ❌ ${label}\n${error?.message ?? String(error)}`);
  }

  /** Wraps any async test call with unified error handling */
  async function run(label, fn) {
    try {
      const result = await fn();
      out(label, result);
    } catch (e) {
      err(label, e);
    }
  }

  // ── Section A: Database ────────────────────────────────────────────────────
  const [dbReady, setDbReady] = useState(false);

  async function handleInitDb() {
    try {
      await initializeDatabase();
      setDbReady(true);
      out("initializeDatabase()", {
        status: "ok",
        message: "DB open, tables created",
      });
    } catch (e) {
      err("initializeDatabase()", e);
    }
  }

  async function handleResetDb() {
    await run("resetDatabase() — drop + recreate", async () => {
      await resetDatabase();
      setDbReady(true);
      return { status: "ok", message: "All tables dropped and recreated" };
    });
  }

  // ── Section B: Habit CRUD ──────────────────────────────────────────────────
  const [habitName, setHabitName] = useState("");
  const [deleteId, setDeleteId] = useState("");

  // ── Section C: Toggle / Status ────────────────────────────────────────────
  const [toggleHabitId, setToggleHabitId] = useState("");
  const [toggleDate, setToggleDate] = useState(getTodayDate());

  // ── Section D: Streak ─────────────────────────────────────────────────────
  const [streakHabitId, setStreakHabitId] = useState("");

  async function handleSeedPerfectStreak() {
    const id = parseInt(streakHabitId, 10);
    if (!id) {
      err("Seed 7-Day Streak", new Error("Enter a valid Habit ID first"));
      return;
    }
    await run("Seed 7-Day Perfect Streak", async () => {
      const today = getTodayDate();
      const pastDate = subtractDays(today, 6);
      const db = getDatabase();
      await db.runAsync(
        "UPDATE habits SET created_at = ? WHERE id = ? AND created_at > ?",
        [new Date(pastDate + "T00:00:00").toISOString(), id, pastDate]
      );
      for (let i = 0; i < 7; i++) {
        await markHabitCompleted(id, subtractDays(today, i));
      }
      return {
        seeded: 7,
        habitId: id,
        from: pastDate,
        to: today,
      };
    });
  }

  async function handleSeed30DayStreak() {
    const id = parseInt(streakHabitId, 10);
    if (!id) {
      err("Seed 30-Day Streak", new Error("Enter a valid Habit ID first"));
      return;
    }
    await run("Seed 30-Day Perfect Streak", async () => {
      const today = getTodayDate();
      const pastDate = subtractDays(today, 29);
      const db = getDatabase();
      await db.runAsync(
        "UPDATE habits SET created_at = ? WHERE id = ? AND created_at > ?",
        [new Date(pastDate + "T00:00:00").toISOString(), id, pastDate]
      );
      for (let i = 0; i < 30; i++) {
        await markHabitCompleted(id, subtractDays(today, i));
      }
      return {
        seeded: 30,
        habitId: id,
        from: pastDate,
        to: today,
      };
    });
  }

  async function handleBreakYesterday() {
    const id = parseInt(streakHabitId, 10);
    if (!id) {
      err("Break Yesterday", new Error("Enter a valid Habit ID first"));
      return;
    }
    await run("Break Yesterday (unmark)", async () => {
      await unmarkHabitCompleted(id, getYesterdayDate());
      return { habitId: id, date: getYesterdayDate(), action: "unmarked" };
    });
  }

  // ── Section E: History ────────────────────────────────────────────────────
  const [historyHabitId, setHistoryHabitId] = useState("");

  // ── Utility: Seed dummy habits ────────────────────────────────────────────
  async function handleSeedDummyHabits() {
    await run("Seed Dummy Habits", async () => {
      const names = ["Drink Water", "Read", "Exercise"];
      const created = [];
      for (const name of names) {
        const h = await createHabit(name);
        created.push(h);
      }
      return created;
    });
  }

  async function handleClearLogs() {
    await run("Clear All Habit Logs", async () => {
      const db = getDatabase();
      await db.runAsync("DELETE FROM habit_logs");
      return { status: "ok", message: "habit_logs table cleared" };
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <Text style={styles.header}>Service Test Dashboard</Text>
        <Text style={styles.subheader}>
          DB: {dbReady ? "Ready" : "Not initialised"}
        </Text>

        {/* ══ A: DATABASE ═══════════════════════════════════════════════════ */}
        <Section title="A — Database">
          <Btn label="Initialize Database" onPress={handleInitDb} />
          <Btn
            label="Reset Database (drop + recreate)"
            onPress={handleResetDb}
            color="#dc2626"
          />
        </Section>

        {/* ══ B: HABIT CRUD ════════════════════════════════════════════════ */}
        <Section title="B — Habit CRUD">
          <Input
            label="Habit Name"
            value={habitName}
            onChangeText={setHabitName}
            placeholder="e.g. Drink Water"
          />
          <Btn
            label="Create Habit"
            onPress={() =>
              run(`createHabit("${habitName}")`, () => createHabit(habitName))
            }
          />
          <Btn
            label="Load All Habits"
            onPress={() => run("getAllHabits()", getAllHabits)}
          />

          <View style={styles.divider} />

          <Input
            label="Habit ID (for delete)"
            value={deleteId}
            onChangeText={setDeleteId}
            placeholder="e.g. 1"
          />
          <Btn
            label="Delete Habit"
            color="#dc2626"
            onPress={() =>
              run(`deleteHabit(${deleteId})`, () =>
                deleteHabit(parseInt(deleteId, 10)),
              )
            }
          />
        </Section>

        {/* ══ C: TOGGLE / STATUS ════════════════════════════════════════════ */}
        <Section title="C — Habit Toggle & Status">
          <Input
            label="Habit ID"
            value={toggleHabitId}
            onChangeText={setToggleHabitId}
            placeholder="e.g. 1"
          />
          <Input
            label="Date (YYYY-MM-DD)"
            value={toggleDate}
            onChangeText={setToggleDate}
            placeholder={getTodayDate()}
          />
          <View style={styles.row}>
            <Btn
              label="Mark Done"
              onPress={() =>
                run(`markHabitCompleted(${toggleHabitId}, ${toggleDate})`, () =>
                  markHabitCompleted(parseInt(toggleHabitId, 10), toggleDate),
                )
              }
            />
            <Btn
              label="Unmark"
              color="#6b7280"
              onPress={() =>
                run(
                  `unmarkHabitCompleted(${toggleHabitId}, ${toggleDate})`,
                  () =>
                    unmarkHabitCompleted(
                      parseInt(toggleHabitId, 10),
                      toggleDate,
                    ),
                )
              }
            />
          </View>
          <View style={styles.row}>
            <Btn
              label="Toggle"
              color="#7c3aed"
              onPress={() =>
                run(
                  `toggleHabitCompletion(${toggleHabitId}, ${toggleDate})`,
                  () =>
                    toggleHabitCompletion(
                      parseInt(toggleHabitId, 10),
                      toggleDate,
                    ),
                )
              }
            />
            <Btn
              label="Get Status"
              color="#0891b2"
              onPress={() =>
                run(`getHabitLogByDate(${toggleHabitId}, ${toggleDate})`, () =>
                  getHabitLogByDate(parseInt(toggleHabitId, 10), toggleDate),
                )
              }
            />
          </View>
        </Section>

        {/* ══ D: STREAK ════════════════════════════════════════════════════ */}
        <Section title="D — Streak Tests">
          <Input
            label="Habit ID"
            value={streakHabitId}
            onChangeText={setStreakHabitId}
            placeholder="e.g. 1"
          />
          <Btn
            label="Calculate Streak"
            onPress={() =>
              run(`calculateHabitStreak(${streakHabitId})`, async () => {
                const streak = await calculateHabitStreak(
                  parseInt(streakHabitId, 10),
                );
                return {
                  habitId: parseInt(streakHabitId, 10),
                  currentStreak: streak,
                };
              })
            }
          />
          <Btn
            label="Seed 7-Day Perfect Streak"
            color="#16a34a"
            onPress={handleSeedPerfectStreak}
          />
          <Btn
            label="Seed 30-Day Perfect Streak"
            color="#059669"
            onPress={handleSeed30DayStreak}
          />
          <Btn
            label="Break Yesterday"
            color="#ea580c"
            onPress={handleBreakYesterday}
          />
        </Section>

        {/* ══ E: HISTORY ═══════════════════════════════════════════════════ */}
        <Section title="E — Lifetime History">
          <Input
            label="Habit ID"
            value={historyHabitId}
            onChangeText={setHistoryHabitId}
            placeholder="e.g. 1"
          />
          <Btn
            label="Load Habit History"
            onPress={() =>
              run(`getHabitHistory(${historyHabitId})`, () =>
                getHabitHistory(parseInt(historyHabitId, 10)),
              )
            }
          />
        </Section>

        {/* ══ UTILITY ══════════════════════════════════════════════════════ */}
        <Section title="Quick Utilities">
          <Btn
            label="Seed Dummy Habits (Water / Read / Exercise)"
            color="#0891b2"
            onPress={handleSeedDummyHabits}
          />
          <Btn
            label="Clear All Habit Logs"
            color="#9333ea"
            onPress={handleClearLogs}
          />
        </Section>

        {/* ══ F: DEBUG OUTPUT ══════════════════════════════════════════════ */}
        <Section title="F — Debug Output">
          <ScrollView
            ref={logScrollRef}
            style={styles.debugBox}
            nestedScrollEnabled
          >
            <Text style={styles.debugText}>{log}</Text>
          </ScrollView>
          <Btn
            label="Clear Output"
            color="#374151"
            onPress={() => setLog("// Cleared")}
          />
        </Section>

        {/* Bottom padding so last section isn't behind keyboard */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles — intentionally minimal, just enough to not look broken
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    paddingVertical: 25,
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: 12,
    gap: 12,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  subheader: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },

  // Section card
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  // Button
  btn: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  btnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },

  // Input
  inputWrap: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#f9fafb",
  },

  // Row layout for paired buttons
  row: {
    flexDirection: "row",
    gap: 8,
  },

  // Horizontal rule between sub-groups
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 2,
  },

  // Debug output box
  debugBox: {
    backgroundColor: "#111827",
    borderRadius: 8,
    padding: 10,
    maxHeight: 1200,
  },
  debugText: {
    color: "#86efac",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18,
  },
});
