# Design Philosophy & Visual Laws

This document outlines the strict design system rules and visual laws for **E-Steam**. All AI agents MUST follow these rules to ensure the app looks and feels like a top-tier, award-winning mobile application (e.g., Things 3, Opal, Linear, Apple Health) rather than a cheap, generic prototype.

---

## The 8 Non-Negotiable UI Laws

### 1. Zero Pseudo-Icons (Absolute Law)
- **NEVER** construct icons out of nested `View`s with border hacks (e.g., `trashLid`, `trashBody`, `historyArc`).
- **ALWAYS** use `@expo/vector-icons` (Lucide, Feather, Ionicons, MaterialCommunityIcons).
- Standard icon stroke width: `2px` or `2.2px`. Consistent sizing across actions: `16px`, `20px`, or `24px`.

### 2. Strict Design Tokens (No Hardcoded Slop)
- **NEVER** use inline arbitrary hex codes (e.g., `color: '#22c55e'`) or magic spacing numbers (e.g., `padding: 13`).
- **ALWAYS** import tokens from `constants/theme.js` (colors, spacing, radius, typography, shadows).
- If a new shade, blur, or semantic color is needed, add it to `constants/theme.js` first.

### 3. Tactile Multi-Sensory Feedback (Haptics)
Mobile apps feel dead without tactile response. Every user interaction must produce appropriate haptic feedback:
- **Toggle Habit Completion**: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`
- **All Habits Completed Today (Celebration)**: `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)`
- **Delete / Destructive Action**: `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)`
- **Button Press / Tab Switch**: `Haptics.selectionAsync()`

### 4. Physics-Based Micro-Animations
Avoid jarring instantaneous state flips and robotic linear transitions.
- **Spring Curves**: Use spring physics (`damping: 15, stiffness: 150, mass: 1`) for card presses and toggles.
- **Micro-Interactions**: When a user checks a habit:
  1. The checkmark scales up slightly (`scale: 1.15`) before snapping into place.
  2. The progress ring fills smoothly with an interpolated stroke or width.
  3. The card surface subtly transitions tone.
- **Layout Animations**: When adding or deleting items, wrap flat list items in layout transitions (`LayoutAnimation` or `Reanimated Layout.springify()`).

### 5. Depth, Glassmorphism & Elevation
Avoid flat, 1-layer default borders. Create layered visual depth:
- **Subtle Multi-Layer Shadows**: Use diffused, multi-stop shadows rather than harsh dark drop shadows.
- **Border Strokes**: Premium cards use ultra-delicate 1px borders (`rgba(255, 255, 255, 0.08)` in dark mode, `rgba(0, 0, 0, 0.06)` in light mode).
- **Surface Elevation**: Cards float slightly above the page background. The background should be slightly off-canvas (`#0B0F17` in dark mode, `#F8FAFC` in light mode).

### 6. Typographic Hierarchy & Proportions
Typography communicates hierarchy and craftsmanship:
- **Display / Screen Titles**: Bold, generous line heights, tight letter-spacing (`-0.5px`).
- **Data / Stats / Streaks**: Tabular or semi-bold numbers with clean secondary labels.
- **Affirmations & Copy**: Warm, human, and encouraging (e.g., *"Consistency is kindness to your future self"*).
- Never truncate important text clumsily; use explicit `numberOfLines` with intentional font scale.

### 7. Circular Progress & Streak Visualization
Habit apps rely on momentum psychology:
- Always give the user an immediate visual reward for daily progress (e.g., circular percentage ring, 7-day dot heatmap).
- Streak badges should look energetic (warm flame pill with subtle glow or vibrant amber/orange tint).

### 8. Invisible Utility & Dev Triggers
- Developer and diagnostic tools must **never** clutter the user interface.
- Dev screens are accessible exclusively via hidden gestures (e.g. 5-tap sequence on the header title) with subtle haptic confirmation.
