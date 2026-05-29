/**
 * AppTextInput.jsx
 * Reusable labeled text input used across screens.
 *
 * Props:
 *   label           - string shown above the input
 *   value           - controlled value
 *   onChangeText    - change handler
 *   placeholder     - placeholder text
 *   error           - inline error string shown below the input
 *   autoFocus       - boolean, focuses on mount
 *   maxLength       - max character count
 *   returnKeyType   - keyboard return key label (e.g. 'done', 'next')
 *   onSubmitEditing - called when the user presses the return key
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { theme } from '../constants/theme';

export default function AppTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  autoFocus = false,
  maxLength,
  returnKeyType = 'done',
  onSubmitEditing,
}) {
  const hasError = Boolean(error);

  return (
    <View style={styles.wrapper}>

      {/* Label */}
      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}

      {/* Input field */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.mutedText}
        autoFocus={autoFocus}
        maxLength={maxLength}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        autoCorrect={false}
        autoCapitalize="sentences"
        style={[
          styles.input,
          hasError && styles.inputError,
        ]}
        accessibilityLabel={label}
      />

      {/* Footer row: error on left, character count on right */}
      <View style={styles.footer}>
        {hasError ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          // Empty spacer keeps the counter aligned to the right when no error
          <View />
        )}

        {maxLength != null ? (
          <Text style={[styles.counter, hasError && styles.counterError]}>
            {value ? value.length : 0} / {maxLength}
          </Text>
        ) : null}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.xs,
  },

  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },

  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm + 2,   // 10
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    minHeight: 48,
  },
  inputError: {
    borderColor: theme.colors.danger,
    backgroundColor: '#FFF5F5',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 16,
  },
  errorText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.danger,
    fontWeight: theme.fontWeight.medium,
    flex: 1,
  },
  counter: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.mutedText,
    marginLeft: theme.spacing.sm,
  },
  counterError: {
    color: theme.colors.danger,
  },
});
