/**
 * App.js
 * Root of the application.
 *
 * Responsibilities:
 *  1. Initialize the SQLite database via the Zustand store on first mount.
 *  2. Render a loading state while the DB is being set up.
 *  3. Hand off to AppNavigator once the app is ready.
 *
 * Nothing else lives here — no business logic, no styles beyond the loader.
 */

import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

import AppNavigator from "./navigation/AppNavigator";
import { useHabitStore } from "./store/useHabitStore";
import { theme } from "./constants/theme";

export default function App() {
  const initializeApp = useHabitStore((state) => state.initializeApp);
  const isInitializing = useHabitStore((state) => state.isInitializing);
  const error = useHabitStore((state) => state.error);

  // Run once on mount — opens SQLite and loads initial habit list
  useEffect(() => {
    initializeApp();
  }, []);

  // ── Loading splash ─────────────────────────────────────────────────────────
  if (isInitializing) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loaderText}>Setting up…</Text>
      </View>
    );
  }

  // ── Init error (rare — e.g. device storage full) ───────────────────────────
  if (error && !isInitializing) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>Failed to start: {error}</Text>
      </View>
    );
  }

  // ── Normal render ──────────────────────────────────────────────────────────
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  loaderText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.mutedText,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.danger,
    textAlign: "center",
    paddingHorizontal: theme.spacing.lg,
  },
});
