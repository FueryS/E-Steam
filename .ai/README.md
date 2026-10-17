# AI Memory & Context System (.ai)

This directory serves as the single source of truth for AI agents (Cursor, Claude Code, Antigravity, Copilot, Windsurf) working on **E-Steam**.

## The Memory Bank Protocol
Whenever an AI agent begins or concludes work on this codebase, it must follow this protocol:

### On Task Start:
1. Read [`activeContext.md`](./activeContext.md) to understand current focus and immediate goals.
2. Read [`designPhilosophy.md`](./designPhilosophy.md) and [`sensoryAndMotionDesign.md`](./sensoryAndMotionDesign.md) to understand non-negotiable UI/UX standards, haptics, and animation physics.
3. Consult [`architecture.md`](./architecture.md), [`behavioralScienceAndAnalytics.md`](./behavioralScienceAndAnalytics.md), [`rehabBadgesAndCabinet.md`](./rehabBadgesAndCabinet.md), and [`onboardingNotificationsAndScheduling.md`](./onboardingNotificationsAndScheduling.md) before creating or refactoring features.

### On Task Complete:
1. Update [`activeContext.md`](./activeContext.md) with what changed and current state.
2. Update [`progress.md`](./progress.md) to reflect completed milestones and newly identified tasks.

---

## Directory Index

| File | Purpose | When to Consult |
| :--- | :--- | :--- |
| **[`designPhilosophy.md`](./designPhilosophy.md)** | Non-negotiable UI/UX laws, anti-vibe-coding constraints, token rules | Before writing ANY component or screen |
| **[`sensoryAndMotionDesign.md`](./sensoryAndMotionDesign.md)** | Norman, Saffer, Refactoring UI, Apple HIG haptics, and spring physics | When designing animations, haptics, or interactions |
| **[`rehabBadgesAndCabinet.md`](./rehabBadgesAndCabinet.md)** | Rehabilitation Medallions, Collector's Wooden Cabinet, Dust Patina, Hold-to-Collect Ritual (400ms), 3D Coin Flip | When implementing badges, header icon, drawer page, or daily completion ritual |
| **[`behavioralScienceAndAnalytics.md`](./behavioralScienceAndAnalytics.md)** | Lally, Clear, Fogg, Wood, Kahneman research; Calendar History & Next-Streak Prediction Engine | When implementing history, consistency charts, or predictions |
| **[`onboardingNotificationsAndScheduling.md`](./onboardingNotificationsAndScheduling.md)** | Name onboarding, core philosophy manifesto, local notifications, rest days, 1-day grace recovery | When building onboarding, scheduling, notifications, or retroactive logs |
| **[`productContext.md`](./productContext.md)** | Why E-Steam exists, brand personality, target user feel | When designing copy, features, or UX flows |
| **[`architecture.md`](./architecture.md)** | 4-tier layer separation (SQLite -> Services -> Zustand -> UI) | When touching data, state, or APIs |
| **[`systemPatterns.md`](./systemPatterns.md)** | Component blueprints, error handling, accessibility patterns | When creating new components |
| **[`activeContext.md`](./activeContext.md)** | Current sprint focus, recent modifications, active blockers | At the start of every session |
| **[`progress.md`](./progress.md)** | Feature checklist, technical debt log, version history | When tracking progress or planning sprints |
