import { LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

/**
 * Generic shape of value types supported by form controls.
 */
export type DefaultValueType =
  | string
  | string[]
  | number
  | boolean
  | File
  | FileList
  | unknown;

/**
 * Tri-state visual status for form controls.
 *
 * - `'default'` — no validation styling (neutral / untouched)
 * - `'invalid'`  — red border, error colours; set by the form when validation fails
 * - `'valid'`    — green border, success colours; set explicitly by the parent when
 *                  it wants to confirm a correct value (independent of message)
 */
export type ControlStatus = 'default' | 'valid' | 'invalid';

/**
 * Type-only declaration of the shape ValidityMixin adds to a class.
 * `declare class` emits no runtime code — it is a TS-only contract.
 */
export declare class ValidityInterface<V = DefaultValueType> {
  /** Visual/validation state of the control. Reflects as the `[status]` attribute. */
  get status(): ControlStatus;
  set status(value: ControlStatus);

  /** Whether a value is required. Drives the valueMissing validity flag. */
  get required(): boolean;
  set required(value: boolean);

  /** The human-readable validation message displayed in the component UI. */
  get validityMessage(): string;
  set validityMessage(value: string);

  /** The current component value. Read by _testValidity for required check. */
  get value(): V;
  set value(v: V);

  /** ElementInternals instance created by the mixin. */
  protected readonly _internals: ElementInternals;

  /** Checks if the current value satisfies all constraints. Does NOT mutate visual status. */
  checkValidity(): boolean;

  /** Checks validity, updates visual status, AND triggers the browser's built-in validation UI. */
  reportValidity(): boolean;

  /** Sets an arbitrary custom validation message. */
  setCustomValidity(message: string): void;

  /** Returns the ValidityState object from ElementInternals. */
  get validity(): ValidityState;

  /** Returns the current validation message from ElementInternals. */
  get validationMessage(): string;

  /**
   * Whether this element will be validated when the form is submitted.
   * Returns `false` when the element is disabled.
   */
  get willValidate(): boolean;

  /**
   * Returns the ValidityStateFlags describing why the value is invalid.
   * Subclasses MUST override this to provide component-specific validation logic.
   */
  protected _testValidity(): Partial<ValidityStateFlags>;

  /** Internal validity sync — updates `_internals.setValidity()` without changing visual `status` or dispatching events. */
  public _syncValidity(): void;

  /**
   * Returns the element that the browser validation popup should point at.
   * Override in subclasses that wrap a native control (input, textarea, etc.).
   */
  protected _getValidationAnchor(): HTMLElement | undefined;

  /** Called when the associated form is reset. Resets status and validityMessage. */
  formResetCallback(): void;

  /** Called when the form or parent fieldset disabled state changes. */
  formDisabledCallback(disabled: boolean): void;

  /** Called when the browser restores form state (bfcache, autofill). */
  formStateRestoreCallback(
    state: string | File | FormData | null,
    reason: string,
  ): void;
}

/**
 * ValidityMixin
 *
 * Adds the full WHATWG Constraint Validation API and form-associated lifecycle
 * to any Lit element. Consumers only need to:
 *
 *   1. Override `_testValidity()` to return component-specific validity flags.
 *   2. Declare `value`, `name`, and `disabled` as `@property`.
 *   3. Call `_internals.setFormValue()` in their `updated()` lifecycle.
 *
 * The mixin owns: `static formAssociated`, `_internals`, `status`, `required`,
 * `validityMessage`, and all form lifecycle callbacks.
 */
export function ValidityMixin<
  V = DefaultValueType,
  T extends Constructor<LitElement> = Constructor<LitElement>,
>(Base: T): T & Constructor<ValidityInterface<V>> {
  class ValidityMixinClass extends Base {
    // ── Form association ─────────────────────────────────────────────────────

    static formAssociated = true;

    protected readonly _internals = this.attachInternals();

    // ── Shared validation properties ─────────────────────────────────────────
    // These are the "contract" properties that ValidityMixin manages.
    // Consumers no longer need to declare these themselves.

    @property({ reflect: true })
    accessor status: ControlStatus = 'default';

    @property({ type: Boolean, reflect: true })
    accessor required = false;

    @property({ attribute: 'validity-message' })
    accessor validityMessage = '';

    // ── ValidityState getters (WHATWG Constraint Validation API) ──────────────

    /**
     * The ValidityState from ElementInternals.
     * Always reflects the most recent `_testValidity()` result.
     */
    get validity(): ValidityState {
      return this._internals.validity;
    }

    /**
     * The human-readable validation message from ElementInternals.
     * Set by `setValidity()` and `setCustomValidity()`.
     */
    get validationMessage(): string {
      return this._internals.validationMessage;
    }

    /**
     * Whether this control will participate in form validation.
     * Per spec, disabled controls return false (they are not candidates).
     */
    get willValidate(): boolean {
      return (
        !(this as unknown as { disabled?: boolean }).disabled &&
        this._internals.willValidate
      );
    }

    // ── Extension hooks for subclasses ────────────────────────────────────────

    /**
     * Returns ValidityStateFlags describing why the current value is invalid.
     * Return `{}` (empty) when the value is valid.
     *
     * Subclasses MUST override this. The base implementation returns `{}`
     * (always valid) as a safe default.
     */
    protected _testValidity(): Partial<ValidityStateFlags> {
      return {};
    }

    /**
     * Returns the element that browser validation popups should anchor to.
     * Override in subclasses that wrap a native control via FocusableMixin.
     *
     * @example
     *   protected override _getValidationAnchor(): HTMLElement | undefined {
     *     return this._focusableElement ?? undefined;
     *   }
     */
    protected _getValidationAnchor(): HTMLElement | undefined {
      return undefined;
    }

    /**
     * Internal validity check — sets validity on ElementInternals and
     * dispatches the cancelable `invalid` event if invalid.
     * Returns whether the control is valid and whether the event was allowed.
     */
    private _checkValidityAndDispatch(): {
      isValid: boolean;
      proceed: boolean;
    } {
      const flags = this._testValidity();
      const isValid = !Object.values(flags).some(Boolean);
      const anchor = this._getValidationAnchor();

      if (isValid) {
        this._internals.setValidity({});
      } else {
        const msg = this.validityMessage || 'Invalid value';
        if (anchor) {
          this._internals.setValidity(flags, msg, anchor);
        } else {
          this._internals.setValidity(flags, msg);
        }
      }

      let proceed = true;
      if (!isValid) {
        proceed = this.dispatchEvent(
          new Event('invalid', {
            bubbles: false,
            cancelable: true,
            composed: false,
          }),
        );
      }

      return { isValid, proceed };
    }

    /**
     * Checks whether the control satisfies all validity constraints.
     *
     * Per the WHATWG spec, this method:
     * - Evaluates validity via `_testValidity()`
     * - Updates `_internals.setValidity()` so `.validity` is fresh
     * - Dispatches a cancelable `invalid` event if the control is invalid
     * - Returns `true` if valid, `false` otherwise
     *
     * **Does NOT mutate `status`.** Use `reportValidity()` to update
     * the visual state.
     */
    checkValidity(): boolean {
      return this._checkValidityAndDispatch().isValid;
    }

    /**
     * Checks validity, updates the visual `status` (if the `invalid` event
     * was not prevented), and triggers the browser's built-in validation popup.
     *
     * This is the method that should be called when you want the user
     * to see validation feedback.
     */
    reportValidity(): boolean {
      const { isValid, proceed } = this._checkValidityAndDispatch();

      if (isValid) {
        if (this.status === 'invalid') {
          this.status = 'default';
          this.validityMessage = '';
        }
      } else {
        // Only update visual status if the `invalid` event wasn't prevented
        if (proceed) {
          this.status = 'invalid';
        }
      }

      return this._internals.reportValidity();
    }

    /**
     * Sets or clears a custom validation error.
     *
     * - Pass a non-empty string to mark the control as invalid with a custom message.
     * - Pass an empty string to clear the custom error.
     */
    setCustomValidity(message: string): void {
      const hasError = Boolean(message);

      this.status = hasError ? 'invalid' : 'default';
      this.validityMessage = message;

      if (hasError) {
        const anchor = this._getValidationAnchor();
        if (anchor) {
          this._internals.setValidity({ customError: true }, message, anchor);
        } else {
          this._internals.setValidity({ customError: true }, message);
        }
      } else {
        this._internals.setValidity({});
      }
    }

    // ── Auto re-validation (keeps .validity fresh) ───────────────────────────

    /**
     * Silently keeps `_internals.setValidity()` in sync whenever reactive
     * properties change. This ensures `.validity` is always fresh without
     * mutating `status` or dispatching events.
     */
    override updated(changed: PropertyValues): void {
      super.updated(changed);

      if (changed.has('value') || changed.has('required')) {
        this._syncValidity();
      }
    }

    /**
     * Internal validity sync — updates `_internals.setValidity()` without
     * changing visual `status` or dispatching events.
     */
    public _syncValidity(): void {
      const flags = this._testValidity();
      const isValid = !Object.values(flags).some(Boolean);
      const anchor = this._getValidationAnchor();

      if (isValid) {
        this._internals.setValidity({});
      } else {
        const msg = this.validityMessage || 'Invalid value';
        if (anchor) {
          this._internals.setValidity(flags, msg, anchor);
        } else {
          this._internals.setValidity(flags, msg);
        }
      }
    }

    // ── Form lifecycle callbacks ─────────────────────────────────────────────

    /**
     * Called when the associated `<form>` is reset.
     * Resets visual status and validation message.
     *
     * Subclasses should override to also reset their `value` property,
     * then call `super.formResetCallback()`.
     */
    formResetCallback(): void {
      this.status = 'default';
      this.validityMessage = '';
      this._internals.setValidity({});
    }

    /**
     * Called when the form or parent `<fieldset>` disabled state changes.
     * Propagates the disabled state to the element's `disabled` property.
     */
    formDisabledCallback(disabled: boolean): void {
      // All consumers declare `disabled` as @property — set it directly.
      (this as unknown as { disabled: boolean }).disabled = disabled;
    }

    /**
     * Called when the browser restores form state (back/forward cache, autofill).
     * Default implementation handles string values. Override for complex types
     * (arrays, FormData, etc.).
     */
    formStateRestoreCallback(
      state: string | File | FormData | null,
      _reason: string,
    ): void {
      if (typeof state === 'string') {
        (this as unknown as { value: V }).value = state as V;
      }
    }
  }

  return ValidityMixinClass as unknown as T & Constructor<ValidityInterface<V>>;
}
