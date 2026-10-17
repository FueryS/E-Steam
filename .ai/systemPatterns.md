# System Patterns & Coding Blueprints

This document establishes standard patterns across the E-Steam codebase to prevent divergence and ensure clean, maintainable code.

---

## 1. Component Blueprint
Every new component should follow this anatomy:

```jsx
import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../constants/theme';

export default memo(function ExampleComponent({
  title,
  onPress,
  isActive = false,
}) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        isActive && styles.containerActive,
        pressed && styles.containerPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text style={[styles.title, isActive && styles.titleActive]}>
        {title}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  containerActive: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.primary,
  },
  containerPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  titleActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
});
```

---

## 2. Safe Area & Layout Pattern
- Top-level screens MUST use `SafeAreaView` from `react-native-safe-area-context` or properly account for `useSafeAreaInsets()`.
- Headers should adapt cleanly to iOS dynamic islands and Android edge-to-edge system bars.

---

## 3. Error Handling Pattern
- **Never crash the screen on an unhandled promise rejection.**
- Services throw structured `Error` objects with human-readable messages.
- The Zustand store catches errors and populates `state.error`.
- Screens render the `ErrorBanner` component at the top of the content scroll area.
- Screen cleanup `useEffect` clears the error on unmount:
  ```js
  useEffect(() => {
    return () => clearError();
  }, [clearError]);
  ```

---

## 4. Accessibility (a11y) Pattern
Every interactive element must include:
- `accessibilityRole` (e.g., `"button"`, `"checkbox"`, `"header"`).
- `accessibilityLabel` (concise description of action).
- `accessibilityState` (e.g., `{ checked: completedToday, disabled: isToggling }`).
- Minimum touch target: 44x44pt (use `hitSlop` when visual icon is smaller).

---

## 5. Secret Multi-Tap Pattern (Hidden Dev Menu)
Standard implementation for developer Easter-egg triggers:
```jsx
const tapCount = useRef(0);
const lastTapTime = useRef(0);

const handleSecretDevTap = () => {
  const now = Date.now();
  if (now - lastTapTime.current < 500) {
    tapCount.current += 1;
  } else {
    tapCount.current = 1;
  }
  lastTapTime.current = now;

  if (tapCount.current >= 5) {
    tapCount.current = 0;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate(ROUTES.DEV_MENU);
  }
};
```
