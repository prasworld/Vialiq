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
    // Brand colors
    primary: 'var(--ds-color-primary)',
    secondary: 'var(--ds-color-secondary)',

    // Semantic colors
    success: 'var(--ds-color-success)',
    warning: 'var(--ds-color-warning)',
    error: 'var(--ds-color-error)',
    info: 'var(--ds-color-info)',

    // Neutral palette
    neutral: {
      50: 'var(--ds-color-neutral-50)',
      100: 'var(--ds-color-neutral-100)',
      200: 'var(--ds-color-neutral-200)',
      300: 'var(--ds-color-neutral-300)',
      400: 'var(--ds-color-neutral-400)',
      500: 'var(--ds-color-neutral-500)',
      600: 'var(--ds-color-neutral-600)',
      700: 'var(--ds-color-neutral-700)',
      800: 'var(--ds-color-neutral-800)',
      900: 'var(--ds-color-neutral-900)',
    },

    // Functional colors
    background: 'var(--ds-color-background)',
    foreground: 'var(--ds-color-foreground)',
    border: 'var(--ds-color-border)',
  },

  /**
   * SPACING TOKENS
   * 8px base unit system: xs (8px), sm (16px), md (24px), lg (32px), xl (40px), etc.
   */
  spacing: {
    xs: 'var(--ds-spacing-xs)',    // 8px
    sm: 'var(--ds-spacing-sm)',    // 16px
    md: 'var(--ds-spacing-md)',    // 24px
    lg: 'var(--ds-spacing-lg)',    // 32px
    xl: 'var(--ds-spacing-xl)',    // 40px
    '2xl': 'var(--ds-spacing-2xl)', // 48px
    '3xl': 'var(--ds-spacing-3xl)', // 56px
  },

  /**
   * TYPOGRAPHY TOKENS
   * Font families, sizes, weights, and line heights
   */
  typography: {
    fontFamily: {
      base: 'var(--ds-font-family-base)',
      mono: 'var(--ds-font-family-mono)',
    },
    fontSize: {
      xs: 'var(--ds-font-size-xs)',     // 12px
      sm: 'var(--ds-font-size-sm)',     // 14px
      base: 'var(--ds-font-size-base)', // 16px
      lg: 'var(--ds-font-size-lg)',     // 18px
      xl: 'var(--ds-font-size-xl)',     // 20px
      '2xl': 'var(--ds-font-size-2xl)', // 24px
      '3xl': 'var(--ds-font-size-3xl)', // 30px
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
    sm: 'var(--ds-shadow-sm)',
    md: 'var(--ds-shadow-md)',
    lg: 'var(--ds-shadow-lg)',
    xl: 'var(--ds-shadow-xl)',
  },

  /**
   * BORDER TOKENS
   * Border radius and widths
   */
  borders: {
    radius: {
      none: '0',
      sm: 'var(--ds-border-radius-sm)',   // 2px
      md: 'var(--ds-border-radius-md)',   // 4px
      lg: 'var(--ds-border-radius-lg)',   // 8px
      xl: 'var(--ds-border-radius-xl)',   // 12px
      full: '9999px',
    },
    width: {
      none: '0',
      thin: '1px',
      base: '2px',
      thick: '4px',
    },
  },

  /**
   * BREAKPOINTS
   * Responsive design breakpoints (mobile-first)
   */
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  /**
   * Z-INDEX SCALE
   * Consistent stacking context management
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
 * DEFAULT COLOR VALUES (Actual hex/rgb values)
 * Used for CSS variable initialization and fallbacks
 */
export const colorDefaults = {
  primary: '#0066cc',
  secondary: '#f0f4f8',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  background: '#ffffff',
  foreground: '#111827',
  border: '#e5e7eb',
};

/**
 * Export token keys for validation and type checking
 */
export type TokenKey = keyof typeof tokens;
export type ColorKey = keyof typeof tokens.colors;
export type SpacingKey = keyof typeof tokens.spacing;
