/**
 * Design System Tokens
 * ======================
 * Central source of truth for all design system values.
 * These tokens are exported as both TypeScript constants and CSS custom properties.
 *
 * Structure:
 * - colors: Brand, semantic, and functional colors
 * - spacing: Spacing scale based on 8px unit system
 * - typography: Font families, sizes, weights, line heights
 * - shadows: Shadow definitions for depth
 * - borders: Border radius and widths
 * - breakpoints: Responsive breakpoints
 */

export const tokens = {
  /**
   * COLOR TOKENS
   * Primary brand colors, semantic colors for states, and functional colors
   */
  colors: {
    primary: 'var(--vi-color-primary)',
    secondary: 'var(--vi-color-secondary)',
    success: 'var(--vi-color-success)',
    warning: 'var(--vi-color-warning)',
    error: 'var(--vi-color-error)',
    info: 'var(--vi-color-info)',

    // Neutral palette (grey aliases)
    neutral: {
      100: 'var(--vi-color-grey-100)',
      200: 'var(--vi-color-grey-200)',
      300: 'var(--vi-color-grey-300)',
      400: 'var(--vi-color-grey-400)',
      500: 'var(--vi-color-grey-500)',
      600: 'var(--vi-color-grey-600)',
      700: 'var(--vi-color-grey-700)',
      800: 'var(--vi-color-grey-800)',
      900: 'var(--vi-color-grey-900)',
    },

    // Color palettes
    palettes: {
      grey: {
        100: 'var(--vi-color-grey-100)',
        200: 'var(--vi-color-grey-200)',
        300: 'var(--vi-color-grey-300)',
        400: 'var(--vi-color-grey-400)',
        500: 'var(--vi-color-grey-500)',
        600: 'var(--vi-color-grey-600)',
        700: 'var(--vi-color-grey-700)',
        800: 'var(--vi-color-grey-800)',
        900: 'var(--vi-color-grey-900)',
      },
      red: {
        100: 'var(--vi-color-red-100)',
        200: 'var(--vi-color-red-200)',
        300: 'var(--vi-color-red-300)',
        400: 'var(--vi-color-red-400)',
        500: 'var(--vi-color-red-500)',
        600: 'var(--vi-color-red-600)',
        700: 'var(--vi-color-red-700)',
        800: 'var(--vi-color-red-800)',
        900: 'var(--vi-color-red-900)',
      },
      yellow: {
        100: 'var(--vi-color-yellow-100)',
        200: 'var(--vi-color-yellow-200)',
        300: 'var(--vi-color-yellow-300)',
        400: 'var(--vi-color-yellow-400)',
        500: 'var(--vi-color-yellow-500)',
        600: 'var(--vi-color-yellow-600)',
        700: 'var(--vi-color-yellow-700)',
        800: 'var(--vi-color-yellow-800)',
        900: 'var(--vi-color-yellow-900)',
      },
      green: {
        100: 'var(--vi-color-green-100)',
        200: 'var(--vi-color-green-200)',
        300: 'var(--vi-color-green-300)',
        400: 'var(--vi-color-green-400)',
        500: 'var(--vi-color-green-500)',
        600: 'var(--vi-color-green-600)',
        700: 'var(--vi-color-green-700)',
        800: 'var(--vi-color-green-800)',
        900: 'var(--vi-color-green-900)',
      },
      blue: {
        100: 'var(--vi-color-blue-100)',
        200: 'var(--vi-color-blue-200)',
        300: 'var(--vi-color-blue-300)',
        400: 'var(--vi-color-blue-400)',
        500: 'var(--vi-color-blue-500)',
        600: 'var(--vi-color-blue-600)',
        700: 'var(--vi-color-blue-700)',
        800: 'var(--vi-color-blue-800)',
        900: 'var(--vi-color-blue-900)',
      },
      purple: {
        100: 'var(--vi-color-purple-100)',
        200: 'var(--vi-color-purple-200)',
        300: 'var(--vi-color-purple-300)',
        400: 'var(--vi-color-purple-400)',
        500: 'var(--vi-color-purple-500)',
        600: 'var(--vi-color-purple-600)',
        700: 'var(--vi-color-purple-700)',
        800: 'var(--vi-color-purple-800)',
        900: 'var(--vi-color-purple-900)',
      },
    },

    // Functional colors
    background: 'var(--vi-color-background)',
    foreground: 'var(--vi-color-foreground)',
    border: 'var(--vi-color-border)',
  },

  /**
   * SPACING TOKENS
   * 8px base unit system: xs (8px), sm (16px), md (24px), lg (32px), xl (40px), etc.
   */
  spacing: {
    xs: 'var(--vi-spacing-xs)',
    sm: 'var(--vi-spacing-sm)',
    md: 'var(--vi-spacing-md)',
    lg: 'var(--vi-spacing-lg)',
    xl: 'var(--vi-spacing-xl)',
    '2xl': 'var(--vi-spacing-2xl)',
    '3xl': 'var(--vi-spacing-3xl)',
  },

  /**
   * TYPOGRAPHY TOKENS
   * Font families, sizes, weights, and line heights
   */
  typography: {
    fontFamily: {
      base: 'var(--vi-font-family-base)',
      mono: 'var(--vi-font-family-mono)',
    },
    fontSize: {
      xs: 'var(--vi-font-size-xs)',
      sm: 'var(--vi-font-size-sm)',
      base: 'var(--vi-font-size-base)',
      lg: 'var(--vi-font-size-lg)',
      xl: 'var(--vi-font-size-xl)',
      '2xl': 'var(--vi-font-size-2xl)',
      '3xl': 'var(--vi-font-size-3xl)',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  /**
   * SHADOW TOKENS
   * Depth levels for elevation
   */
  shadows: {
    sm: 'var(--vi-shadow-sm)',
    md: 'var(--vi-shadow-md)',
    lg: 'var(--vi-shadow-lg)',
    xl: 'var(--vi-shadow-xl)',
  },

  /**
   * BORDER TOKENS
   * Border radius and widths
   */
  borders: {
    radius: {
      sm: 'var(--vi-border-radius-sm)',
      md: 'var(--vi-border-radius-md)',
      lg: 'var(--vi-border-radius-lg)',
      xl: 'var(--vi-border-radius-xl)',
    },
    width: {
      thin: 'var(--vi-border-width-thin)',
      base: 'var(--vi-border-width-base)',
      thick: 'var(--vi-border-width-thick)',
    },
  },

  /**
   * BREAKPOINT TOKENS
   * Responsive design breakpoints (raw pixel values, not CSS vars)
   * Use in a JS template literal: `@media (min-width: ${tokens.breakpoints.sm})`
   * Use in plain CSS: @media (min-width: 640px)
   */
  breakpoints: {
    xs: '0',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  /**
   * Z-INDEX TOKENS
   * Stacking context levels (raw integers, not CSS vars)
   * Use in CSS: z-index: tokens.zIndex.modal (e.g. 1050)
   */
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    backdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

/**
 * Type-safe token value extractor
 * Preserves exact string/number types from tokens object
 */
export type TokenValue = typeof tokens;
