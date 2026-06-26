import { LitElement } from 'lit';

// any[] is required here — TypeScript mixin constructors must accept rest args.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

/**
 * Tri-state visual status for form controls.
 *
 * - `'default'` — no validation styling (neutral / untouched)
 * - `'invalid'`  — red border, error colours; set by the form when validation fails
 * - `'valid'`    — green border, success colours; set explicitly by the parent when
 *                  it wants to confirm a correct value (independent of message)
 *
 * Designed to be driven from outside (Angular binding, React prop, plain JS) so
 * the component never decides on its own that it is "valid" — that is always an
 * explicit, intentional signal from the consuming code.
 */
export type ControlStatus = 'default' | 'valid' | 'invalid';

/**
 * Type-only declaration of the shape ValidityMixin adds to a class.
 * `declare class` emits no runtime code — it is a TS-only contract.
 *
 * Properties listed here (invalid, required, validityMessage, value) must be
 * declared as reactive `@property` accessors on the subclass. The mixin reads
 * and writes them but cannot create them — they must exist on the concrete class
 * for Lit's reactivity system to pick them up.
 *
 * _internals must be set via `this.attachInternals()` on the subclass.
 * The class must also declare `static formAssociated = true`.
 */
export declare class ValidityInterface {
  // ── Reactive properties — subclass MUST declare as @property accessor ──────
  // Declared as get/set pairs so that subclass `accessor` declarations
  // (required by Lit 3 TC39 decorators) are compatible. TypeScript TS2611
  // is triggered when a plain field in a base class is overridden with an
  // accessor; get/set declarations don't have this restriction.

  /**
   * Visual/validation state of the control. Reflects as the `[status]` attribute.
   * - `'default'` — no validation styling
   * - `'invalid'`  — red border / error colours
   * - `'valid'`    — green border / success colours
   *
   * Set by the mixin's constraint-validation methods AND by the consuming
   * code/framework. The parent always controls this — the component never
   * auto-promotes itself to `'valid'`.
   */
  get status(): ControlStatus;
  set status(value: ControlStatus);

  /** Whether a value is required. Drives the valueMissing validity flag. */
  get required(): boolean;
  set required(value: boolean);

  /** The human-readable validation message displayed in the component UI. */
  get validityMessage(): string;
  set validityMessage(value: string);

  /** The current component value. Read by _testValidity for required check. */
  get value(): string;
  set value(v: string);

  // ── ElementInternals — subclass MUST attach ───────────────────────────────

  /**
   * ElementInternals instance. Subclass MUST declare:
   *   protected readonly _internals = this.attachInternals();
   * and set:
   *   static formAssociated = true;
   */
  protected readonly _internals: ElementInternals;

  // ── Mixin public API ──────────────────────────────────────────────────────

  /**
   * Checks if the current value satisfies all constraints.
   * Fires a cancelable 'invalid' event (bubbles: false) if invalid.
   * Does NOT show browser validation tooltip.
   * Returns true if valid.
   */
  checkValidity(): boolean;

  /**
   * Checks validity AND triggers the browser's built-in validation UI
   * (tooltip near the field). Delegates to ElementInternals.reportValidity().
   * Returns true if valid.
   */
  reportValidity(): boolean;

  /**
   * Sets an arbitrary custom validation message.
   * Pass an empty string to clear the custom error and restore validity.
   * Syncs immediately to ElementInternals so native form constraint API works.
   */
  setCustomValidity(message: string): void;

  // ── Override point ────────────────────────────────────────────────────────

  /**
   * Returns the set of ValidityStateFlags describing why the value is invalid.
   * Return {} (empty object) when the value is valid.
   *
   * The base implementation returns {} (always valid).
   * Subclasses override this to add component-specific checks.
   *
   * Standard flags (all optional, all boolean):
   *   valueMissing   — required field has no value
   *   tooShort       — value is shorter than minlength
   *   tooLong        — value exceeds maxlength
   *   rangeUnderflow — numeric value < min
   *   rangeOverflow  — numeric value > max
   *   patternMismatch— value doesn't match pattern
   *   typeMismatch   — value not well-formed for type (email, url, etc.)
   *   badInput       — user input cannot be converted to a value at all
   *   customError    — setCustomValidity() was called with a non-empty string
   *   stepMismatch   — value doesn't conform to step
   */
  // ValidityStateFlags is a standard DOM lib interface (lib.dom.d.ts) — the
  // parameter type for ElementInternals.setValidity(). All its fields are
  // already optional, so Partial<> is redundant but kept for explicitness.
  // Do NOT confuse with ValidityState (the read-only input.validity object).
  protected _testValidity(): Partial<ValidityStateFlags>;
}

/**
 * ValidityMixin
 *
 * Adds the standard form validation API (`checkValidity`, `reportValidity`,
 * `setCustomValidity`) to any form-associated Lit element.
 *
 * Backed by the native `ElementInternals` API so the component participates
 * in `HTMLFormElement` constraint validation, `.elements`, and browser
 * validation UI — exactly like a native `<input>`.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MINIMUM SUBCLASS REQUIREMENTS
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   1. Declare static formAssociated = true;
 *      Makes the browser register this element as a form participant.
 *
 *   2. Attach ElementInternals:
 *        protected readonly _internals = this.attachInternals();
 *      Must be a field initializer (runs after super() in the constructor).
 *
 *   3. Declare reactive properties (MUST be @property so Lit tracks changes):
 *        @property({ reflect: true }) accessor status: ControlStatus = 'default';
 *        @property({ type: Boolean, reflect: true }) accessor required = false;
 *        @property() accessor validityMessage = '';
 *        @property() accessor value = '';
 *
 *   4. Sync value to internals on every value change:
 *        override updated(changed: PropertyValues): void {
 *          super.updated(changed);
 *          if (changed.has('value')) {
 *            this._internals.setFormValue(this.value);
 *          }
 *        }
 *
 *   5. Handle form reset:
 *        formResetCallback(): void {
 *          this.value = this.getAttribute('value') ?? '';
 *          this.status = 'default';
 *          this.validityMessage = '';
 *        }
 *
 *   6. Handle fieldset/form disable:
 *        formDisabledCallback(disabled: boolean): void {
 *          this.disabled = disabled;
 *        }
 *
 * ─────────────────────────────────────────────────────────────────────────
 * OVERRIDE _testValidity() FOR CUSTOM CONSTRAINTS
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   protected override _testValidity(): Partial<ValidityStateFlags> {
 *     if (this.required && !this.value) return { valueMissing: true };
 *     return {};
 *   }
 *
 *   Chain constraints for components with multiple rules (e.g. vi-input[type="number"]):
 *
 *   protected override _testValidity(): Partial<ValidityStateFlags> {
 *     if (this.required && !this.value)     return { valueMissing: true };
 *     if (this.minlength && this.value.length < this.minlength)
 *                                           return { tooShort: true };
 *     if (this.maxlength && this.value.length > this.maxlength)
 *                                           return { tooLong: true };
 *     return {};
 *   }
 *
 * ─────────────────────────────────────────────────────────────────────────
 * FULL USAGE EXAMPLE — vi-input
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   import { property } from 'lit/decorators.js';
 *   import { ValidityMixin } from '../base/validity-mixin.js';
 *   import { FocusableMixin } from '../base/focusable-mixin.js';
 *   import { ViElement } from '../base/vi-element.js';
 *
 *   @customElement('vi-input')
 *   export class ViInput extends ValidityMixin(FocusableMixin(ViElement)) {
 *     static override formAssociated = true;
 *     protected readonly _internals = this.attachInternals();
 *
   *     @property({ reflect: true }) accessor status: InputStatus = 'default';
 *     @property({ type: Boolean, reflect: true }) accessor required = false;
 *     @property() accessor validityMessage = '';
 *     @property() accessor value = '';
 *
 *     protected override _testValidity(): Partial<ValidityStateFlags> {
 *       if (this.required && !this.value) return { valueMissing: true };
 *       return {};
 *     }
 *
 *     override updated(changed: PropertyValues): void {
 *       super.updated(changed);
 *       if (changed.has('value')) this._internals.setFormValue(this.value);
 *     }
 *
 *     formResetCallback(): void {
 *       this.value = this.getAttribute('value') ?? '';
 *       this.status = 'default';
 *       this.validityMessage = '';
 *     }
 *
 *     formDisabledCallback(disabled: boolean): void {
 *       this.disabled = disabled;
 *     }
 *   }
 *
 * ─────────────────────────────────────────────────────────────────────────
 * INVALID EVENT BEHAVIOUR
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   checkValidity() fires a cancelable 'invalid' event when validation fails.
 *   The event does NOT bubble (matches native form element behaviour).
 *   Consumer can suppress the default UI by calling event.preventDefault().
 *
 *   Example:
 *     myInput.addEventListener('invalid', (e) => {
 *       e.preventDefault(); // suppress browser tooltip
 *       showMyCustomError(myInput.validityMessage);
 *     });
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MIXIN COMPOSITION ORDER
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   ValidityMixin should wrap FocusableMixin (outermost):
 *     ValidityMixin(FocusableMixin(ViElement))
 *
 *   Reason: ValidityMixin only adds methods (checkValidity etc.). It does not
 *   touch shadowRootOptions or focus delegation, so order has no side-effects.
 *   Convention is: functionality mixins wrap infrastructure mixins.
 */
export function ValidityMixin<T extends Constructor<LitElement>>(
  Base: T
): T & Constructor<ValidityInterface> {
  class ValidityMixinClass extends Base {
    /**
     * Base implementation — always valid.
     * Subclass overrides this to return flags like { valueMissing: true }.
     */
    protected _testValidity(): Partial<ValidityStateFlags> {
      return {};
    }

    checkValidity(): boolean {
      const flags = this._testValidity();
      const isValid = !Object.values(flags).some(Boolean);

      // Sync to ElementInternals so native form API (formElement.checkValidity,
      // :invalid CSS pseudo-class, browser tooltip) reflects the same state.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const internals: ElementInternals | undefined = (this as any)._internals;
      if (internals) {
        if (isValid) {
          internals.setValidity({}, '');
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const msg: string = (this as any).validityMessage || 'Invalid value';
          internals.setValidity(flags, msg);
        }
      }

      if (isValid) {
        // Only clear status if it was previously set to 'invalid' by the constraint
        // API. Do not override an explicit 'valid' set by the parent/framework.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((this as any).status === 'invalid') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this as any).status = 'default';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this as any).validityMessage = '';
        }
      } else {
        // Fire cancelable 'invalid' — mirrors native form element behaviour.
        // Cancelable so consumers can suppress browser tooltip and show their own.
        // bubbles: false — matches native <input> 'invalid' event.
        // composed: false — stays within the document, does not cross shadow boundaries.
        const proceed = this.dispatchEvent(
          new Event('invalid', { bubbles: false, cancelable: true, composed: false })
        );
        if (proceed) {
          // Only set status='invalid' if the event was not cancelled.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this as any).status = 'invalid';
        }
      }

      return isValid;
    }

    reportValidity(): boolean {
      // Prefer ElementInternals.reportValidity() — it triggers native browser UI
      // (tooltip near the field). Falls back to checkValidity() if internals not set.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const internals: ElementInternals | undefined = (this as any)._internals;
      if (internals) {
        // Must sync validity state first so the browser has something to show.
        this.checkValidity();
        return internals.reportValidity();
      }
      return this.checkValidity();
    }

    setCustomValidity(message: string): void {
      const hasError = Boolean(message);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).status = hasError ? 'invalid' : 'default';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).validityMessage = message;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const internals: ElementInternals | undefined = (this as any)._internals;
      if (internals) {
        internals.setValidity(
          hasError ? { customError: true } : {},
          hasError ? message : ''
        );
      }
    }
  }

  // Cast required: TypeScript cannot reconcile LitElement's private fields
  // with the anonymous class return type. Same pattern as FocusableMixin.
  return ValidityMixinClass as unknown as T & Constructor<ValidityInterface>;
}
