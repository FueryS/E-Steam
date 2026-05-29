/**
 * AppButton.jsx
 * Reusable button used throughout the app.
 *
 * Variants:
 *   primary   - green fill, white text    (main actions)
 *   secondary - white fill, border        (secondary actions)
 *   danger    - red fill, white text      (destructive actions)
 *   ghost     - transparent, tinted text  (subtle / inline actions)
 */

import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { theme } from '../constants/theme';

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}) {
  const isDisabled = disabled || loading;

  // Resolve colors based on variant
  const variantStyle  = variantStyles[variant] ?? variantStyles.primary;
  const spinnerColor  = variant === 'secondary' || variant === 'ghost'
    ? theme.colors.primary
    : '#FFFFFF';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyle.container,
        pressed && !isDisabled && variantStyle.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <Text style={[styles.label, variantStyle.label]}>{title}</Text>
      )}
    </Pressable>
  );
}

// ── Per-variant color sets ────────────────────────────────────────────────────
const variantStyles = {
  primary: {
    container: {
      backgroundColor: theme.colors.primary,
      borderWidth: 0,
    },
    pressed: {
      backgroundColor: theme.colors.primaryDark,
    },
    label: {
      color: '#FFFFFF',
    },
  },
  secondary: {
    container: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    pressed: {
      backgroundColor: '#F1F5F9',
    },
    label: {
      color: theme.colors.text,
    },
  },
  danger: {
    container: {
      backgroundColor: theme.colors.danger,
      borderWidth: 0,
    },
    pressed: {
      backgroundColor: '#DC2626',
    },
    label: {
      color: '#FFFFFF',
    },
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    pressed: {
      backgroundColor: '#F1F5F9',
    },
    label: {
      color: theme.colors.primary,
    },
  },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm + 2,   // 10
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,                            // accessibility touch target
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.45,
  },
});
