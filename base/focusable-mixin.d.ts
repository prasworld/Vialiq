import { LitElement } from 'lit';
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
export declare function FocusableMixin<T extends Constructor<LitElement>>(Base: T): T & Constructor<FocusableInterface>;
export {};
//# sourceMappingURL=focusable-mixin.d.ts.map