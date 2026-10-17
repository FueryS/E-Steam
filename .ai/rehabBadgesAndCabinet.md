# Rehabilitation Badges & The Collector's Wooden Cabinet

This document specifies the design philosophy, sensory interactions, visual assets, and database architecture for **The Rehabilitation Badges & Collector's Cabinet** system in **E-Steam**.

---

## 1. Philosophical Origin & The Master Badge Icon

### A. The Replacement of the Profile Icon
In a 100% offline-first application, a generic user profile picture or account icon is meaningless visual clutter. In **E-Steam**, the top-right header circle is replaced by the **Live Master Badge Icon**:
- **Visual Design**: An embossed metallic coin/medallion inspired by **Rehabilitation & Sobriety Chips** (Alcoholics Anonymous / Narcotics Anonymous recovery medallions) and military challenge coins.
- **Function**: Displays the user's ongoing master streak (consecutive days where all daily habits were completed).
- **Trigger**: Tapping this badge smoothly opens the **Collector's Wooden Cabinet** (Drawer Page).

### B. Behavioral Psychology: The Endowment Effect & Sunk Cost of Self-Trust
In behavioral psychology (*Daniel Kahneman*, *Dan Ariely*), people value physical milestones they have earned far more than digital tallies. By styling achievements as tangible physical medallions resting in a wooden cabinet, habits transition from abstract tasks into treasured personal artifacts.

---

## 2. The Collector's Wooden Cabinet (The Drawer Page)

When the top-right badge is tapped, a dedicated drawer/cabinet screen slides open.

### A. Aesthetic & Materiality (The Anti-Minimalist Wooden Case)
Unlike the rest of the clean digital interface, the Cabinet is intentionally physical, warm, and tactile:
- **Background Texture**: Deep mahogany, walnut, or aged oak grain with soft directional lighting.
- **Cabinet Compartments**: Recessed wooden grid slots separated by carved bevels or brass dividers. Each compartment is lined with deep green, burgundy, or charcoal felt/velvet backing.
- **Engraved Nameplates**: Underneath each badge slot sits a tiny brushed brass or wood-burned plaque displaying the habit's name in crisp typography.

### B. Badge Anatomy & Material Tiers
Every tracked habit earns a dedicated Rehab Badge showing the **all-time highest streak** ever achieved for that habit:

| Streak Range | Material Tier | Visual Specification | Psychological Meaning |
| :--- | :--- | :--- | :--- |
| **1 – 23 Days** | **Silver Medallion** | Brushed sterling silver, cold metallic specular highlights, circular reeded coin edge, recessed matte numerals. | Forging the habit; active willpower phase (System 2). |
| **24+ Days** | **Golden Medallion** | Radiant burnished gold, warm aurum sheen, deep lustrous bevel, gleaming high-contrast center. | Transcending the 21-day automaticity threshold (Lally Asymptote reached, System 1 habit). |

---

## 3. The Dust Patina & Resurrection System

A user's hard-earned history must never be discarded. Deleting a habit in E-Steam does **not** erase the medallion.

### A. The Dust & Neglect Patina (Deleted Habits)
When a user deletes a habit from their active dashboard:
1. The badge in the Collector's Cabinet **remains permanently in its compartment**.
2. A realistic **layer of dust, cobwebs, and desaturation** settles over that specific grid slot.
3. The brass nameplate becomes slightly tarnished/aged.
4. **Psychological Purpose**: Honors past discipline without guilt. It visually signals dormancy—a reminder of what the user was once capable of achieving.

### B. The Resurrection Expansion (Re-Adding the Same Habit)
If a user later re-creates a habit with the **exact same name (case-insensitive)**:
1. The app detects a match against the normalized name (`name.trim().toLowerCase()`).
2. The existing wooden compartment **expands dynamically** to accommodate two side-by-side badges.
3. **The Visual Contrast**:
   - **The Old Badge**: Sits on the left, still covered in dust, cobwebs, and historical patina with its previous highest streak.
   - **The New Badge**: Placed on the right, pristine, unmarked, polished, and gleaming with no wear.
4. This visual storytelling celebrates returning to the path after a hiatus.

---

## 4. The Daily Master Badge Climax ("The Ritual of Collection")

When the user completes the final task of the day (e.g. `5/7` transitions to `7/7`):

### A. The Visual Transformation
1. The circular daily progress evaluation gauge smoothly expands and transforms into the **New Master Rehab Badge**.
2. All surrounding clutter, sub-labels, and secondary cards dissolve away into a focused, altar-like presentation.
3. A tactile `"Collect"` button appears on the right for affordance.
4. **Crucial Psychological Detail**: The badge is *already collected and saved in SQLite* behind the scenes (loss-proof). The UI ritual exists purely to provide visceral psychological satisfaction and closure (*Don Norman's Reflective Design*).
5. The **entire hero container** responds to touch as "Collect", not just the button.

### B. The Hold-to-Collect Microinteraction (Dan Saffer Mechanics)

```
User Touches Card ──> Expanding Touch Ripple ──> Elements Jitter & Haptic Buzz ──> (400ms) ──> Badge Pops Out ──> Top-Right 3D Coin Flip
```

#### Step-by-Step Breakdown:
1. **Configurable Timing Variable**:
   ```javascript
   export const COLLECT_HOLD_DURATION_MS = 400; // Easily tunable duration
   ```
2. **Touch Down**:
   - A circular luminescence/ripple expands outward directly from the user's touch coordinate `(pageX, pageY)`.
   - The card and badge elements begin to **shake and resonate** (harmonic jitter using `translateX: [-2, 2, -1, 1]` oscillations).
   - Rhythmic haptic vibration pulses with escalating tempo (`Haptics.impactAsync(Light)`).
3. **Threshold Reached (400ms)**:
   - **Badge Pop-Out**: The master badge springs forward with an explosive scale animation (`scale: 1.35`) and radial particle flash.
   - **Heavy Haptic Feedback**: `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)`.
   - **Dashboard Restoration**: The hero card smoothly spring-animates back to its standard dashboard state.
   - **3D Coin Flip Animation**: The top-right header badge icon executes a **singular 360-degree Y-axis rotation** (`transform: [{ rotateY: '360deg' }]`) as it flips over and reveals the newly incremented streak count.

---

## 5. Craftsmanship & Asset Requirements (Strict Law)

> [!CAUTION]
> **Zero Laziness Rule**: Badges, textures, and coin bevels must NEVER be rendered as cheap flat CSS circles or generic vector clip-art.

1. **Badge Rendering**:
   - Must be constructed using high-fidelity vector assets (`react-native-svg`), custom procedural shaders, or high-density multi-stop radial gradient medallions with physical specular highlights.
   - Reeded coin borders (tiny notched grooves along the circumference).
   - Debossed typography in the coin core with simulated light and shadow depth.
2. **Dust & Wood Textures**:
   - Authentic, high-resolution wood grain backdrops optimized for mobile memory.
   - Delicate procedural or alpha-masked dust layers (`rgba(220, 215, 205, 0.45)`) with particulate specs.

---

## 6. Database Schema & Architecture

To support permanent badges, dust overlays, and re-added habit expansion, SQLite must track badge lifecycles independently of active habit deletion:

```sql
CREATE TABLE IF NOT EXISTS rehab_badges (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id          INTEGER,              -- NULL if active habit was deleted
  habit_name        TEXT    NOT NULL,
  normalized_name   TEXT    NOT NULL,     -- TRIM(LOWER(habit_name))
  highest_streak    INTEGER NOT NULL DEFAULT 0,
  is_active         INTEGER NOT NULL DEFAULT 1, -- 0 = deleted (dust patina)
  badge_tier        TEXT    NOT NULL DEFAULT 'silver', -- 'silver' (<=23) or 'gold' (>23)
  created_at        TEXT    NOT NULL,
  deleted_at        TEXT                  -- timestamp when dusted
);
```

### Business Logic Rules:
1. **Streak Syncing**: On every habit toggle, if `current_streak > highest_streak`, update `rehab_badges.highest_streak`.
2. **Tier Advancement**: Automatically elevate `badge_tier` from `'silver'` to `'gold'` the instant `highest_streak >= 24`.
3. **Soft Tombstoning**: When a habit is deleted in `habitService.deleteHabit()`, do NOT delete its record in `rehab_badges`. Set `is_active = 0` and `deleted_at = datetime('now')`.
4. **Re-addition Detection**: When creating a habit, check `SELECT * FROM rehab_badges WHERE normalized_name = ?`. If found and `is_active = 0`, create a new sibling badge record and link the compartment to both.
