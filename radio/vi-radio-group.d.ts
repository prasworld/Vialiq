import { PropertyValues, TemplateResult } from 'lit';
import { ControlStatus } from '../base/validity-mixin.js';
import { ViElement } from '../base/vi-element.js';
import { RadioSize } from './vi-radio.js';
export type RadioGroupOrientation = 'vertical' | 'horizontal';
declare const ViRadioGroup_base: typeof ViElement & (new (...args: any[]) => import('../base/validity-mixin.js').ValidityInterface<unknown>);
/**
 * vi-radio-group
 * Form-associated radio button group container.
 * Manages WAI-ARIA compliant keyboard roving tabindex and selection state.
 *
 * @element vi-radio-group
 *
 * @attr {string}                 value            - Value of the currently selected radio option.
 * @attr {string}                 name             - Shared name for all child radios.
 * @attr {boolean}                disabled         - Disables the entire radio group (reflected).
 * @attr {boolean}                required         - Marks the group as requiring a selection (reflected).
 * @attr {ControlStatus}          status           - Visual status: default | valid | invalid (reflected).
 * @attr {string}                 validity-message - Error message shown when validation fails.
 * @attr {RadioGroupOrientation}  orientation      - Layout direction: vertical | horizontal (reflected).
 *
 * @slot - Child vi-radio elements.
 * @slot label - Text displayed above the group.
 * @slot helper - Helper text displayed below the group.
 *
 * @fires {CustomEvent<{value: string}>} vi-radio-group-change - Dispatched when selection changes. Bubbles, composed.
 * @fires {Event}                        invalid       - Fired when validation check fails.
 */
export declare class ViRadioGroup extends ViRadioGroup_base {
    static styles: import('lit').CSSResult;
    accessor status: ControlStatus;
    accessor required: boolean;
    accessor validityMessage: string;
    /** Currently selected radio's value. */
    accessor value: string;
    /** Shared name for all child radios. */
    accessor name: string;
    /** Disables the entire group. */
    accessor disabled: boolean;
    /** Layout direction of the radio group. */
    accessor orientation: RadioGroupOrientation;
    /** Size scale — controls spacing and propagates to child radios. */
    accessor size: RadioSize;
    /** Allows clearing the selected radio button on double click. */
    accessor allowDblclickClear: boolean;
    private _observer?;
    private _initialValue;
    connectedCallback(): void;
    disconnectedCallback(): void;
    updated(changed: PropertyValues): void;
    /** Resets the value and validation state when the parent form resets. */
    formResetCallback(): void;
    /** Keeps disabled in sync when a containing fieldset/form is disabled. */
    formDisabledCallback(disabled: boolean): void;
    protected _testValidity(): Partial<ValidityStateFlags>;
    private _getRadios;
    private _updateRadios;
    private _handleRadioChecked;
    private _onKeydown;
    private _onDblclick;
    private get _validationMessage();
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-radio-group': ViRadioGroup;
    }
}
export {};
//# sourceMappingURL=vi-radio-group.d.ts.map