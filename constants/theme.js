/**
 * theme.js
 * Single source of truth for every visual decision in the app.
 * Import `theme` in any screen or component — never hard-code values inline.
 *
 * Usage:
 *   import { theme } from '../constants/theme';
 *   style={{ backgroundColor: theme.colors.background }}
 */

export const theme = {

  // ── Colors ────────────────────────────────────────────────────────────────
  colors: {
    // Page background — very slightly off-white so cards visibly "float"
    background:   '#F8FAFC',

    // Card / surface — pure white
    surface:      '#FFFFFF',

    // Primary text — near-black for strong readability
    text:         '#0F172A',

    // Secondary / helper text — medium slate
    mutedText:    '#64748B',

    // Dividers, input borders
    border:       '#E2E8F0',

    // Primary action — fresh green (streak complete, toggle done)
    primary:      '#22C55E',

    // Pressed / darker primary state
    primaryDark:  '#16A34A',

    // Destructive actions (delete)
    danger:       '#EF4444',

    // Warning / caution states
    warning:      '#F59E0B',
  },

  // ── Spacing ───────────────────────────────────────────────────────────────
  // Use these multiples so layout is consistent across screens.
  // xs → tight internal padding, xl → section gaps
  spacing: {
    xs:   4,
    sm:   8,
    md:  16,
    lg:  24,
    xl:  32,
    xxl: 48,
  },

  // ── Border radius ─────────────────────────────────────────────────────────
  radius: {
    sm:   6,
    md:  12,
    lg:  16,
    full: 999, // pill shape for chips / badges
  },

  // ── Font sizes ────────────────────────────────────────────────────────────
  fontSize: {
    xs:   11,
    sm:   13,
    md:   15,
    lg:   17,
    xl:   20,
    xxl:  26,
    hero: 32,
  },

  // ── Font weights ─────────────────────────────────────────────────────────
  fontWeight: {
    regular: '400',
    medium:  '500',
    semibold: '600',
    bold:    '700',
  },

  // ── Shadows ───────────────────────────────────────────────────────────────
  // Spread as a style object directly onto a View.
  // Example: style={[styles.card, theme.shadow.card]}
  shadow: {
    // Subtle lift for cards
    card: {
      shadowColor:   '#0F172A',
      shadowOffset:  { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius:  4,
      elevation:     2,          // Android
    },
    // Slightly stronger for modals / bottom sheets
    modal: {
      shadowColor:   '#0F172A',
      shadowOffset:  { width: 0, height: 4 },
      shadowOpacity: 0.10,
      shadowRadius:  12,
      elevation:     6,
    },
  },
};
