# Project Progress & Roadmap

## Status Overview
- **App Status**: Working offline SQLite backend & Zustand store.
- **UI & Analytics Status**: Advancing from prototype to luxury consumer design with behavioral science predictive analytics, first-launch onboarding, rest-day streak protection, and the Wooden Trophy Cabinet.

---

## Feature Checklist

### Backend & Storage
- [x] SQLite database initialization (`databaseService.js`)
- [x] Habits table schema & migrations
- [x] Habit logs table & daily completion toggling
- [x] Consecutive streak calculation algorithm (`streakService.js`)
- [x] Zustand state store hydration on app startup (`useHabitStore.js`)
- [ ] `app_settings` key-value table for user profile & onboarding status
- [ ] `active_days` column on `habits` table for scheduled weekdays
- [ ] Rest day streak bridging in `streakService.js` (omitted days preserve streak)
- [ ] `rehab_badges` table schema & streak syncing (`databaseService.js`)
- [ ] Lifetime date range queries for full creation-to-present calendar (`historyService.js`)
- [ ] Streak prediction service with Lally automaticity modeling (`streakPredictionService.js`)

### Behavioral Science & Design Memory
- [x] Sensory look & feel, haptics, and spring physics documentation (`.ai/sensoryAndMotionDesign.md`)
- [x] Behavioral research, calendar specs, and streak prediction formulas (`.ai/behavioralScienceAndAnalytics.md`)
- [x] Rehabilitation Badges & Wooden Collector's Cabinet documentation (`.ai/rehabBadgesAndCabinet.md`)
- [x] Onboarding, notifications, rest day scheduling & grace recovery (`.ai/onboardingNotificationsAndScheduling.md`)
- [x] Agent rules updated in `AGENTS.md` and `.cursorrules`

### User Interface & Experience
- [x] Habit list screen (`HabitListScreen.jsx`)
- [x] Habit creation screen (`AddHabitScreen.jsx`)
- [x] 7-day history screen (`HabitHistoryScreen.jsx`)
- [x] High-fidelity concept designs generated (`assets/designs/`)
- [ ] First-Launch Onboarding (`screens/OnboardingScreen.jsx`):
  - [ ] Name input (*"What should I call you?"*)
  - [ ] Philosophy screen (*"Failing is not when you miss a day, failing is when you don't return after it"*)
- [ ] Enhanced Add Habit Menu:
  - [ ] Weekday picker (`M, T, W, T, F, S, S`)
  - [ ] Off-day / rest-day muted display on dashboard (already satisfied)
- [ ] 1-Day Retroactive Grace Recovery Toast:
  - [ ] Trigger on marking today when only yesterday was missed
  - [ ] Suppressed if 2+ consecutive days missed (Clear's "Never Miss Twice" rule)
- [x] Dev Menu hidden behind secret 5-tap gesture
- [x] Vector icon library integrated (`@expo/vector-icons`)
- [x] Haptic feedback integrated (`expo-haptics`)
- [ ] Premium design system in `theme.js` (colors, glass tokens, diffused shadows)
- [ ] Smooth spring micro-interactions on habit toggle
- [ ] Top-Right Master Medallion Icon (replacing profile picture)
- [ ] Collector's Wooden Cabinet Screen (`screens/TrophyCabinetScreen.jsx`)
- [ ] Daily Master Badge Hold-to-Collect Ritual
- [ ] Creation-to-Current Calendar History Screen (`HabitCalendarHistoryScreen.jsx`)
- [ ] Consistency Chart & Streak Prediction Screen (`ConsistencyAnalyticsScreen.jsx`)

### Diagnostics & Developer Tools
- [x] Zustand store test dashboard (`TestDashboard.jsx`)
- [x] Direct SQLite service-level test dashboard (`TestDashboardServiceLevel.js`)
- [x] Discreet developer trigger in production builds (5-tap header pattern)

---

## Known Technical Debt & Issues
- Hand-drawn `View` pseudo-icons in `HabitCard.jsx` (to be refactored in Phase 2).
- Flat single-layer elevation with default green-500 palette.
- No haptic vibrations on user actions in existing cards.

