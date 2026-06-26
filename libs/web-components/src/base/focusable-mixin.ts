import { LitElement } from 'lit';

// any[] is required here — TypeScript mixin constructors must accept rest args.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

/**
 * Type-only declaration of the shape FocusableMixin adds to a class.
 * Using `declare class` emits no runtime code — it exists solely to give
 * TypeScript a concrete type to work with when extending the mixin result.
 * This avoids the "anonymous class private member" errors that occur when
 * TypeScript tries to inline LitElement's private fields into the return type.
 */
export declare class FocusableInterface {
  protected get _focusableElement(): HTMLElement | null;
  focus(options?: FocusOptions): void;
  /**
   * Enables or disables host focus participation.
   * Call this whenever the component's `disabled` state changes so the
   * tabIndex policy stays centralized in the mixin rather than scattered
   * across component `updated()` hooks.
   *
   *   override updated(changed: PropertyValues): void {
   *     super.updated(changed);
   *     if (changed.has('disabled')) this._setHostFocusable(!this.disabled);
   *   }
   */
  protected _setHostFocusable(enabled: boolean): void;
}

/**
 * FocusableMixin
 *
 * Applies to all interactive Vi components. Provides:
 *
 *  1. `delegatesFocus: true` on the shadow root — when the host is Tab-focused
 *     or `.focus()` is called on it, the browser routes focus to the inner
 *     native control. Also activates `:focus` and `:focus-within` on the host.
 *
 *  2. A `focus()` override that delegates to `_focusableElement` so callers
 *     can do `myInput.focus()` and it Just Works without knowing shadow internals.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ARCHITECTURE: host is the tab stop
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   Host:          tabIndex = 0   ← consumer-visible light-DOM tab stop
 *   Inner element: tabindex="0"   ← participates in shadow root's own tab
 *                                   order so :focus-visible fires reliably
 *   delegatesFocus: true          ← routes host focus → inner element
 *
 * This means:
 *   - Tab → lands on host → delegatesFocus → inner element gets visual focus
 *   - `:host(:focus)` and `:host(:focus-within)` both activate correctly
 *   - `:focus-visible` on the inner element fires reliably for all browsers
 *     (keyboard vs mouse distinction works without browser-specific hacks)
 *   - `element.focus()` calls our override → inner element focused explicitly
 *   - Consumer sets tabindex="-1" on host to remove from tab order entirely
 *   - Consumer sets tabindex="2" for explicit ordering — just works
 *
 * NOTE: tabindex="0" on the inner element does NOT create a second light-DOM
 * tab stop. Shadow DOM children only participate in the shadow root's local
 * tab order; the host remains the single entry point from the outer document.
 * The difference from tabindex="-1" is that :focus-visible propagation through
 * delegatesFocus is more consistent when the delegated target is a proper
 * sequential-focus participant.
 *
 * DISABLED: When the `disabled` prop changes, the component MUST sync the
 * host's tabIndex:
 *
 *   override updated(changed: PropertyValues) {
 *     super.updated(changed);
 *     if (changed.has('disabled')) {
 *       this.tabIndex = this.disabled ? -1 : (previous tabIndex value or 0);
 *     }
 *   }
 *
 * Usage:
 *   class ViInput extends FocusableMixin(ViElement) {
 *     protected override get _focusableElement() {
 *       return this.shadowRoot?.querySelector('input') ?? null;
 *     }
 *   }
 */
export function FocusableMixin<T extends Constructor<LitElement>>(
  Base: T
): T & Constructor<FocusableInterface> {
  class FocusableMixinClass extends Base {
    /**
     * Spread existing shadow root options so we don't clobber `mode: 'open'`
     * or any other options already set by a base class or another mixin.
     * `override` is omitted: TypeScript cannot verify the static side of the
     * generic `Base` constructor has `shadowRootOptions`, so we re-declare
     * without override (the property is still inherited at runtime).
     */
    static shadowRootOptions: ShadowRootInit = {
      ...(Base as unknown as typeof LitElement).shadowRootOptions,
      delegatesFocus: true,
    };

    /**
     * The tabIndex to restore when transitioning from disabled → enabled.
     * Snapshotted in connectedCallback and updated whenever we save before
     * disabling, so we can honour custom consumer tabindex values (e.g. 2)
     * rather than blindly restoring to 0.
     */
    private _savedTabIndex = 0;

    override connectedCallback() {
      super.connectedCallback();
      // The host is the user-visible tab stop. Custom elements are NOT in the
      // tab order by default (tabIndex = -1), so we must explicitly opt in.
      // Only set the default if the consumer hasn't already specified a value.
      // `tabIndex` is a reflected IDL attribute — both attribute sets and
      // programmatic sets (`element.tabIndex = 2`) always reflect to the
      // `tabindex` attribute, so `hasAttribute` is a complete guard for both.
      //   tabindex="-1"  → remove from tab order entirely (e.g. inside a focus trap)
      //   tabindex="0"   → participate (same as our default)
      //   tabindex="2"   → explicit ordering position
      // Note: connectedCallback is used (not constructor) to avoid the
      // "DOMException: The result must not have attributes" error during upgrade.
      if (!this.hasAttribute('tabindex')) {
        this.tabIndex = 0;
      }
      // Snapshot the current effective tabIndex so _setHostFocusable(true)
      // can restore it rather than blindly resetting to 0.
      this._savedTabIndex = this.tabIndex;
    }

    /**
     * Centralizes the tabIndex policy for enabled/disabled state.
     *
     * enabled=true  → restore the tabIndex that was in effect before disabling
     *                  (respects consumer tabindex="2", tabindex="-1", etc.)
     * enabled=false → tabIndex = -1 (host skipped by Tab; whole component unreachable)
     *
     * The pre-disable tabIndex is saved so that a consumer who set tabindex="2"
     * gets back tabindex="2" after re-enabling, not a hardcoded 0.
     *
     * All components with a `disabled` prop MUST call this in `updated()`:
     *
     *   if (changed.has('disabled')) this._setHostFocusable(!this.disabled);
     */
    protected _setHostFocusable(enabled: boolean): void {
      if (enabled) {
        this.tabIndex = this._savedTabIndex;
      } else {
        // Only snapshot when we are actually in an enabled state; if this is
        // called repeatedly while disabled (tabIndex already -1) we must not
        // overwrite the real saved value with -1.
        if (this.tabIndex !== -1) {
          this._savedTabIndex = this.tabIndex;
        }
        this.tabIndex = -1;
      }
    }

    /**
     * Subclasses MUST override this getter to return the specific inner element
     * that should receive programmatic focus.
     * Returning `null` before first render is safe — `focus()` no-ops.
     */
    protected get _focusableElement(): HTMLElement | null {
      return null;
    }

    /**
     * Public focus() override.
     *
     * Explicitly delegates to `_focusableElement` when available. While `delegatesFocus: true`
     * handles click routing, relying solely on native programmatic focus hands control
     * to the browser, which blindly targets the *first* focusable element in
     * shadow DOM order — not necessarily the intended one.
     *
     * Example: a vi-input might render a "Clear" <button> before the <input>
     * in the DOM. Native focus would land on the clear button; this explicit
     * call guarantees focus lands on the <input> regardless of DOM order.
     * 
     * If called before the first render (when `_focusableElement` is null), 
     * it safely falls back to `super.focus()`.
     */
    override focus(options?: FocusOptions): void {
      const target = this._focusableElement;
      if (target) {
        target.focus(options);
      } else {
        // Fallback to native behavior if called before first render
        super.focus(options);
      }
    }
  }

  // Cast required: TypeScript cannot reconcile LitElement's private fields
  // with the anonymous class return type. `as unknown as` is the standard
  // pattern recommended by both the TypeScript and Lit teams for mixins.
  return FocusableMixinClass as unknown as T & Constructor<FocusableInterface>;
}
