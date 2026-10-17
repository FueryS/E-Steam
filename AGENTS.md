# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

---

# AI Agent Memory Bank & Visual Philosophy

Before writing or modifying any code in this repository, ALL AI agents MUST read and adhere to the memory system in [`.ai/`](./.ai/README.md):

1. **[`designPhilosophy.md`](./.ai/designPhilosophy.md)**: Strict visual laws, anti-cheap UI rules, token constraints, and micro-interaction requirements.
2. **[`sensoryAndMotionDesign.md`](./.ai/sensoryAndMotionDesign.md)**: Design craftsmanship from top authors (Don Norman, Dan Saffer, Steve Schoger, Apple HIG) on tactile look & feel, `expo-haptics` taxonomy, and damped spring physics.
3. **[`rehabBadgesAndCabinet.md`](./.ai/rehabBadgesAndCabinet.md)**: The Rehabilitation Medallions & Wooden Collector's Cabinet:
   - **Top-Right Coin Icon**: Replaces profile avatar with a live master streak medallion.
   - **Collector's Cabinet Drawer**: Deep wood texture, carved grid compartments, brass plaques.
   - **Tiers**: Silver Medallion ($\le 23$ days) and Gold Medallion ($\ge 24$ days).
   - **Dust Patina System**: Badges for deleted habits remain permanently, overlaid with realistic dust/neglect patina.
   - **Resurrection & Grid Expansion**: Re-adding a habit with the same name (case-insensitive) expands the grid slot to display both the dusty vintage badge and the pristine newly minted badge.
   - **Daily Master Ritual**: Hero progress widget transforms into the master badge upon completing all daily habits. Whole container responds to hold (`COLLECT_HOLD_DURATION_MS = 400`), expanding touch ripple, jittering elements, escalating haptics, spring pop-out, and a 360° Y-axis 3D coin rotation on the header icon.
   - **Craftsmanship Law**: Zero laziness. Badges and wood textures must use high-fidelity SVGs, Skia shaders, or crisp multi-density assets.
4. **[`onboardingNotificationsAndScheduling.md`](./.ai/onboardingNotificationsAndScheduling.md)**: Onboarding, Notifications, Scheduled Rest Days & Grace Recovery:
   - **First-Launch Onboarding**: *"What should I call you?"* $\rightarrow$ Manifesto screen: *"Failing is not when you miss a day, failing is when you don't return after it."*
   - **Centralized Notifications & Config**: Zero magic numbers. Offline local notifications via `expo-notifications`. Environment variables configured via `.env` (`EXPO_PUBLIC_*`).
   - **Active Days Scheduling & Rest Days**: When adding a habit, select active weekdays. Unscheduled off-days (e.g. gym on Sunday) appear grayed out/resting and **count toward streak momentum by default**.
   - **1-Day Grace Recovery ("Never Punished" UX)**: If a user forgets to log yesterday and marks today, ask: *"Did you complete this yesterday?"*. If tapped yes, retroactively mark yesterday. Does **NOT** trigger if 2+ consecutive days missed (Clear's "Never Miss Twice" rule).
5. **[`behavioralScienceAndAnalytics.md`](./.ai/behavioralScienceAndAnalytics.md)**: Research from top behavioral analysts (Dr. Phillippa Lally, James Clear, Dr. BJ Fogg, Dr. Wendy Wood, Daniel Kahneman) grounding the Calendar History, Consistency Index chart, and Bayesian Next-Streak Prediction Engine.
6. **[`architecture.md`](./.ai/architecture.md)**: Strict 4-tier separation (SQLite -> Services -> Zustand -> UI).
7. **[`productContext.md`](./.ai/productContext.md)**: Product mission, target aesthetics, and brand voice.
8. **[`systemPatterns.md`](./.ai/systemPatterns.md)**: Reusable component anatomy, error handling, accessibility, and secret 5-tap developer trigger.
9. **[`activeContext.md`](./.ai/activeContext.md)**: Active task focus and recent changes.
