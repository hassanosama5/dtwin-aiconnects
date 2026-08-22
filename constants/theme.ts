/**
 * Design System
 *
 * Dark theme, per an exact provided spec (Material 3-style token set) for
 * the Home and Chat screens — near-black background, a single indigo-blue
 * accent (#4648d4), Inter typography. The two source mockups disagreed
 * slightly on exact dark-tier values (Home used a softer #0e0e0e/#1a1a1a,
 * Chat used pure #000000/#0e0e0e); this file standardizes on the Chat
 * mockup's numbers since its progression is tighter and it's the more
 * complete/final-looking of the two. `primary`'s 700-900 steps are
 * deliberately LIGHTER than 600 (inverted from a normal light-mode ramp)
 * since on a dark surface, "text that needs to pop against a tinted badge
 * background" must get lighter, not darker — 800/900 use the mockup's own
 * `secondary-fixed-dim` (#c0c1ff) and `secondary-fixed` (#e1e0ff) values.
 *
 * Every color/spacing/radius/shadow value used in the app should come from
 * here (or the mirrored `tailwind.config.js` ramp) — avoid hardcoding hex
 * codes or magic numbers directly in components.
 */

export const theme = {
  colors: {
    // Primary — the app's one accent color (#4648d4, called "secondary" in
    // the source spec's Material naming — we only have one accent, so it's
    // `primary` here to match every existing bg-primary-*/text-primary-*
    // usage already throughout the codebase).
    primary: {
      50: '#0d0e3d', // darkest tint — chip/badge backgrounds
      100: '#1a1b57', // chip/badge borders
      200: '#2b2d72',
      300: '#383a94',
      400: '#4648d4',
      500: '#4648d4',
      600: '#4648d4', // the exact accent — buttons, FABs, links, bubbles
      700: '#9294f5', // light lavender — readable text on a tinted dark badge
      800: '#c0c1ff', // spec's secondary-fixed-dim
      900: '#e1e0ff', // spec's secondary-fixed
    },

    // Ink — kept for anywhere still referencing it, aliased to on-surface
    // (white) now that the app is dark-only. See note in tailwind.config.js.
    ink: {
      900: '#ffffff',
      800: '#ffffff',
      700: '#c6c6c6',
    },

    // Gradient accent — progress fills. Blue-leaning indigo, matching primary.
    gradient: {
      from: '#6063ee',
      to: '#4648d4',
    },

    // Grayscale — UNUSED going forward for new code (kept only so any
    // missed `gray-*` reference doesn't crash); prefer background/surface/
    // outline/on-surface* below for anything new.
    gray: {
      50: '#0e0e0e',
      100: '#1b1b1b',
      200: '#2d3133',
      300: '#474747',
      400: '#848484',
      500: '#a8a8a8',
      600: '#c6c6c6',
      700: '#e5e5e5',
      800: '#f3f4f6',
      900: '#ffffff',
    },

    // Semantic colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    // Background — page-level backdrop
    background: '#000000',
    backgroundSecondary: '#0e0e0e',
    backgroundBrand: '#000000',

    // Surface — elevated/contained element backgrounds (cards, inputs, bars)
    surface: {
      base: '#0e0e0e', // Card default, composer bars, inputs
      sunken: '#0e0e0e', // Card "flat" variant
      high: '#1b1b1b', // avatar bg, chip bg, AI message bubble
      highest: '#2d3133', // strongest fill (scrollbar thumb equivalent)
      border: '#2d3133',
    },

    // Text
    textPrimary: '#ffffff', // on-surface
    textSecondary: '#c6c6c6', // on-surface-variant
    textTertiary: '#848484', // outline
    /** Text/icons rendered on a colored/filled surface (buttons, FAB, user bubble). */
    textInverse: '#ffffff',

    // Borders
    border: '#2d3133',
    borderLight: '#1b1b1b',
    borderStrong: '#474747',
  },

  // Spacing (based on 4px grid)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  // Border radius — tighter than a typical iOS-soft scale, per spec
  // (their "xl" = 8px, not our old 16-24px "soft" cards). "full" stays
  // Tailwind's true unbounded value for circular avatars/dots/pills.
  radius: {
    none: 0,
    sm: 2,
    md: 4,
    lg: 8,
    xl: 8,
    xxl: 12,
    full: 9999,
  },

  // Typography — Inter, sizes/weights/line-heights per spec
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 28,
      xxxxl: 32,
    },

    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },

    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },

    // Named presets matching the spec's type scale exactly (label-sm through
    // headline-xl). Font family is applied globally, see App font loading.
    scale: {
      headlineXl: { fontSize: 40, lineHeight: 48, letterSpacing: -0.4, fontWeight: '700' as const, color: '#ffffff' },
      headlineLg: { fontSize: 32, lineHeight: 40, letterSpacing: -0.32, fontWeight: '700' as const, color: '#ffffff' },
      headlineLgMobile: { fontSize: 28, lineHeight: 36, letterSpacing: -0.28, fontWeight: '700' as const, color: '#ffffff' },
      headlineMd: { fontSize: 24, lineHeight: 32, letterSpacing: -0.12, fontWeight: '600' as const, color: '#ffffff' },
      titleLg: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const, color: '#ffffff' },
      bodyLg: { fontSize: 18, lineHeight: 28, fontWeight: '400' as const, color: '#ffffff' },
      bodyMd: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const, color: '#ffffff' },
      bodySm: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const, color: '#c6c6c6' },
      labelMd: { fontSize: 14, lineHeight: 20, letterSpacing: 0.7, fontWeight: '500' as const, color: '#ffffff' },
      labelSm: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, color: '#c6c6c6' },
      // Back-compat aliases used by existing call sites:
      pageTitle: { fontSize: 28, fontWeight: '700' as const, color: '#ffffff' },
      screenTitle: { fontSize: 20, fontWeight: '600' as const, color: '#ffffff' },
      sectionTitle: { fontSize: 16, fontWeight: '600' as const, color: '#ffffff' },
      body: { fontSize: 16, fontWeight: '400' as const, color: '#ffffff' },
      caption: { fontSize: 14, fontWeight: '400' as const, color: '#c6c6c6' },
      micro: { fontSize: 12, fontWeight: '500' as const, color: '#848484' },
    },
  },

  // Shadows — dark-theme "soft bloom": black shadows read as almost nothing
  // on a black background, so these lean on shadowOpacity/blur rather than
  // shadowColor to read as a glow/lift instead of a drop shadow.
  shadows: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 32,
      elevation: 12,
    },
  },

  // Animation durations (ms)
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
} as const;

// Type exports
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
