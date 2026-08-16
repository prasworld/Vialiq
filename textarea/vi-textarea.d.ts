import { PropertyValues, TemplateResult } from 'lit';
import { ControlStatus } from '../base/validity-mixin.js';
import { ViElement } from '../base/vi-element.js';
export type TextareaResize = 'none' | 'vertical' | 'both';
declare const ViTextarea_base: typeof ViElement & (new (...args: any[]) => import('../base/focusable-mixin.js').FocusableInterface) & (new (...args: any[]) => import('../base/validity-mixin.js').ValidityInterface<unknown>);
/**
 * vi-textarea
 * Form-associated multi-line text input using Flux UI token fallbacks.
 *
 * @element vi-textarea
 *
 * @attr {string}         placeholder  - Native textarea placeholder
 * @attr {string}         name         - Form field name
 * @attr {string}         value        - Current text value (reflected)
 * @attr {number}         rows         - Initial visible text lines
 * @attr {number}         maxlength    - Character limit
 * @attr {boolean}        disabled     - Disables the input (reflected)
 * @attr {boolean}        readonly     - Makes the input read-only (reflected)
 * @attr {boolean}        required     - Marks the field as required (reflected)
 * @attr {TextareaResize} resize       - CSS resize direction: 'none' | 'vertical' | 'both' (reflected)
 * @attr {ControlStatus}  status       - Visual state: 'default' | 'valid' | 'invalid' (reflected)
 * @attr {string}         validity-message - Error or success message
 * @attr {boolean}        char-count   - Show character counter
 *
 * @slot helper - Helper text shown below the textarea
 *
 * @fires {CustomEvent<{value:string}>} vi-textarea-input  - Triggered on every keystroke. Bubbles, composed.
 * @fires {CustomEvent<{value:string}>} vi-textarea-change - Triggered on blur (committed value). Bubbles, composed.
 * @fires {Event}                       invalid        - Fired when checkValidity() fails.
 *
 * @csspart field        - The outer `<div>` wrapper
 * @csspart textarea     - The native `<textarea>` control
 * @csspart helper       - The helper slot wrapper
 * @csspart validation   - The validation alert message span
 * @csspart char-counter - The character counter display span
 */
export declare class ViTextarea extends ViTextarea_base {
    static styles: import('lit').CSSResult;
    protected get _focusableElement(): HTMLTextAreaElement | null;
    accessor status: ControlStatus;
    accessor required: boolean;
    accessor validityMessage: string;
    /** Native textarea placeholder text. */
    accessor placeholder: string;
    /** Form field name. Submitted with form data when set. */
    accessor name: string;
    /** Current text value. */
    accessor value: string;
    /** Initial visible lines of text. */
    accessor rows: number;
    /** Maximum character length. */
    accessor maxlength: number | null;
    /** Controls textarea resize handle orientation. */
    accessor resize: TextareaResize;
    /** When true, disables the textarea and removes it from the tab order. */
    accessor disabled: boolean;
    /** When true, the value cannot be modified by the user. */
    accessor readonly: boolean;
    /** Enables displaying a character counter (requires maxlength to be set). */
    accessor charCount: boolean;
    /** The accessibility label. */
    accessor ariaLabel: string;
    /** Reference to an element ID containing the label. */
    accessor ariaLabelledby: string;
    protected _testValidity(): Partial<ValidityStateFlags>;
    updated(changed: PropertyValues): void;
    /** Resets value and validation state when the parent form resets. */
    formResetCallback(): void;
    /** Keeps disabled in sync when containing fieldset/form state changes. */
    formDisabledCallback(disabled: boolean): void;
    private _onInput;
    private _onChange;
    private get _helperContent();
    private get _validationMessage();
    private get _charCounter();
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-textarea': ViTextarea;
    }
}
export {};
//# sourceMappingURL=vi-textarea.d.ts.map