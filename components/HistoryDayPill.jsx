/**
 * HistoryDayPill.jsx
 * Displays one day from a habit's 7-day history.
 *
 * Props:
 *   label     - human-readable day label, e.g. "Today", "Yesterday", "Mon 26"
 *   date      - YYYY-MM-DD string, shown as secondary detail
 *   completed - boolean: true = Done, false = Missed
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

export default function HistoryDayPill({ label, date, completed }) {
  return (
    <View style={[styles.pill, completed ? styles.pillDone : styles.pillMissed]}>

      {/* Left: status dot + label stack */}
      <View style={styles.left}>
        <View style={[
          styles.dot,
          { backgroundColor: completed ? theme.colors.primary : theme.colors.border },
        ]} />
        <View style={styles.labelGroup}>
          <Text style={[styles.label, completed ? styles.labelDone : styles.labelMissed]}>
            {label}
          </Text>
          <Text style={styles.date}>{date}</Text>
        </View>
      </View>

      {/* Right: status badge */}
      <View style={[
        styles.badge,
        completed ? styles.badgeDone : styles.badgeMissed,
      ]}>
        <Text style={[
          styles.badgeText,
          completed ? styles.badgeTextDone : styles.badgeTextMissed,
        ]}>
          {completed ? 'Done' : 'Missed'}
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm + 2,   // 10
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    marginBottom: theme.spacing.xs,
  },
  pillDone: {
    backgroundColor: '#F0FDF4',              // green-50
    borderColor: '#BBF7D0',                  // green-200
  },
  pillMissed: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },

  // Left section
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  labelGroup: {
    gap: 1,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    lineHeight: 20,
  },
  labelDone: {
    color: theme.colors.text,
  },
  labelMissed: {
    color: theme.colors.mutedText,
  },
  date: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.mutedText,
    fontWeight: theme.fontWeight.regular,
  },

  // Right badge
  badge: {
    paddingVertical: 3,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  badgeDone: {
    backgroundColor: '#DCFCE7',              // green-100
    borderColor: '#86EFAC',                  // green-300
  },
  badgeMissed: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  badgeTextDone: {
    color: theme.colors.primaryDark,
  },
  badgeTextMissed: {
    color: theme.colors.mutedText,
  },
});
