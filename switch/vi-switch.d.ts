import { PropertyValues, TemplateResult } from 'lit';
import { ControlStatus } from '../base/validity-mixin.js';
import { ViElement } from '../base/vi-element.js';
export type SwitchSize = 'sm' | 'md' | 'lg';
export type LabelPlacement = 'start' | 'end';
declare const ViSwitch_base: typeof ViElement & (new (...args: any[]) => import('../base/focusable-mixin.js').FocusableInterface) & (new (...args: any[]) => import('../base/validity-mixin.js').ValidityInterface<unknown>);
/**
 * vi-switch
 * Form-associated switch control using Flux UI tokens.
 *
 * @element vi-switch
 *
 * @attr {boolean} checked       - Checked state of the switch
 * @attr {string} value          - Form submission value when checked (default: 'on')
 * @attr {string} name           - Form field name
 * @attr {boolean} disabled      - Disables the switch
 * @attr {string} size           - Visual size of the switch ('sm' | 'md' | 'lg')
 * @attr {string} label-placement - Label position relative to switch ('start' | 'end')
 *
 * @slot - Label text/content.
 * @slot on-label - Optional text inside the track when on
 * @slot off-label - Optional text inside the track when off
 *
 * @fires {CustomEvent<{checked:boolean}>} vi-switch-change - Fires when user toggles checked state.
 *
 * @csspart track - The pill-shaped background
 * @csspart thumb - The sliding circle
 * @csspart label - Label text span
 */
export declare class ViSwitch extends ViSwitch_base {
    static styles: import('lit').CSSResult;
    private _initialChecked;
    protected get _focusableElement(): HTMLInputElement | null;
    accessor status: ControlStatus;
    accessor required: boolean;
    accessor validityMessage: string;
    /** Checked state. */
    accessor checked: boolean;
    /** Size scale — controls size, padding, and font-size. */
    accessor size: SwitchSize;
    /** Label position relative to switch. */
    accessor labelPlacement: LabelPlacement;
    /** Form submission value when checked. */
    accessor value: string;
    /** Form field name. */
    accessor name: string;
    /** Disables the switch. */
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
        'vi-switch': ViSwitch;
    }
}
export {};
//# sourceMappingURL=vi-switch.d.ts.map