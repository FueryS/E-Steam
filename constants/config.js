/**
 * config.js
 * Central configuration for E-Steam.
 * Single source of truth for all application parameters, timings, thresholds,
 * and behavioral benchmarks. Eliminates magic numbers across the codebase.
 */

export const CONFIG = {
  // ── Developer Menu Trigger ────────────────────────────────────────────────
  DEV_MENU: {
    TRIGGER_TAPS: 5,
    TAP_TIMEOUT_MS: 500,
  },

  // ── Daily Master Badge Ritual ─────────────────────────────────────────────
  COLLECT_RITUAL: {
    HOLD_DURATION_MS: 400,
    JITTER_INTERVAL_MS: 50,
    HAPTIC_INTERVAL_MS: 80,
    BADGE_POP_SCALE: 1.35,
    COIN_ROTATION_DEGREES: 360,
  },

  // ── Input Limits ──────────────────────────────────────────────────────────
  LIMITS: {
    MAX_HABIT_NAME_LENGTH: 40,
    MAX_USER_NAME_LENGTH: 30,
    MIN_HABIT_NAME_LENGTH: 1,
  },

  // ── Active Days & Scheduling ──────────────────────────────────────────────
  SCHEDULING: {
    DEFAULT_ACTIVE_DAYS: '1,2,3,4,5,6,7',
    ALL_WEEKDAYS: [1, 2, 3, 4, 5, 6, 7],
    WEEKDAY_LABELS: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    WEEKDAY_NAMES: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
  },

  // ── Medallions & Badges ───────────────────────────────────────────────────
  MEDALLIONS: {
    TIERS: {
      SILVER: 'silver',
      GOLD: 'gold',
    },
    THRESHOLDS: {
      SILVER_MAX_DAYS: 23,
      GOLD_MIN_DAYS: 24,
    },
  },

  // ── 1-Day Grace Recovery ──────────────────────────────────────────────────
  GRACE_RECOVERY: {
    MAX_GAP_DAYS: 1,
    TOAST_DURATION_MS: 4000,
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  NOTIFICATIONS: {
    CHANNELS: {
      DAILY_REMINDERS: 'daily-reminders',
    },
    TIMES: {
      MORNING: { hour: 8, minute: 30 },
      EVENING: { hour: 20, minute: 45 },
    },
  },

  // ── Behavioral Science & Analytics Benchmarks ─────────────────────────────
  BEHAVIORAL: {
    // Dr. Phillippa Lally habit formation asymptote
    LALLY_AUTOMATICITY_DAYS: 66,
    SYSTEM_1_THRESHOLD_DAYS: 24,
    SYSTEM_2_THRESHOLD_DAYS: 21,

    // Consistency Index formula weights: Adherence (45%), Stability (35%), Recovery (20%)
    CONSISTENCY_WEIGHTS: {
      ADHERENCE: 0.45,
      STABILITY: 0.35,
      RECOVERY: 0.20,
    },

    // Empirical Bayesian Next-Streak Prediction parameters
    PREDICTION: {
      KAHNEMAN_REGRESSION_DAMPING: 0.5,
      LALLY_EXPONENTIAL_RATE: 0.03,
      LALLY_MAX_MULTIPLIER: 1.5,
      CLEAR_RECOVERY_BASE: 0.8,
      CLEAR_RECOVERY_SCALE: 0.4,
      CONFIDENCE_INTERVAL: 0.80,
    },

    // Rolling evaluation windows
    WINDOWS: {
      SHORT: 30,
      LONG: 90,
    },
  },

  // ── Spring Motion Physics ─────────────────────────────────────────────────
  MOTION: {
    SPRING_DEFAULT: {
      damping: 15,
      stiffness: 150,
      mass: 1,
    },
    SPRING_BOUNCY: {
      damping: 12,
      stiffness: 180,
      mass: 0.8,
    },
    BUTTON_PRESS_SCALE: 0.98,
    CARD_PRESS_SCALE: 0.97,
    CHECKMARK_POP_SCALE: 1.15,
  },

  // ── Touch & Accessibility Targets ─────────────────────────────────────────
  A11Y: {
    MIN_TOUCH_TARGET: 44,
    DEFAULT_HIT_SLOP: { top: 8, bottom: 8, left: 8, right: 8 },
  },

  // ── History & Calendar ────────────────────────────────────────────────────
  HISTORY: {
    RECENT_LOOKBACK_DAYS: 7,
    CALENDAR_COLUMNS: 7,
  },
};

// Direct named exports for high-frequency constants
export const COLLECT_HOLD_DURATION_MS = CONFIG.COLLECT_RITUAL.HOLD_DURATION_MS;
export const MAX_HABIT_NAME_LENGTH = CONFIG.LIMITS.MAX_HABIT_NAME_LENGTH;
export const MAX_USER_NAME_LENGTH = CONFIG.LIMITS.MAX_USER_NAME_LENGTH;
export const DEV_MENU_TRIGGER_TAPS = CONFIG.DEV_MENU.TRIGGER_TAPS;
export const DEV_MENU_TAP_TIMEOUT_MS = CONFIG.DEV_MENU.TAP_TIMEOUT_MS;
export const DEFAULT_ACTIVE_DAYS = CONFIG.SCHEDULING.DEFAULT_ACTIVE_DAYS;
export const MEDALLION_TIERS = CONFIG.MEDALLIONS.TIERS;
export const MEDALLION_THRESHOLDS = CONFIG.MEDALLIONS.THRESHOLDS;

export default CONFIG;
