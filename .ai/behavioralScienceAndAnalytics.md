# Behavioral Science, Calendar History & Streak Analytics

This document establishes the scientific foundations, mathematical algorithms, and feature specifications for:
1. **Full-Timeline Calendar History View** (from habit creation to present date).
2. **Consistency Analytics & Progress Charting**.
3. **Behavioral Next-Streak Prediction Engine** (predicting future streak longevity based on empirical human behavior models).

---

## 1. Behavioral Science Literature & Research Foundations

### A. Dr. Phillippa Lally (University College London, 2010)
*Research: "How are habits formed: Modelling habit formation in the real world" (European Journal of Social Psychology)*
- **Nonlinear Asymptotic Habit Curve**: Habit acquisition is not linear; it follows an asymptotic exponential curve:
  $$\text{Automaticity}(t) = a - b \cdot e^{-c \cdot t}$$
  - Growth is steepest during the first repetitions, flattening as automaticity reaches an individual plateau (asymptote).
  - Reaching 95% automaticity takes an average of **66 days** (ranging between 18 and 254 days depending on cognitive load).
- **The Single-Miss Law**: Lally proved mathematically that **missing a single opportunity/day does not materially affect the habit curve**, provided the behavior resumes immediately. Missing multiple consecutive days, however, triggers rapid decay.

### B. James Clear — *Atomic Habits*
- **The Plateau of Latent Potential**: Progress is often invisible early on; habits compound exponentially like interest.
- **The "Never Miss Twice" Rule**: Missing one day is an accident; missing two days is the start of a new, negative habit. A user who recovers on Day 2 preserves 85%+ of their neural habit pathway.
- **Identity-Based Measurement**: Rather than just tracking vanity tallies, tracking consistency builds self-trust and self-esteem ("E-Steam").

### C. Dr. BJ Fogg — *Tiny Habits* (Stanford Behavior Design Lab)
- **Fogg Behavior Model**: $B = MAP$ (Behavior occurs when Motivation, Ability, and a Prompt converge).
- In streak analysis, high motivation fluctuates; sustainable habits succeed because the friction (ability) is kept small, allowing the streak to survive low-motivation days.

### D. Dr. Wendy Wood — *Good Habits, Bad Habits* (USC)
- Habits are cognitive shortcuts encoded in the basal ganglia. When context cues remain stable, conscious willpower is bypassed, reducing mental fatigue.

### E. Daniel Kahneman & Amos Tversky — *Thinking, Fast and Slow*
- **Regression to the Mean**: Extreme performances (an unusually long 90-day streak) naturally tend to regress toward the user's historical average. Predictive models must apply regression damping rather than naively projecting outlier momentum.
- **The Planning Fallacy**: Users consistently overestimate future self-discipline. Predictions must present calibrated, conservative confidence intervals.

### F. Dan Ariely — *Predictably Irrational*
- **Hyperbolic Discounting**: Immediate comfort outweighs distant rewards. Visible consistency charts act as an immediate visual pre-commitment device.

---

## 2. Feature Specification 1: Creation-to-Current Calendar History

The current 7-day pill list is being upgraded to a **full calendar-format history** that displays the habit's complete journey from the exact day it was created up to today.

### Architecture & UI Requirements
1. **Navigable Monthly Grid**:
   - Header with `[< Month Year >]` selector and quick "Jump to Today" shortcut.
   - Weekday headers (`M, T, W, T, F, S, S` or localized).
   - Standard 7-column calendar matrix.
2. **Cell State Hierarchy**:
   - `Pre-Creation`: Days before `habit.created_at` rendered in low opacity, unselectable.
   - `Completed`: Solid brand green/primary fill with clean check icon or circular badge.
   - `Missed`: Subtle dot or pale neutral pill (days between `created_at` and `today - 1` with no log).
   - `Today`: Distinct ring border highlighting the active day.
   - `Future`: Ghosted out, disabled.
3. **Streak Continuity Visualization**:
   - When adjacent days are completed, visual bridge connectors join the cells to illustrate continuous unbroken momentum across the calendar week.
4. **All-Time Milestone Strip**:
   - `Total Days Tracked` (from creation date to today).
   - `Completed Days` (raw count and % of tracked days).
   - `Longest Ever Streak` (historical max).
   - `Current Streak`.

---

## 3. Feature Specification 2: Consistency Chart & Progress Calculation

Raw streak numbers do not tell the whole story (e.g. completing 28 out of 30 days with two isolated misses is 93% consistent, even if the "current streak" is only 2 days).

### The Consistency Index ($CI$) Formula
Every habit computes a **Consistency Index** ($0 - 100\%$) over a rolling 30-day and 90-day window:

$$CI = \left( 0.45 \times \text{AdherenceRate} \right) + \left( 0.35 \times \text{StreakStability} \right) + \left( 0.20 \times \text{RecoveryEfficiency} \right)$$

Where:
- **$\text{AdherenceRate}$** $= \frac{\text{Days Completed}}{\text{Days Tracked}}$ in the evaluation window.
- **$\text{StreakStability}$** $= \frac{\text{Current Streak}}{\text{Target Benchmark (e.g. 21 or 66 days)}}$ (capped at $1.0$).
- **$\text{RecoveryEfficiency}$** $= \frac{\text{Single-Day Gaps}}{\text{Total Gap Instances}}$ (measures how strictly the user adheres to James Clear's "Never Miss Twice" rule).

### The Consistency Chart
- A rolling line/area graph visualizing the user's weekly Consistency Index over time.
- Trend indicators: `"Building Momentum"` ($\uparrow$), `"Stable Rhythm"` ($\leftrightarrow$), or `"Friction Detected"` ($\downarrow$).
- Positive psychological reinforcement: Celebrates resilience and habit density rather than penalizing occasional isolated misses.

---

## 4. Feature Specification 3: Next-Streak Prediction Engine

The app will predict how many days the user's **next streak** is likely to last, giving users an evidence-based goal grounded in behavioral science.

### Prediction Algorithm: Empirical Bayesian Model with Regression to Mean

The prediction engine runs locally on SQLite data using this multi-factor formulation:

$$\hat{S}_{\text{next}} = \text{round}\left( \left[ \mu_{\text{streaks}} + \rho \cdot \left( S_{\text{last}} - \mu_{\text{streaks}} \right) \right] \times \Phi(n) \times \Omega(R) \right)$$

#### Component Breakdown:

1. **Historical Baseline ($\mu_{\text{streaks}}$)**:
   - Median historical streak length for this habit (median is chosen over mean to eliminate skew from rare outlier streaks).
2. **Kahneman Regression Damping ($\rho = 0.5$)**:
   - Dampens the variance from the most recent streak $S_{\text{last}}$, pulling predictions toward the user's true baseline.
3. **Lally Automaticity Multiplier ($\Phi(n)$)**:
   - Based on cumulative lifetime repetitions $n$:
     $$\Phi(n) = 1.0 + 0.5 \times \left(1 - e^{-0.03 \times n}\right)$$
   - A user who has completed a habit 100+ times has higher automaticity and resilience than someone on their first month, boosting predicted streak longevity by up to $1.5\times$.
4. **Clear "Never Miss Twice" Recovery Factor ($\Omega(R)$)**:
   - Evaluates historical relapses:
     $$\Omega(R) = 0.8 + 0.4 \times R$$
     where $R$ is the ratio of single-day misses that were immediately followed by a completion.
5. **Output Delivery**:
   - **Predicted Streak Target**: e.g., `"Predicted next streak: 18 days"`.
   - **Confidence Range**: `[14 – 22 days]` (80% confidence interval).
   - **Behavioral Insight**: Actionable guidance derived from Clear & Fogg (e.g., *"Your automaticity is at 72%. Protect day 4 and day 12—these are your historical drop-off points."*).

---

## 5. Technical Layer Mapping

- **Data Aggregation**: Handled in `services/historyService.js` and `services/streakPredictionService.js`.
- **Pure SQLite Queries**: Efficient date range queries using `strftime('%Y-%m-%d', date)`.
- **Zustand State**: Stored in `useHabitStore.js` under `selectedHabitCalendar` and `streakPredictions`.
- **Presentation**:
  - `screens/HabitCalendarHistoryScreen.jsx` (the full calendar).
  - `screens/ConsistencyAnalyticsScreen.jsx` (the chart & prediction engine).
