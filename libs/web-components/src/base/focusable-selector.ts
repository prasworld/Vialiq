/**
 * FOCUSABLE_SELECTOR
 *
 * A CSS selector that matches all tabbable elements within a container.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * WHY CUSTOM ELEMENTS MUST BE LISTED EXPLICITLY
 * ─────────────────────────────────────────────────────────────────────────
 *
 * CSS cannot see through a shadow root. A generic `[tabindex]:not([tabindex="-1"])`
 * will NOT match a `<vi-button>` even though vi-button has tabIndex=-1 on its
 * host and tabIndex=0 on its inner <button>. The inner <button> is inside the
 * shadow root and is invisible to an external querySelector.
 *
 * Each `vi-*` element listed here uses FocusableMixin, which means:
 *   - The host has tabIndex=-1 (not a sequential tab stop itself)
 *   - `delegatesFocus: true` routes clicks inward
 *   - Calling `.focus()` on the host delegates to the inner control
 *
 * So treating the host as the focusable unit is correct — the browser's
 * tab sequence reaches the inner control via the host, and programmatic
 * `.focus()` on the host works because of FocusableMixin.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MAINTENANCE RULE
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Update this file whenever a new focusable vi-* component ships.
 * This is the SINGLE source of truth. FocusTrapMixin, any roving-tabindex
 * manager, and a11y tests all import from here — do not duplicate this list.
 *
 * When adding a new component:
 *   1. Add its tag to PHASE_1_VI_COMPONENTS or PHASE_2_VI_COMPONENTS below.
 *   2. Uncomment it in the exported FOCUSABLE_SELECTOR when the component ships.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * USAGE
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   import { FOCUSABLE_SELECTOR } from '../base/focusable-selector.js';
 *
 *   // All focusables in a shadow root (native + vi-* hosts):
 *   const focusable = [
 *     ...this.shadowRoot!.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
 *   ];
 *
 *   // Include slotted content too (for components that slot focusable children):
 *   this.shadowRoot!.querySelectorAll('slot').forEach((slotEl) => {
 *     (slotEl as HTMLSlotElement)
 *       .assignedElements({ flatten: true })
 *       .forEach((el) => {
 *         if (el.matches(FOCUSABLE_SELECTOR)) {
 *           focusable.push(el as HTMLElement);
 *         }
 *       });
 *   });
 *
 * ─────────────────────────────────────────────────────────────────────────
 * DISABLED EXCLUSION RULES
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Native elements: :not([disabled]) excludes them from the selector.
 * vi-* elements: :not([disabled]) excludes the host — works because vi-*
 *   components reflect `disabled` as an attribute via @property({ reflect: true }).
 *
 * tabindex="-1" exclusion: intentionally NOT in this selector.
 * Rationale: elements with tabindex="-1" are programmatically focusable
 * but not in the sequential tab order. Whether to include them in a trap
 * is a caller decision (FocusTrapMixin excludes them via :not([tabindex="-1"])).
 */

// ── Native HTML focusable elements ───────────────────────────────────────────
const NATIVE_FOCUSABLE = [
  'a[href]:not([tabindex="-1"])',
  'area[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[contenteditable="true"]:not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
];

// ── Phase 1 vi-* components ───────────────────────────────────────────────────
// Add each component here when it ships. Keep commented until shipped.
const PHASE_1_VI_COMPONENTS = [
  'vi-button:not([disabled])',
  // 'vi-input:not([disabled])',    — uncomment when vi-input ships
  // 'vi-checkbox:not([disabled])', — uncomment when vi-checkbox ships
  // 'vi-switch:not([disabled])',   — uncomment when vi-switch ships
  // 'vi-link:not([disabled])',     — uncomment when vi-link ships
];

// ── Phase 2 vi-* components ───────────────────────────────────────────────────
// All commented until Phase 2 starts.
const PHASE_2_VI_COMPONENTS: string[] = [
  // 'vi-select:not([disabled])',
  // 'vi-combobox:not([disabled])',
  // 'vi-dropdown:not([disabled])',
  // 'vi-tabs:not([disabled])',
];

/**
 * A CSS selector matching all tabbable elements:
 *   - Native HTML controls (button, input, select, textarea, a, area)
 *   - Elements with an explicit non-negative tabindex
 *   - All focusable vi-* components (listed explicitly — see above)
 *
 * Disabled elements and elements with tabindex="-1" are excluded.
 */
export const FOCUSABLE_SELECTOR = [
  ...NATIVE_FOCUSABLE,
  ...PHASE_1_VI_COMPONENTS,
  ...PHASE_2_VI_COMPONENTS,
].join(', ');
