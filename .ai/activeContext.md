# Active Context

## Current Phase: Transition from Prototype to Premium UI, Badges & Behavioral Analytics

### Primary Objectives:
1. **Move Dev Menu**: Remove explicit `"Dev Menu"` buttons from `HabitListScreen`, `AddHabitScreen`, and `HabitHistoryScreen`. Replace with a secret 5-tap gesture on the header title.
2. **First-Launch Onboarding Flow**: Build the name questionnaire (*"What should I call you?"*) $\rightarrow$ core philosophy screen (*"Failing is not when you miss a day, failing is when you don't return after it"*).
3. **Enhanced Habit Scheduling & Rest Day Streak Protection**: Weekday selection on habit creation; unscheduled days (e.g. gym on Sunday) appear grayed out/resting and **count toward streaks by default**.
4. **1-Day Retroactive Grace Recovery**: When user marks today, check if yesterday was missed (and 2 days ago was completed). Show toast: *"Did you complete this yesterday?"*. If yes, retroactively mark yesterday. Do not trigger if 2+ days missed.
5. **Centralized Notifications & Zero Magic Numbers**: Local notifications via `expo-notifications`, sensitive config in `.env` (`EXPO_PUBLIC_*`), and all constants in `constants/config.js`.
6. **Rehabilitation Badges & Collector's Wooden Cabinet**:
   - Replace top-right profile icon with live master coin medallion.
   - Build `screens/TrophyCabinetScreen.jsx` with rich wooden texture, grid compartments, and silver/gold habit medallions.
   - Implement the dust/patina overlay on deleted habits and compartment expansion on re-added habits.
   - Build the daily Hold-to-Collect ritual (`COLLECT_HOLD_DURATION_MS = 400`) with touch ripple, element jitter, haptics, badge pop-out, and 360° Y-axis coin rotation.
7. **Creation-to-Current Calendar History Screen**: Build an interactive monthly calendar matrix tracking the habit from its creation date to today.
8. **Consistency Analytics & Next-Streak Prediction Engine**: Build a dedicated analytics page with a consistency trend chart and an empirical Bayesian prediction engine forecasting future streak longevity (*Lally*, *Clear*, *Fogg*, *Kahneman*).

---

## Recent Modifications:
- Documented onboarding, rest day scheduling, local notifications, and 1-day grace recovery in `.ai/onboardingNotificationsAndScheduling.md`.
- Documented sensory design literature in `.ai/sensoryAndMotionDesign.md`.
- Documented behavioral analytics & prediction formulas in `.ai/behavioralScienceAndAnalytics.md`.
- Documented Rehabilitation Badges & Collector's Cabinet in `.ai/rehabBadgesAndCabinet.md`.
- Updated `AGENTS.md` and `.cursorrules` to enforce these guidelines.

---

## Immediate Next Steps:
1. Move Dev Menu to secret 5-tap gesture on `HabitListScreen` header.
2. Install `@expo/vector-icons`, `expo-haptics`, and `react-native-svg`.
3. Create `constants/config.js` to eliminate all magic numbers.
4. Build `screens/OnboardingScreen.jsx` and persist user name in SQLite `app_settings`.
5. Upgrade `AddHabitScreen.jsx` with active weekday picker (`M, T, W, T, F, S, S`) and update `streakService.js` to count rest days toward streak.
6. Refactor `HabitCard.jsx` with rest day states, vector icons, and the 1-day retroactive completion toast.
7. Build `screens/TrophyCabinetScreen.jsx` and the Hold-to-Collect ritual.
