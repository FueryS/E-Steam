# Sensory Craftsmanship: Look, Feel, Haptics & Motion

This document compiles foundational design wisdom from landmark books and human interface guidelines by top designers and interaction researchers. All AI agents building or modifying **E-Steam** must ground their visual, tactile, and motion decisions in these principles.

---

## 1. Literature & Theoretical Foundation

### A. Don Norman — *The Design of Everyday Things* & *Emotional Design*
Norman establishes that design operates across three interconnected cognitive levels:
1. **Visceral Level (Appearance & First Glance)**: Immediate physiological reaction to form, color, glassmorphism, and typographic balance. If the app feels cheap or unaligned at first glance, the user's emotional state triggers skepticism.
2. **Behavioral Level (The Pleasure of Use & Function)**: Affordances (what can be tapped), signifiers (visual cues showing how to interact), and immediate feedback. Every button must look responsive; every toggle must feel physically satisfying.
3. **Reflective Level (Identity & Pride)**: The user feels good about *who they are* while using the app. In a habit app, seeing a 14-day streak presented elegantly reinforces self-worth and consistency.

### B. Dan Saffer — *Microinteractions: Designing with Details*
A microinteraction is a contained product moment focused on a single task (e.g. checking off a habit). Saffer breaks this down into four essential stages that **every interactive component in E-Steam must implement**:
1. **Trigger**: Clear signifier (e.g., tactile circular check button with subtle outline).
2. **Rules**: What happens when triggered (optimistic store update, streak recalculation).
3. **Feedback**: Sensory verification that the rule executed:
   - *Visual*: Checkmark draws/scales in, card background shifts, progress gauge advances.
   - *Haptic*: Light crisp impact pulse.
4. **Loops & Modes**: Contextual states (e.g. if all habits are completed, trigger a celebration loop).

### C. Adam Wathan & Steve Schoger — *Refactoring UI*
Key visual craftsmanship rules:
- **Depth with Multi-Layer Soft Shadows**: Never use single harsh drop shadows (`shadowRadius: 3, shadowOpacity: 0.3`). Stack multiple diffused shadows with low opacity (`shadowRadius: 16, shadowOpacity: 0.04` over `shadowRadius: 4, shadowOpacity: 0.06`).
- **Tinted Neutrals Over Pure Grays**: Cold slate (`#0F172A`, `#64748B`) or warm stone (`#1C1917`, `#78716C`) gives surfaces a premium organic feel compared to raw grayscale (`#333333`).
- **Hierarchy Over Font Size**: Contrast weights (`600` vs `400`) and color opacity (`mutedText` vs `text`) rather than escalating font sizes unnecessarily.
- **Micro-Borders on Elevated Surfaces**: Give cards an ultra-delicate 1px border (`rgba(255,255,255,0.08)` in dark mode, `rgba(0,0,0,0.05)` in light mode) so elevated cards cleanly separate from the canvas.

### D. Apple Human Interface Guidelines (HIG) & Google Material Motion
- **Direct Manipulation**: Interactions should mimic real physical objects with weight, friction, and spring tension.
- **Non-Blocking Interruptibility**: Animations must never freeze the UI thread. Users must be able to tap or scroll mid-animation without latency.

---

## 2. Haptic Feedback Taxonomy (`expo-haptics`)

Haptics bridge the digital glass with physical reality. Use this exact mapping:

| User Action | Haptic Method | Psychological Intent |
| :--- | :--- | :--- |
| **Habit Toggle (Mark Done)** | `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` | Tactile click confirming completion without fatigue. |
| **Habit Toggle (Undo / Uncheck)** | `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)` | Subtle, cushioned acknowledgment of undoing. |
| **All Daily Habits Completed** | `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)` | Rewarding double-pulse celebration for achieving daily goal. |
| **Delete Habit / Destructive** | `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)` | Firm friction warning before irreversible loss. |
| **Secret Dev Trigger (5th Tap)** | `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)` | Haptic confirmation confirming developer unlock. |
| **Date Selection / Slider Drag** | `Haptics.selectionAsync()` | Featherlight notch feedback as selection moves. |

---

## 3. Motion & Animation Physics

### Physics Over Linear Easing
Real physical objects do not start and stop at constant velocities.
- **Forbidden**: `Easing.linear`, instant snapping without transition, robotic easing curves.
- **Mandated**: Damped spring physics (`withSpring` or `LayoutAnimation.Presets.spring`).

### Standard Spring Coefficients
- **Card Press / Button Tap Scale**:
  - `transform: [{ scale: 0.97 }]` on press-in.
  - Spring recovery: `damping: 15, stiffness: 200, mass: 0.8`.
- **Habit Checkmark Pop**:
  - Scale from `0.6` to `1.2` then settles to `1.0`.
  - Spring recovery: `damping: 12, stiffness: 180`.
- **Progress Gauge Fill**:
  - Smooth duration interpolation over `400ms` with cubic-bezier `(0.16, 1, 0.3, 1)` (out-expo).
- **List Item Reordering / Add / Delete**:
  - Entering: `FadeInDown.springify().damping(16).stiffness(120)`.
  - Exiting: `FadeOutUp.duration(200)`.

---

## 4. Visual Laws Summary for Code Generation

1. **Every button MUST have a visible and tactile press state** (`opacity: 0.88`, `scale: 0.98`, light haptic).
2. **Every state toggle MUST provide simultaneous visual and tactile feedback**.
3. **No raw geometric shapes masquerading as icons** — use `@expo/vector-icons` with consistent optical sizing.
4. **Subtle luminescence / glowing badges** must use low opacity fills with matching tinted borders (e.g. `backgroundColor: '#ECFDF5', borderColor: '#A7F3D0'` for green).
