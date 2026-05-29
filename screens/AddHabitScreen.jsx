/**
 * AddHabitScreen.jsx
 * Form screen for creating a new habit.
 *
 * Data flow:
 *   Local state (habitName, localError)
 *     -> store.addHabit(name)
 *     -> on success: clear input, navigate back
 *
 * Rules:
 *   - No Alert popups
 *   - No navigation inside the store
 *   - Local validation shown via AppTextInput error prop
 *   - Store errors shown via ErrorBanner
 *   - Store error cleared on unmount and on user dismiss
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
} from "react-native";

import { useHabitStore } from "../store/useHabitStore";
import { theme } from "../constants/theme";
import { ROUTES } from "../navigation/AppNavigator";

import AppButton from "../components/AppButton";
import AppTextInput from "../components/AppTextInput";
import ErrorBanner from "../components/ErrorBanner";

const MAX_LENGTH = 40;

export default function AddHabitScreen({ navigation }) {
  // ── Store ─────────────────────────────────────────────────────────────────
  const addHabit = useHabitStore((state) => state.addHabit);
  const isAddingHabit = useHabitStore((state) => state.isAddingHabit);
  const storeError = useHabitStore((state) => state.error);
  const clearError = useHabitStore((state) => state.clearError);

  // ── Local state ───────────────────────────────────────────────────────────
  const [habitName, setHabitName] = useState("");
  const [localError, setLocalError] = useState("");

  // ── Cleanup: clear store error when screen is unmounted ──────────────────
  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChangeText = useCallback(
    (text) => {
      setHabitName(text);
      // Clear local validation error as soon as the user types
      if (localError) setLocalError("");
    },
    [localError],
  );

  const handleSubmit = useCallback(async () => {
    const trimmed = habitName.trim();

    if (!trimmed) {
      setLocalError("Enter a habit name.");
      return;
    }

    const created = await addHabit(trimmed);

    if (created) {
      // Success — reset form and go back to the list
      setHabitName("");
      setLocalError("");
      navigation.goBack();
    }
    // If created is null the store already set storeError; ErrorBanner handles it
  }, [habitName, addHabit, navigation]);

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleDevMenu = useCallback(() => {
    navigation.navigate(ROUTES.DEV_MENU);
  }, [navigation]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Store error banner */}
          <ErrorBanner message={storeError} onDismiss={clearError} />

          {/* Header copy */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Habit</Text>
            <Text style={styles.subtitle}>
              Create a small daily habit you can complete every day.
            </Text>
          </View>

          {/* Input card */}
          <View style={styles.card}>
            <AppTextInput
              label="Habit name"
              value={habitName}
              onChangeText={handleChangeText}
              placeholder="Example: Drink water"
              error={localError}
              autoFocus
              maxLength={MAX_LENGTH}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <AppButton
              title="Create Habit"
              onPress={handleSubmit}
              variant="primary"
              loading={isAddingHabit}
              disabled={isAddingHabit}
            />
            <AppButton
              title="Cancel"
              onPress={handleCancel}
              variant="ghost"
              disabled={isAddingHabit}
            />
            {/* Dev-only shortcut — subtle so it stays out of the way */}
            <AppButton
              title="Dev Menu"
              onPress={handleDevMenu}
              variant="ghost"
              style={styles.devBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },

  // Header
  header: {
    gap: theme.spacing.xs,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.mutedText,
    lineHeight: 22,
  },

  // Input card
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  // Button stack
  actions: {
    gap: theme.spacing.sm,
  },
  devBtn: {
    opacity: 0.55, // visually de-emphasised — dev use only
  },
});
