import { LitElement } from 'lit';
type Constructor<T = object> = new (...args: any[]) => T;
/**
 * Generic shape of value types supported by form controls.
 */
export type DefaultValueType = string | string[] | number | boolean | File | FileList | unknown;
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
    _syncValidity(): void;
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
    formStateRestoreCallback(state: string | File | FormData | null, reason: string): void;
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
export declare function ValidityMixin<V = DefaultValueType, T extends Constructor<LitElement> = Constructor<LitElement>>(Base: T): T & Constructor<ValidityInterface<V>>;
export {};
//# sourceMappingURL=validity-mixin.d.ts.map