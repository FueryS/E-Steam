# Product Context: E-Steam

## 1. Product Identity
- **Name**: E-Steam
- **Concept**: A high-focus, luxury habit tracking and self-esteem building application.
- **Tagline**: *"Build momentum, one day at a time."*
- **Core Philosophy**: Consistency builds self-trust. When users keep small daily promises to themselves, self-esteem grows naturally.

---

## 2. Target Aesthetics & Brand Voice
- **Visual Benchmarks**: *Things 3*, *Opal*, *Rise Sleep*, *Linear*, *Apple Health*, *Endel*.
- **Look & Feel**: Focused, elegant, clutter-free, tactile, and calm.
- **Tone of Voice**:
  - Encouraging, calm, and grounded (never loud, gamified, or stressful).
  - Micro-copy should feel like a supportive companion, celebrating streaks without shaming missed days.

---

## 3. Core Feature Hierarchy

### Tier 1: Daily Focus (The Home Screen)
- **Today's Habit List**: Immediate view of daily habits, sorted by completion priority.
- **Tactile Quick-Toggle**: Tap to mark done/undone with immediate haptic response.
- **Daily Progress Gauge**: Circular or bar progress showing `"X of Y Done Today"` (percentage + streak flame).
- **Weekly Heatmap Strip**: 7-day dot/pill view showing recent consistency.

### Tier 2: Habit Creation & Intentionality
- **Add Habit Flow**: Clean, focused modal/sheet.
- **Attributes**: Habit name, frequency, optional reminder time, category icon.

### Tier 3: Streak & Historical Insights
- **Habit History**: 7-day and 30-day consistency record.
- **Streak Calculation**: Continuous daily streak calculation stored in local SQLite database.

---

## 4. Key Differentiators
- **100% Offline-First**: Instant startup, zero network lag, private data stored locally on device via SQLite.
- **Delightful Tactility**: Every tap feels physical via spring physics and `expo-haptics`.
- **Zero Distraction**: No ads, no aggressive social feeds, no clutter.
