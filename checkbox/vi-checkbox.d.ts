import { PropertyValues, TemplateResult } from 'lit';
import { ControlStatus } from '../base/validity-mixin.js';
import { ViElement } from '../base/vi-element.js';
export type CheckboxSize = 'xs' | 'sm' | 'md' | 'lg';
declare const ViCheckbox_base: typeof ViElement & (new (...args: any[]) => import('../base/focusable-mixin.js').FocusableInterface) & (new (...args: any[]) => import('../base/validity-mixin.js').ValidityInterface<unknown>);
/**
 * vi-checkbox
 * Form-associated checkbox control using Flux UI tokens.
 *
 * NOTE: vi-checkbox is form-associated and participates in form submission and constraint validation.
 * Each checkbox is independently focusable (no roving tabindex / mutual-exclusivity behavior).
 *
 * @element vi-checkbox
 *
 * @attr {boolean} checked       - Checked state of the checkbox
 * @attr {boolean} indeterminate - Indeterminate (partial) state of the checkbox
 * @attr {string} value          - Form submission value when checked (default: 'on')
 * @attr {string} name           - Form field name
 * @attr {boolean} disabled      - Disables the checkbox
 * @attr {boolean} required      - Marks the field as required
 * @attr {ControlStatus} status  - Validation state: 'default' | 'valid' | 'invalid'
 *
 * @slot - Label text/content.
 *
 * @fires {CustomEvent<{checked:boolean; value:string}>} vi-checkbox-change - Fires when user toggles checked state.
 *
 * @csspart box   - The visual checkbox square (custom-drawn box).
 * @csspart check - The SVG checkmark/indeterminate dash container.
 * @csspart label - The label text wrapper.
 */
export declare class ViCheckbox extends ViCheckbox_base {
    static styles: import('lit').CSSResult;
    private _initialChecked;
    protected get _focusableElement(): HTMLInputElement | null;
    accessor status: ControlStatus;
    accessor required: boolean;
    accessor validityMessage: string;
    /** Checked state. */
    accessor checked: boolean;
    /** Indeterminate (partial) state. */
    accessor indeterminate: boolean;
    /** Size scale — controls size, padding, and font-size. */
    accessor size: CheckboxSize;
    /** Form submission value when checked. */
    accessor value: string;
    /** Form field name. */
    accessor name: string;
    /** Disables the checkbox. */
    accessor disabled: boolean;
    protected _testValidity(): Partial<ValidityStateFlags>;
    connectedCallback(): void;
    updated(changed: PropertyValues): void;
    /** Resets value and validation state when the associated form resets. */
    formResetCallback(): void;
    /** Keeps disabled in sync when a containing fieldset or form is disabled. */
    formDisabledCallback(disabled: boolean): void;
    private _onChange;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-checkbox': ViCheckbox;
    }
}
export {};
//# sourceMappingURL=vi-checkbox.d.ts.map