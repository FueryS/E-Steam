/**
 * HabitListScreen.jsx
 * The main screen — shows today's habits, streaks, and completion status.
 *
 * Data flow:
 *   useHabitStore → HabitCard list / EmptyState
 *
 * App.js already calls initializeApp() on mount, so this screen does not
 * call it again. A safe fallback useEffect fires loadHabits() only when
 * the habits array is empty AND nothing is already loading — this handles
 * the edge case where the screen is focused before App.js finishes init.
 */

import React, { useEffect, useLayoutEffect, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { useHabitStore } from "../store/useHabitStore";
import { ROUTES } from "../navigation/AppNavigator";
import { theme } from "../constants/theme";
import { CONFIG } from "../constants/config";
import { useSecretDevTap } from "../hooks/useSecretDevTap";

import AppButton from "../components/AppButton";
import HabitCard from "../components/HabitCard";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";

export default function HabitListScreen({ navigation }) {
  const handleSecretDevTap = useSecretDevTap(navigation);

  // Hidden 5-tap gesture on the native navigation header title
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Pressable
          onPress={handleSecretDevTap}
          hitSlop={CONFIG.A11Y.DEFAULT_HIT_SLOP}
          accessibilityRole="header"
          accessibilityLabel="Habits"
        >
          <Text style={styles.navHeaderTitle}>Habits</Text>
        </Pressable>
      ),
    });
  }, [navigation, handleSecretDevTap]);

  // ── Store ─────────────────────────────────────────────────────────────────
  const habits = useHabitStore((state) => state.habits);
  const streaks = useHabitStore((state) => state.streaks);
  const todayStatus = useHabitStore((state) => state.todayStatus);
  const isLoadingHabits = useHabitStore((state) => state.isLoadingHabits);
  const isTogglingHabit = useHabitStore((state) => state.isTogglingHabit);
  const error = useHabitStore((state) => state.error);
  const loadHabits = useHabitStore((state) => state.loadHabits);
  const toggleHabit = useHabitStore((state) => state.toggleHabit);
  const deleteHabitById = useHabitStore((state) => state.deleteHabitById);
  const selectHabit = useHabitStore((state) => state.selectHabit);
  const clearError = useHabitStore((state) => state.clearError);

  // ── Fallback load ─────────────────────────────────────────────────────────
  // Only fires when the screen first mounts with an empty list and nothing
  // is already in flight. Handles the case where init finished before the
  // store had time to hydrate from App.js.
  useEffect(() => {
    if (habits.length === 0 && !isLoadingHabits) {
      loadHabits();
    }
  }, []); // intentionally empty deps — run once on mount only

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleToggle = useCallback(
    (habitId) => {
      toggleHabit(habitId);
    },
    [toggleHabit],
  );

  const handleOpenHistory = useCallback(
    (habit) => {
      selectHabit(habit);
      navigation.navigate(ROUTES.HABIT_HISTORY);
    },
    [selectHabit, navigation],
  );

  const handleDelete = useCallback(
    (habitId) => {
      Alert.alert(
        "Delete habit?",
        "This habit and its history will be permanently deleted.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              deleteHabitById(habitId);
            },
          },
        ],
      );
    },
    [deleteHabitById],
  );

  const handleAddHabit = useCallback(() => {
    navigation.navigate(ROUTES.ADD_HABIT);
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    loadHabits();
  }, [loadHabits]);

  // ── Render helpers ────────────────────────────────────────────────────────
  const renderHabitCard = useCallback(
    ({ item }) => (
      <HabitCard
        habit={item}
        completedToday={todayStatus[item.id] ?? false}
        streak={streaks[item.id] ?? 0}
        onToggle={handleToggle}
        onOpenHistory={handleOpenHistory}
        onDelete={handleDelete}
        isToggling={isTogglingHabit}
      />
    ),
    [
      todayStatus,
      streaks,
      handleToggle,
      handleOpenHistory,
      handleDelete,
      isTogglingHabit,
    ],
  );

  const keyExtractor = useCallback((item) => String(item.id), []);

  // ── Header rendered inside the FlatList (scrolls with content) ───────────
  const ListHeader = (
    <View style={styles.listHeader}>
      <ErrorBanner message={error} onDismiss={clearError} />

      <View style={styles.titleRow}>
        <View style={styles.titleGroup}>
          <Pressable
            onPress={handleSecretDevTap}
            hitSlop={CONFIG.A11Y.DEFAULT_HIT_SLOP}
          >
            <Text style={styles.screenTitle}>Today's Habits</Text>
          </Pressable>
          <Text style={styles.screenSubtitle}>
            Build consistency, one day at a time.
          </Text>
        </View>

        <AppButton
          title="Add Habit"
          onPress={handleAddHabit}
          variant="primary"
          style={styles.addBtn}
        />
      </View>

      {/* Summary pill — e.g. "2 / 3 done" */}
      {habits.length > 0 && (
        <SummaryPill habits={habits} todayStatus={todayStatus} />
      )}
    </View>
  );

  // ── Loading state (initial load, no data yet) ─────────────────────────────
  if (isLoadingHabits && habits.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centeredLoader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading habits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ──────────────
  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={habits}
        keyExtractor={keyExtractor}
        renderItem={renderHabitCard}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState
            title="No habits yet"
            subtitle="Create your first daily habit and start building a streak."
            actionLabel="Add Habit"
            onAction={handleAddHabit}
            imageName="empty-habits.png"
          />
        }
        contentContainerStyle={[
          styles.listContent,
          habits.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingHabits}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]} // Android
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ── Summary pill ──────────────────────────────────────────────────────────────
// Shows "X / Y done today" as a quiet contextual indicator under the heading.
function SummaryPill({ habits, todayStatus }) {
  const doneCount = habits.filter((h) => todayStatus[h.id]).length;
  const totalCount = habits.length;
  const allDone = doneCount === totalCount;

  return (
    <View style={[summaryStyles.pill, allDone && summaryStyles.pillAllDone]}>
      <View
        style={[
          summaryStyles.dot,
          {
            backgroundColor: allDone
              ? theme.colors.primary
              : theme.colors.warning,
          },
        ]}
      />
      <Text style={[summaryStyles.text, allDone && summaryStyles.textAllDone]}>
        {doneCount} / {totalCount} done today
      </Text>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
    marginTop: theme.spacing.xs,
  },
  pillAllDone: {
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  text: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedText,
    fontWeight: theme.fontWeight.medium,
  },
  textAllDone: {
    color: theme.colors.primaryDark,
  },
});

// ── Main styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
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

  // FlatList content
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  listContentEmpty: {
    flexGrow: 1, // lets EmptyState center vertically
  },

  // Header block inside the list
  listHeader: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  titleGroup: {
    flex: 1,
    gap: 4,
  },
  screenTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    lineHeight: 32,
  },
  screenSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.mutedText,
    lineHeight: 18,
  },
  addBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 40,
  },
  navHeaderTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
});
