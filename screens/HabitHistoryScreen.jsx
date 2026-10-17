/**
 * HabitHistoryScreen.jsx
 * Displays the last 7 days of completion history for a selected habit.
 *
 * Data flow:
 *   HabitListScreen sets selectedHabit in store + navigates here
 *   This screen calls loadHabitHistory(selectedHabit.id) on focus
 *   Renders selectedHabitHistory as HistoryDayPill list
 *
 * Rules:
 *   - No SQL, no direct service calls
 *   - Store error shown via ErrorBanner
 *   - Store error cleared on unmount
 *   - selectedHabit NOT cleared on mount, only on explicit back navigation
 *   - Handles gracefully if screen is reached without a selectedHabit
 */

import React, { useEffect, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { ROUTES } from "../navigation/AppNavigator";
import { useFocusEffect } from "@react-navigation/native";

import { useHabitStore } from "../store/useHabitStore";
import { theme } from "../constants/theme";

import AppButton from "../components/AppButton";
import ErrorBanner from "../components/ErrorBanner";
import HistoryDayPill from "../components/HistoryDayPill";

export default function HabitHistoryScreen({ navigation }) {
  const handleDevMenu = useCallback(() => {
    navigation.navigate(ROUTES.DEV_MENU);
  }, [navigation]);
  // ── Store ─────────────────────────────────────────────────────────────────
  const selectedHabit = useHabitStore((state) => state.selectedHabit);
  const selectedHabitHistory = useHabitStore(
    (state) => state.selectedHabitHistory,
  );
  const loadHabitHistory = useHabitStore((state) => state.loadHabitHistory);
  const clearSelectedHabit = useHabitStore((state) => state.clearSelectedHabit);
  const isLoadingHistory = useHabitStore((state) => state.isLoadingHistory);
  const error = useHabitStore((state) => state.error);
  const clearError = useHabitStore((state) => state.clearError);
  const streaks = useHabitStore((state) => state.streaks);

  // ── Load history when the screen comes into focus ─────────────────────────
  useFocusEffect(
    useCallback(() => {
      if (selectedHabit) {
        loadHabitHistory(selectedHabit.id);
      }
      // No cleanup here — we do NOT clear selectedHabit on every blur,
      // only when the user explicitly navigates back via the button.
    }, [selectedHabit]),
  );

  // ── Cleanup: clear store error on unmount ─────────────────────────────────
  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────
  const streak = selectedHabit ? (streaks[selectedHabit.id] ?? 0) : 0;
  const doneCount = selectedHabitHistory.filter((d) => d.completed).length;
  const totalDays = selectedHabitHistory.length;
  const streakActive = streak > 0;
  const allDone = totalDays > 0 && doneCount === totalDays;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    clearSelectedHabit();
    navigation.goBack();
  }, [clearSelectedHabit, navigation]);

  // ── Fallback: no habit selected ───────────────────────────────────────────
  if (!selectedHabit) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.fallback}>
          <View style={styles.fallbackIconPlaceholder}>
            {/* Place: no-habit-selected.png */}
          </View>
          <Text style={styles.fallbackTitle}>No habit selected</Text>
          <Text style={styles.fallbackSubtitle}>
            Go back and choose a habit to view its history.
          </Text>
          <AppButton
            title="Back to habits"
            onPress={() => navigation.goBack()}
            variant="primary"
            style={styles.fallbackBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoadingHistory && selectedHabitHistory.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centeredLoader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Store error */}
        <ErrorBanner message={error} onDismiss={clearError} />

        {/* Habit name heading */}
        <View style={styles.header}>
          <Text style={styles.habitName} numberOfLines={2}>
            {selectedHabit.name}
          </Text>
          <Text style={styles.sectionLabel}>
            {totalDays === 1 ? "1 day tracked" : `${totalDays} days tracked`}
          </Text>
        </View>

        {/* Stats row: streak + completion summary */}
        <View style={styles.statsRow}>
          {/* Streak card */}
          <View
            style={[styles.statCard, streakActive && styles.statCardActive]}
          >
            <View
              style={[
                styles.statDot,
                {
                  backgroundColor: streakActive
                    ? theme.colors.warning
                    : theme.colors.border,
                },
              ]}
            />
            <View style={styles.statTextGroup}>
              <Text
                style={[
                  styles.statValue,
                  streakActive && styles.statValueActive,
                ]}
              >
                {streak}
              </Text>
              <Text style={styles.statLabel}>
                {streak === 1 ? "day streak" : "day streak"}
              </Text>
            </View>
          </View>

          {/* Completion summary card */}
          <View
            style={[styles.statCard, allDone && styles.statCardAllDone]}
          >
            <View
              style={[
                styles.statDot,
                {
                  backgroundColor:
                    allDone
                      ? theme.colors.primary
                      : theme.colors.mutedText,
                },
              ]}
            />
            <View style={styles.statTextGroup}>
              <Text
                style={[
                  styles.statValue,
                  allDone && styles.statValueDone,
                ]}
              >
                {doneCount} / {totalDays}
              </Text>
              <Text style={styles.statLabel}>days completed</Text>
            </View>
          </View>
        </View>

        {/* History pill list (from today down to creation date) */}
        <View style={styles.pillList}>
          {selectedHabitHistory.map((day) => (
            <HistoryDayPill
              key={day.date}
              label={day.label}
              date={day.date}
              completed={day.completed}
            />
          ))}

          {/* Refreshing overlay — show spinner beside list when reloading */}
          {isLoadingHistory && selectedHabitHistory.length > 0 && (
            <View style={styles.reloadingRow}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.reloadingText}>Refreshing...</Text>
            </View>
          )}
        </View>

        {/* Back button */}
        <AppButton
          title="Back to habits"
          onPress={handleBack}
          variant="secondary"
          style={styles.backBtn}
        />
      </ScrollView>
      <AppButton
        title="Dev Menu"
        onPress={handleDevMenu}
        variant="ghost"
        style={styles.devBtn}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },

  // Loading
  centeredLoader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.mutedText,
  },

  // No-habit fallback
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  fallbackIconPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
    // Place: no-habit-selected.png
  },
  fallbackTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: "center",
  },
  fallbackSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.mutedText,
    textAlign: "center",
    lineHeight: 22,
  },
  fallbackBtn: {
    marginTop: theme.spacing.sm,
    minWidth: 180,
  },

  // Header
  header: {
    gap: 4,
  },
  habitName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    lineHeight: 32,
  },
  sectionLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedText,
    fontWeight: theme.fontWeight.medium,
  },

  // Stats row
  statsRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statCardActive: {
    backgroundColor: "#FFF7ED", // orange-50
    borderColor: "#FED7AA", // orange-200
  },
  statCardAllDone: {
    backgroundColor: "#F0FDF4", // green-50
    borderColor: "#BBF7D0", // green-200
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  statTextGroup: {
    gap: 1,
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    lineHeight: 22,
  },
  statValueActive: {
    color: "#C2410C", // orange-700
  },
  statValueDone: {
    color: theme.colors.primaryDark,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.mutedText,
    fontWeight: theme.fontWeight.medium,
  },

  // Pill list
  pillList: {
    gap: 0, // pills have their own marginBottom
  },

  // Inline reload indicator
  reloadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  reloadingText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedText,
  },

  backBtn: {
    marginTop: theme.spacing.sm,
  },
});
