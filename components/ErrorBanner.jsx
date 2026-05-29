/**
 * ErrorBanner.jsx
 * Displays a red-tinted inline banner when an error message is present.
 * Returns null silently when message is empty or null.
 * No alerts, no navigation, no side effects.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <View style={styles.banner}>
      {/* Left accent bar */}
      <View style={styles.accent} />

      {/* Message */}
      <Text style={styles.message} numberOfLines={3}>
        {message}
      </Text>

      {/* Dismiss */}
      <Pressable
        onPress={onDismiss}
        style={({ pressed }) => [styles.dismiss, pressed && styles.dismissPressed]}
        accessibilityRole="button"
        accessibilityLabel="Dismiss error"
      >
        <Text style={styles.dismissText}>Dismiss</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',          // red-50
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: '#FECACA',              // red-200
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingRight: theme.spacing.sm,
    overflow: 'hidden',
  },
  accent: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: theme.colors.danger,
    marginRight: theme.spacing.sm,
    borderRadius: 2,
  },
  message: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: '#B91C1C',                    // red-700
    fontWeight: theme.fontWeight.medium,
    lineHeight: 18,
  },
  dismiss: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    marginLeft: theme.spacing.xs,
  },
  dismissPressed: {
    backgroundColor: '#FEE2E2',          // red-100
  },
  dismissText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.danger,
  },
});
