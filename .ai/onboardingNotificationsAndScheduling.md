# Onboarding, Notifications, Scheduled Rest Days & Grace Recovery

This document specifies the exact behavioral flows, SQLite schemas, environment configurations, and micro-interactions for:
1. **The First-Launch Onboarding Flow** ("What should I call you?" & The Core Philosophy).
2. **Centralized Offline Notifications & Sensitive Configuration** (Zero Magic Numbers & `.env`).
3. **Enhanced Habit Scheduling (Days of Week & Rest Day Streak Protection)**.
4. **1-Day Retroactive Forgiveness & Grace Recovery** ("Never Punished" UX).

---

## 1. First-Launch Onboarding Flow

When a user opens **E-Steam** for the very first time, they must be greeted warmly before reaching the dashboard.

### A. Screen 1: Name Questionnaire
* **Heading**: *"What should I call you?"*
* **Subtext**: *"Your habits are personal promises to yourself."*
* **Input**: Single, elegant text field with auto-focus and auto-capitalization.
* **Validation**: Non-empty trimmed string (max 30 characters).
* **CTA Button**: *"Continue"* (transitions with spring physics).

### B. Screen 2: The Core Philosophy
* **Card Presentation**: Soft linen card with gold foil or warm terracotta accent border.
* **Core Manifesto Copy**:
  > *"Failing is not when you miss a day, failing is when you don't return after it."*
* **Supporting Thought**: *"In E-Steam, we build self-trust through gentleness, resilience, and steady consistency."*
* **CTA Button**: *"Begin Journey"* $\rightarrow$ navigates to `ROUTES.HABIT_LIST` and greets: *"Good morning, [Name]"*.

### C. Persistent Storage Architecture
Stored in SQLite via an `app_settings` key-value table:
```sql
CREATE TABLE IF NOT EXISTS app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```
Keys:
- `user_name`: e.g. `"Alex"`.
- `has_completed_onboarding`: `'true'` | `'false'`.
- `theme_mode`: `'light'` | `'dark'`.

---

## 2. Centralized Notifications & Configuration Management

### A. Strict Anti-Magic-Number Law
Hardcoded numbers (millisecond timeouts, notification hours, default intervals) and inline strings are **strictly forbidden**.
All constants must live in centralized configuration files:
- `constants/config.js`: Application intervals, hold durations, and limits.
- `constants/notifications.js`: Channel IDs, default reminder hours, and notification copy.

### B. Environment Variables (`.env`)
Sensitive or environment-specific values must be managed via Expo's environment variable system:
- Use `EXPO_PUBLIC_` prefix for client-accessible variables (e.g. `EXPO_PUBLIC_APP_ENV=production`).
- Access via `process.env.EXPO_PUBLIC_*`.

### C. Offline-First Notification Architecture (`expo-notifications`)
E-Steam is 100% offline. All notifications are **local scheduled notifications** running directly on the device's hardware clock:
1. **Morning Intention Nudge** (e.g. `08:30`): *"Good morning, [Name]. A small promise kept today builds lasting self-trust."*
2. **Evening Reflection Nudge** (e.g. `20:45`): *"Gentle evening check-in: Celebrate what you completed today."*
3. **Android Channels**:
   - `channelId: 'daily-reminders'`
   - `importance: Notifications.AndroidImportance.HIGH`
   - Custom gentle sound and vibration pattern.

---

## 3. Enhanced Habit Scheduling & Rest Day Streak Protection

Real life requires recovery days (e.g., muscle recovery after the gym, rest days on Sundays). Penalizing rest days destroys motivation.

### A. Database Schema
Add `active_days` to the `habits` table:
```sql
ALTER TABLE habits ADD COLUMN active_days TEXT NOT NULL DEFAULT '1,2,3,4,5,6,7';
```
*Format: Comma-separated ISO weekday numbers where `1 = Monday, ..., 7 = Sunday`.*

### B. Add Habit UI (Day Picker)
- 7 circular pill chips: `[M] [T] [W] [T] [F] [S] [S]`.
- All days selected by default. Tapping toggles inclusion. Minimum 1 day required.

### C. Off-Day / Rest Day Behavior in the UI
On days when a habit is **not scheduled** (e.g. Sunday for a Gym habit):
1. The habit card renders in a **peaceful resting state**:
   - Dimmed / soft-opacity card with a gentle badge: `"Rest Day 🌿"`.
   - The checkbox is already marked/satisfied with a delicate resting outline.
2. **Streak Protection Law**:
   - In `services/streakService.js`, **unscheduled off-days count toward the streak by default**.
   - An off-day is never evaluated as a "missed" day. The streak bridges cleanly across scheduled rest days.

---

## 4. 1-Day Retroactive Grace Recovery ("Never Punished" UX)

Users often complete a habit in the physical world but simply forget to open their phone before falling asleep. The app must never punish a user for living in the real world.

### A. The 1-Day Grace Trigger
When a user opens the app today ($T_0$) and marks a habit as completed:
1. The system checks yesterday ($T_{-1}$): Was yesterday a scheduled day that was **unmarked**?
2. The system checks two days ago ($T_{-2}$):
   - **Scenario A (Gap is exactly 1 day)**: $T_{-2}$ was completed (or was an off-day / habit didn't exist yet).
     $\rightarrow$ The user only missed yesterday.
     $\rightarrow$ A non-intrusive toast / action snackbar appears at the bottom:
     > **"Did you complete this yesterday?"**
     > `[ Yes, mark done ]`  `[ No ]`
   - **Scenario B (Gap is 2+ days)**: $T_{-2}$ was ALSO missed.
     $\rightarrow$ The retroactive prompt **DOES NOT TRIGGER**.
     $\rightarrow$ Per James Clear's "Never Miss Twice" rule, two consecutive missed days represents a real streak break. This prevents users from artificially backdating prolonged absences.

### B. On User Tapping "Yes":
1. Retroactively inserts `{ habit_id, date: yesterday, completed: 1 }` into `habit_logs`.
2. Seamlessly updates in-memory `streaks[habit_id]` without screen flicker.
3. Fires a celebratory haptic pulse: `Haptics.notificationAsync(Success)`.
4. Shows a brief confirmation: *"Yesterday marked done. Streak preserved! 🔥"*.
