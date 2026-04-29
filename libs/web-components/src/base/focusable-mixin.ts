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
}

/**
 * FocusableMixin
 *
 * Applies to all interactive Vi components. Provides:
 *
 *  1. `delegatesFocus: true` on the shadow root — clicking anywhere in the
 *     shadow that is not itself focusable routes focus to the first focusable
 *     inner element automatically. Also makes `:focus-within` work on the host.
 *
 *  2. A `focus()` override that delegates to `_focusableElement` so callers
 *     can do `myInput.focus()` and it Just Works without knowing shadow internals.
 *
 * Usage:
 *   class ViInput extends FocusableMixin(ViElement) {
 *     protected override get _focusableElement() {
 *       return this.shadowRoot?.querySelector('input') ?? null;
 *     }
 *   }
 *
 * The inner native control (`<input>`, `<button>`, `<a>`) is the real tab stop.
 * `delegatesFocus: true` ensures the host is not itself in the tab sequence.
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static shadowRootOptions: ShadowRootInit = {
      ...(Base as unknown as typeof LitElement).shadowRootOptions,
      delegatesFocus: true,
    };

    override connectedCallback() {
      super.connectedCallback();
      // Enforce the architecture rule: host must not be a sequential tab stop.
      // Done in connectedCallback to avoid "DOMException: The result must not have attributes" during construction.
      // Always force tabIndex = -1, even if the author set tabindex="0" externally.
      // The inner native control (e.g. <button>, <input>) is the real tab stop;
      // allowing the host into the tab sequence would double-tab every component.
      if (this.hasAttribute('tabindex') && this.tabIndex !== -1) {
        // eslint-disable-next-line no-console
        console.warn(
          `<vi-*> host tabindex overridden by FocusableMixin; hosts must not be focusable. ` +
            `Received tabindex="${this.getAttribute('tabindex')}", forcing tabindex="-1".`,
        );
      }
      this.tabIndex = -1;
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
