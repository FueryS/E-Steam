/**
 * TestDashboard.jsx
 * Developer-only screen for testing the full store surface.
 * All interactions go through the Zustand store — no direct service calls.
 *
 * Accessible from AddHabitScreen via the "Dev Menu" ghost button.
 */

import React, { useState, useCallback } from "react";
import { ROUTES } from "../navigation/AppNavigator";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
} from "react-native";

import { useHabitStore } from "../store/useHabitStore";
import { theme } from "../constants/theme";
import ErrorBanner from "../components/ErrorBanner";
import AppButton from "../components/AppButton";

// ── Tiny local helpers ────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return <Text style={devStyles.sectionTitle}>{children}</Text>;
}

function DevButton({ title, onPress, color }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        devStyles.btn,
        { backgroundColor: color ?? theme.colors.primary },
        pressed && devStyles.btnPressed,
      ]}
    >
      <Text style={devStyles.btnText}>{title}</Text>
    </Pressable>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={devStyles.infoRow}>
      <Text style={devStyles.infoLabel}>{label}</Text>
      <Text style={devStyles.infoValue}>{String(value)}</Text>
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TestDashboard({ navigation }) {
  // ── Store ─────────────────────────────────────────────────────────────────
  const habits = useHabitStore((state) => state.habits);
  const streaks = useHabitStore((state) => state.streaks);
  const todayStatus = useHabitStore((state) => state.todayStatus);
  const selectedHabit = useHabitStore((state) => state.selectedHabit);
  const selectedHabitHistory = useHabitStore(
    (state) => state.selectedHabitHistory,
  );

  const loadHabits = useHabitStore((state) => state.loadHabits);
  const addHabit = useHabitStore((state) => state.addHabit);
  const toggleHabit = useHabitStore((state) => state.toggleHabit);
  const deleteHabitById = useHabitStore((state) => state.deleteHabitById);
  const selectHabit = useHabitStore((state) => state.selectHabit);
  const loadHabitHistory = useHabitStore((state) => state.loadHabitHistory);
  const clearSelectedHabit = useHabitStore((state) => state.clearSelectedHabit);
  const error = useHabitStore((state) => state.error);
  const clearError = useHabitStore((state) => state.clearError);

  // ── Local state ───────────────────────────────────────────────────────────
  const [newHabitName, setNewHabitName] = useState("");
  const [showDebug, setShowDebug] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAdd = useCallback(async () => {
    if (!newHabitName.trim()) return;
    await addHabit(newHabitName.trim());
    setNewHabitName("");
  }, [newHabitName, addHabit]);

  const handleHistory = useCallback(
    async (habit) => {
      selectHabit(habit);
      await loadHabitHistory(habit.id);
    },
    [selectHabit, loadHabitHistory],
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={devStyles.safe}>
      <View style={devStyles.scroll}>
        <AppButton
          title="SQL Menu"
          onPress={() => navigation.navigate(ROUTES.DEV_MENU_SERVICE_LEVEL)}
          variant="danger"
        />
      </View>
      <ScrollView
        contentContainerStyle={devStyles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={devStyles.titleRow}>
          <Text style={devStyles.title}>Store Test Dashboard</Text>
          <View style={devStyles.countPill}>
            <Text style={devStyles.countText}>{habits.length} habits</Text>
          </View>
        </View>

        {/* Error banner */}
        <ErrorBanner message={error} onDismiss={clearError} />

        {/* Load */}
        <SectionTitle>Load</SectionTitle>
        <DevButton title="Load Habits" onPress={loadHabits} />

        {/* Add habit */}
        <SectionTitle>Add Habit Through Store</SectionTitle>
        <TextInput
          value={newHabitName}
          onChangeText={setNewHabitName}
          placeholder="Habit name..."
          placeholderTextColor={theme.colors.mutedText}
          style={devStyles.input}
          returnKeyType="done"
          onSubmitEditing={handleAdd}
          autoCapitalize="sentences"
        />
        <DevButton
          title="Add Habit Through Store"
          onPress={handleAdd}
          color={theme.colors.primary}
        />

        {/* Habit rows */}
        <SectionTitle>Habits</SectionTitle>
        {habits.length === 0 ? (
          <Text style={devStyles.emptyNote}>No habits loaded.</Text>
        ) : (
          habits.map((habit) => (
            <View key={habit.id} style={devStyles.habitRow}>
              {/* Habit info */}
              <View style={devStyles.habitInfo}>
                <Text style={devStyles.habitId}>#{habit.id}</Text>
                <Text style={devStyles.habitName} numberOfLines={1}>
                  {habit.name}
                </Text>
              </View>

              {/* Badges */}
              <View style={devStyles.badgeRow}>
                <View
                  style={[
                    devStyles.badge,
                    todayStatus[habit.id]
                      ? devStyles.badgeDone
                      : devStyles.badgePending,
                  ]}
                >
                  <Text style={devStyles.badgeText}>
                    {todayStatus[habit.id] ? "Done" : "Pending"}
                  </Text>
                </View>
                <View style={devStyles.badge}>
                  <Text style={devStyles.badgeText}>
                    {streaks[habit.id] ?? 0}d
                  </Text>
                </View>
              </View>

              {/* Action buttons */}
              <View style={devStyles.rowActions}>
                <Pressable
                  onPress={() => toggleHabit(habit.id)}
                  style={[devStyles.rowBtn, { backgroundColor: "#3B82F6" }]}
                >
                  <Text style={devStyles.rowBtnText}>Toggle</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleHistory(habit)}
                  style={[devStyles.rowBtn, { backgroundColor: "#8B5CF6" }]}
                >
                  <Text style={devStyles.rowBtnText}>History</Text>
                </Pressable>
                <Pressable
                  onPress={() => deleteHabitById(habit.id)}
                  style={[
                    devStyles.rowBtn,
                    { backgroundColor: theme.colors.danger },
                  ]}
                >
                  <Text style={devStyles.rowBtnText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        {/* Selected habit + history */}
        <SectionTitle>Selected Habit</SectionTitle>
        {selectedHabit ? (
          <View style={devStyles.selectedBlock}>
            <InfoRow label="ID" value={selectedHabit.id} />
            <InfoRow label="Name" value={selectedHabit.name} />
            <InfoRow label="Streak" value={streaks[selectedHabit.id] ?? 0} />
            <Text style={devStyles.historyHeader}>
              History ({selectedHabitHistory.length} entries)
            </Text>
            {selectedHabitHistory.map((day) => (
              <View key={day.date} style={devStyles.historyRow}>
                <Text style={devStyles.historyDate}>{day.label}</Text>
                <Text style={devStyles.historyDate}>{day.date}</Text>
                <Text
                  style={[
                    devStyles.historyStatus,
                    day.completed
                      ? devStyles.historyDone
                      : devStyles.historyMissed,
                  ]}
                >
                  {day.completed ? "Done" : "Missed"}
                </Text>
              </View>
            ))}
            <DevButton
              title="Clear Selected Habit"
              onPress={clearSelectedHabit}
              color={theme.colors.warning}
            />
          </View>
        ) : (
          <Text style={devStyles.emptyNote}>No habit selected.</Text>
        )}

        {/* Debug JSON */}
        <SectionTitle>Debug Output</SectionTitle>
        <Pressable
          onPress={() => setShowDebug((v) => !v)}
          style={devStyles.toggleDebugBtn}
        >
          <Text style={devStyles.toggleDebugText}>
            {showDebug ? "Hide raw JSON" : "Show raw JSON"}
          </Text>
        </Pressable>

        {showDebug && (
          <ScrollView
            style={devStyles.jsonBlock}
            contentContainerStyle={devStyles.jsonContent}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            <Text style={devStyles.jsonLabel}>habits</Text>
            <Text style={devStyles.jsonText}>
              {JSON.stringify(habits, null, 2)}
            </Text>
            <Text style={devStyles.jsonLabel}>streaks</Text>
            <Text style={devStyles.jsonText}>
              {JSON.stringify(streaks, null, 2)}
            </Text>
            <Text style={devStyles.jsonLabel}>todayStatus</Text>
            <Text style={devStyles.jsonText}>
              {JSON.stringify(todayStatus, null, 2)}
            </Text>
            <Text style={devStyles.jsonLabel}>selectedHabitHistory</Text>
            <Text style={devStyles.jsonText}>
              {JSON.stringify(selectedHabitHistory, null, 2)}
            </Text>
          </ScrollView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const devStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },

  // Title row
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
  },
  countPill: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    paddingVertical: 3,
    paddingHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  countText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.mutedText,
    fontWeight: theme.fontWeight.medium,
  },

  // Section titles
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.mutedText,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: theme.spacing.sm,
    marginBottom: 2,
  },

  emptyNote: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedText,
    fontStyle: "italic",
  },

  // Input
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    minHeight: 44,
    marginBottom: theme.spacing.xs,
  },

  // Generic dev button
  btn: {
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
    minHeight: 40,
  },
  btnPressed: {
    opacity: 0.7,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },

  // Habit row
  habitRow: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.xs,
  },
  habitInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  habitId: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.mutedText,
    fontWeight: theme.fontWeight.medium,
    minWidth: 24,
  },
  habitName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    gap: theme.spacing.xs,
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  badgeDone: {
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
  },
  badgePending: {},
  badgeText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.mutedText,
    fontWeight: theme.fontWeight.medium,
  },
  rowActions: {
    flexDirection: "row",
    gap: theme.spacing.xs,
    marginTop: 2,
  },
  rowBtn: {
    flex: 1,
    borderRadius: theme.radius.sm,
    paddingVertical: 6,
    alignItems: "center",
  },
  rowBtnText: {
    color: "#FFFFFF",
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },

  // Selected habit block
  selectedBlock: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.xs,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedText,
    fontWeight: theme.fontWeight.medium,
  },
  infoValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.semibold,
  },
  historyHeader: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    marginBottom: 2,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  historyDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.mutedText,
    flex: 1,
  },
  historyStatus: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    textAlign: "right",
  },
  historyDone: {
    color: theme.colors.primaryDark,
  },
  historyMissed: {
    color: theme.colors.mutedText,
  },

  // Debug JSON
  toggleDebugBtn: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toggleDebugText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.mutedText,
    fontWeight: theme.fontWeight.medium,
  },
  jsonBlock: {
    backgroundColor: "#0F172A",
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    maxHeight: 700,
  },
  jsonLabel: {
    fontSize: theme.fontSize.xs,
    color: "#94A3B8",
    fontWeight: theme.fontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  jsonText: {
    fontSize: 11,
    color: "#E2E8F0",
    fontFamily: "monospace",
    lineHeight: 17,
  },
});
