/**
 * AppNavigator.jsx
 * Native stack navigator — wraps all three screens.
 * Header is styled from theme so it never looks out of place with the screens.
 *
 * Route names are string constants defined at the top so screens can import
 * them for navigation.navigate() calls without typo risk.
 *
 * Usage from a screen:
 *   import { ROUTES } from '../navigation/AppNavigator';
 *   navigation.navigate(ROUTES.ADD_HABIT);
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { theme } from "../constants/theme";

import HabitListScreen from "../screens/HabitListScreen";
import AddHabitScreen from "../screens/AddHabitScreen";
import HabitHistoryScreen from "../screens/HabitHistoryScreen";

import TestDashboard from "../screens/TestDashboard";
import TestDashboardServiceLevel from "../screens/TestDashboardServiceLevel";

/** Exported so screens can navigate without typing raw strings */
export const ROUTES = {
  HABIT_LIST: "HabitList",
  ADD_HABIT: "AddHabit",
  HABIT_HISTORY: "HabitHistory",
  DEV_MENU: "TestDashboard",
  DEV_MENU_SERVICE_LEVEL: "TestDashboardServiceLevel",
};

const Stack = createNativeStackNavigator();

/**
 * Shared header options applied to every screen.
 * Individual screens can override via options prop if needed.
 */
const sharedHeaderOptions = {
  headerStyle: {
    backgroundColor: theme.colors.background,
  },
  headerTitleStyle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  headerTintColor: theme.colors.text, // back arrow colour
  headerShadowVisible: false, // removes the bottom border/shadow
  headerBackTitleVisible: false, // iOS: hide "Back" text, show arrow only
  contentStyle: {
    backgroundColor: theme.colors.background, // prevents white flash on push
  },
};

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.HABIT_LIST}
      screenOptions={sharedHeaderOptions}
    >
      <Stack.Screen
        name={ROUTES.HABIT_LIST}
        component={HabitListScreen}
        options={{ title: "Habits" }}
      />

      <Stack.Screen
        name={ROUTES.ADD_HABIT}
        component={AddHabitScreen}
        options={{ title: "Add Habit" }}
      />

      <Stack.Screen
        name={ROUTES.HABIT_HISTORY}
        component={HabitHistoryScreen}
        options={{ title: "History" }}
      />

      <Stack.Screen
        name={ROUTES.DEV_MENU}
        component={TestDashboard}
        options={{ title: "Dev Mode" }}
      />

      <Stack.Screen
        name={ROUTES.DEV_MENU_SERVICE_LEVEL}
        component={TestDashboardServiceLevel}
        options={{ title: "SQL Mode" }}
      />
    </Stack.Navigator>
  );
}
