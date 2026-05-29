/**
 * HabitCard.jsx
 * Displays one habit's state and surfaces all three actions:
 *   - Toggle done / not done for today
 *   - Open the 7-day history view
 *   - Delete the habit
 *
 * No Alerts, no navigation, no SQL — pure display + callbacks.
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { theme } from '../constants/theme';

// ── Streak label helper ───────────────────────────────────────────────────────
function streakLabel(count) {
  if (count === 0) return '0 day streak';
  if (count === 1) return '1 day streak';
  return `${count} day streak`;
}

// ── Small icon-like shapes built from View (no icon library) ─────────────────

/** Green circle = done, grey circle = not done */
function StatusDot({ done }) {
  return (
    <View
      style={[
        styles.statusDot,
        { backgroundColor: done ? theme.colors.primary : theme.colors.border },
      ]}
    />
  );
}

/** Thin trash-can shape: vertical rectangle with two notches at top */
function TrashIcon({ color }) {
  return (
    <View style={styles.trashWrap}>
      {/* Lid */}
      <View style={[styles.trashLid, { backgroundColor: color }]} />
      {/* Body */}
      <View style={[styles.trashBody, { borderColor: color }]} />
    </View>
  );
}

/** Clockwise-arrow history shape: arc + arrowhead from two Views */
function HistoryIcon({ color }) {
  return (
    <View style={styles.historyWrap}>
      {/* Arc represented as a thick-bordered circle cropped on one side */}
      <View style={[styles.historyArc, { borderColor: color }]} />
      {/* Arrowhead as a tiny rotated square */}
      <View style={[styles.historyArrow, { borderColor: color }]} />
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function HabitCard({
  habit,
  completedToday = false,
  streak = 0,
  onToggle,
  onOpenHistory,
  onDelete,
  isToggling = false,
}) {
  const streakIsActive = streak > 0;

  return (
    <View style={[styles.card, theme.shadow.card]}>

      {/* ── Top row: status dot + name + delete ── */}
      <View style={styles.topRow}>
        <StatusDot done={completedToday} />

        <Text style={styles.habitName} numberOfLines={2}>
          {habit.name}
        </Text>

        {/* Delete button — no Alert, caller handles confirmation if needed */}
        <Pressable
          onPress={() => onDelete && onDelete(habit.id)}
          style={({ pressed }) => [
            styles.iconBtn,
            pressed && styles.iconBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${habit.name}`}
          hitSlop={8}
        >
          <TrashIcon color={theme.colors.danger} />
        </Pressable>
      </View>

      {/* ── Status + streak row ── */}
      <View style={styles.metaRow}>
        {/* Completion label */}
        <View style={[
          styles.statusPill,
          completedToday ? styles.statusPillDone : styles.statusPillPending,
        ]}>
          <Text style={[
            styles.statusPillText,
            { color: completedToday ? theme.colors.primaryDark : theme.colors.mutedText },
          ]}>
            {completedToday ? 'Done today' : 'Not done today'}
          </Text>
        </View>

        {/* Streak pill */}
        <View style={[
          styles.streakPill,
          streakIsActive && styles.streakPillActive,
        ]}>
          {/* Flame-like shape for active streaks */}
          {streakIsActive && (
            <View style={styles.streakDot} />
          )}
          <Text style={[
            styles.streakText,
            streakIsActive && styles.streakTextActive,
          ]}>
            {streakLabel(streak)}
          </Text>
        </View>
      </View>

      {/* ── Action row: toggle + history ── */}
      <View style={styles.actionRow}>

        {/* Toggle button */}
        <Pressable
          onPress={() => onToggle && onToggle(habit.id)}
          disabled={isToggling}
          style={({ pressed }) => [
            styles.toggleBtn,
            completedToday ? styles.toggleBtnDone : styles.toggleBtnPending,
            pressed && styles.toggleBtnPressed,
            isToggling && styles.toggleBtnDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            completedToday ? `Mark ${habit.name} not done` : `Mark ${habit.name} done`
          }
        >
          {isToggling ? (
            <ActivityIndicator
              size="small"
              color={completedToday ? theme.colors.primaryDark : theme.colors.mutedText}
            />
          ) : (
            <Text style={[
              styles.toggleBtnText,
              completedToday ? styles.toggleBtnTextDone : styles.toggleBtnTextPending,
            ]}>
              {completedToday ? 'Mark as not done' : 'Mark as done'}
            </Text>
          )}
        </Pressable>

        {/* History button */}
        <Pressable
          onPress={() => onOpenHistory && onOpenHistory(habit)}
          style={({ pressed }) => [
            styles.historyBtn,
            pressed && styles.historyBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`View history for ${habit.name}`}
        >
          <HistoryIcon color={theme.colors.mutedText} />
          <Text style={styles.historyBtnText}>History</Text>
        </Pressable>

      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },

  // Top row
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    flexShrink: 0,
  },
  habitName: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    lineHeight: 22,
  },

  // Icon button (delete)
  iconBtn: {
    padding: theme.spacing.xs,
    borderRadius: theme.radius.sm,
  },
  iconBtnPressed: {
    backgroundColor: '#FEF2F2',
  },

  // Trash icon shapes
  trashWrap: {
    width: 18,
    height: 20,
    alignItems: 'center',
  },
  trashLid: {
    width: 14,
    height: 3,
    borderRadius: 1.5,
    marginBottom: 2,
  },
  trashBody: {
    width: 12,
    height: 13,
    borderWidth: 1.5,
    borderRadius: 2,
  },

  // Meta row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  statusPill: {
    paddingVertical: 3,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.full,
  },
  statusPillDone: {
    backgroundColor: '#DCFCE7',   // green-100
  },
  statusPillPending: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusPillText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
  },

  // Streak pill
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  streakPillActive: {
    backgroundColor: '#FFF7ED',   // orange-50
    borderColor: '#FED7AA',       // orange-200
  },
  streakDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.warning,
  },
  streakText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.mutedText,
    fontWeight: theme.fontWeight.medium,
  },
  streakTextActive: {
    color: '#C2410C',             // orange-700
  },

  // Action row
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },

  // Toggle button
  toggleBtn: {
    flex: 1,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    borderWidth: 1.5,
  },
  toggleBtnDone: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',       // green-300
  },
  toggleBtnPending: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  toggleBtnPressed: {
    opacity: 0.75,
  },
  toggleBtnDisabled: {
    opacity: 0.5,
  },
  toggleBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  toggleBtnTextDone: {
    color: theme.colors.primaryDark,
  },
  toggleBtnTextPending: {
    color: theme.colors.mutedText,
  },

  // History button
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  historyBtnPressed: {
    backgroundColor: '#F1F5F9',
  },
  historyBtnText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.mutedText,
  },

  // History icon shapes
  historyWrap: {
    width: 16,
    height: 16,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyArc: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderTopColor: 'transparent',
  },
  historyArrow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 5,
    height: 5,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    transform: [{ rotate: '45deg' }],
  },
});
