import { PropertyValues, TemplateResult } from 'lit';
import { ControlStatus } from '../base/validity-mixin.js';
import { ViElement } from '../base/vi-element.js';
/**
 * Supported input types.
 * Constrained to the subset that renders as a single-line text field —
 * multi-line (textarea) and specialised pickers (date, color, file) are
 * separate components.
 */
export type InputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number';
export type InputSize = 'xs' | 'sm' | 'md' | 'lg';
declare const ViInput_base: typeof ViElement & (new (...args: any[]) => import('../base/focusable-mixin.js').FocusableInterface) & (new (...args: any[]) => import('../base/validity-mixin.js').ValidityInterface<unknown>);
/**
 * vi-input
 * Form-associated single-line text input using Flux UI token fallbacks.
 *
 * @element vi-input
 *
 * @attr {InputType} type         - Input type (default: text)
 * @attr {string}    placeholder  - Native input placeholder
 * @attr {string}    name         - Form field name
 * @attr {string}    value        - Current value
 * @attr {boolean}   disabled     - Disables the input (reflected)
 * @attr {boolean}   readonly     - Makes the input read-only (reflected)
 * @attr {boolean}   required     - Marks the field as required (reflected)
 * @attr {ControlStatus} status     - Visual state: 'default' | 'valid' | 'invalid' (reflected)
 *
 * @slot helper - Helper text shown below the input.
 *
 * @fires {CustomEvent<{value:string}>} vi-input-input  - Every keystroke. Bubbles, composed.
 * @fires {CustomEvent<{value:string}>} vi-input-change - Value committed (blur). Bubbles, composed.
 * @fires {Event}                       invalid        - Cancelable; fires when checkValidity() fails.
 *
 * @csspart field      - The outer `<div>` wrapper
 * @csspart input      - The native `<input>` element
 * @csspart helper     - The persistent helper slot wrapper
 * @csspart validation - The validation message span (error or success)
 *
 * @cssprop [--vi-input-border-color]              - Border colour (default: `$color-border` token)
 * @cssprop [--vi-input-focus-ring-color]          - Focus ring colour (default: `$color-primary`)
 * @cssprop [--vi-input-background-color]          - Background (default: `$color-background`)
 * @cssprop [--vi-input-text-color]                - Text colour (default: `$color-foreground`)
 * @cssprop [--vi-input-placeholder-color]         - Placeholder colour (default: `$color-grey-400`)
 * @cssprop [--vi-input-helper-color]              - Helper text colour (default: `$color-grey-500`)
 * @cssprop [--vi-input-error-color]               - Error text colour (default: `$color-error`)
 * @cssprop [--vi-input-success-color]             - Success message colour (default: `$color-success`)
 * @cssprop [--vi-input-shape-border-radius]       - Border radius (default: `$border-radius-md`)
 * @cssprop [--vi-input-spacing-padding-block]     - Vertical padding (default: `$spacing-xs`)
 * @cssprop [--vi-input-spacing-padding-inline]    - Horizontal padding (default: `$spacing-sm`)
 * @cssprop [--vi-input-typography-font-size]      - Font size (default: `$font-size-base`)
 */
export declare class ViInput extends ViInput_base {
    static styles: import('lit').CSSResult;
    protected get _focusableElement(): HTMLInputElement | null;
    accessor status: ControlStatus;
    accessor required: boolean;
    accessor validityMessage: string;
    /** Input type. Controls the keyboard/picker on mobile and browser validation hints. */
    accessor type: InputType;
    /** Native input placeholder text. */
    accessor placeholder: string;
    /** Form field name. Submitted with the form when set. */
    accessor name: string;
    /** Current value. Synced to ElementInternals for form participation. */
    accessor value: string;
    /** When true, disables the input and removes it from the tab order. */
    accessor disabled: boolean;
    /** Size scale — controls padding and font-size. */
    accessor size: InputSize;
    /** When true, the value cannot be edited but is still submitted. */
    accessor readonly: boolean;
    /** The accessibility label. */
    accessor ariaLabel: string;
    /** Reference to an element id containing the label. */
    accessor ariaLabelledby: string;
    protected _testValidity(): Partial<ValidityStateFlags>;
    updated(changed: PropertyValues): void;
    /** Resets value and validation state when the associated form resets. */
    formResetCallback(): void;
    /** Keeps disabled in sync when a containing fieldset or form is disabled. */
    formDisabledCallback(disabled: boolean): void;
    private _onInput;
    private _onChange;
    private get _helperContent();
    private get _validationMessage();
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-input': ViInput;
    }
}
export {};
//# sourceMappingURL=vi-input.d.ts.map