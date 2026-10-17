# Technical Architecture & Boundaries

E-Steam follows a strict 4-tier unidirectional architecture to maintain clean separation of concerns and maximum performance.

```
┌────────────────────────────────────────────────────────┐
│           Presentation Layer (Screens & Components)     │
│  - Reads state via Zustand selectors                   │
│  - Dispatches actions via store methods                │
│  - Owns animations, haptics, and layout                │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│              State Management (Zustand)                │
│  - `useHabitStore.js`                                  │
│  - Owns all loading flags and error state               │
│  - Never runs raw SQL; calls services exclusively      │
│  - Never imports React Navigation                      │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│                    Service Layer                       │
│  - `habitService.js`, `habitLogService.js`             │
│  - `streakService.js`, `historyService.js`             │
│  - Pure asynchronous JavaScript business logic         │
│  - Executes SQL statements via `databaseService.js`    │
└───────────────────────────▲────────────────────────────┘
                            │
┌───────────────────────────┴────────────────────────────┐
│             Database Layer (`expo-sqlite`)             │
│  - `databaseService.js`                                │
│  - Manages SQLite connection, schema, and migrations   │
│  - Tables: `habits`, `habit_logs`                      │
└────────────────────────────────────────────────────────┘
```

---

## Strict Architectural Rules

1. **No SQL in UI or Zustand**:
   - Only files inside `services/` may interact with SQLite.
   - UI components and Zustand stores must NEVER execute SQL queries.

2. **No Navigation or UI Code in the Store**:
   - `useHabitStore.js` must never call `navigation.navigate()`, show `Alert.alert()`, or handle animations.
   - Screens handle navigation based on store action results.

3. **Surgical Store Updates**:
   - When toggling a habit completion, do NOT re-fetch the entire habits array from SQLite. Update `todayStatus[habitId]` and `streaks[habitId]` surgically in memory to maintain 60fps responsiveness.

4. **Offline SQLite Source of Truth**:
   - Do NOT use `zustand/middleware/persist` (AsyncStorage). SQLite is the single persistent source of truth.

5. **Navigation Conventions**:
   - All screen routes are defined as string constants in `ROUTES` inside `navigation/AppNavigator.jsx`.
   - Never pass raw strings (e.g. `"AddHabit"`) to `navigation.navigate()`. Use `ROUTES.ADD_HABIT`.

6. **Dev Menu Encapsulation**:
   - `TestDashboard.jsx` and `TestDashboardServiceLevel.js` are dev-only screens.
   - They must remain in the navigation stack for debugging, but must have zero visible entry points on user-facing screens.
