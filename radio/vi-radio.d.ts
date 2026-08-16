import { PropertyValues, TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
export type RadioSize = 'xs' | 'sm' | 'md' | 'lg';
declare const ViRadio_base: typeof ViElement & (new (...args: any[]) => import('../base/focusable-mixin.js').FocusableInterface);
/**
 * vi-radio
 * Individual radio option within a vi-radio-group.
 *
 * NOTE: For correct roving tabindex, form submission, and mutual exclusivity,
 * vi-radio should be used inside a vi-radio-group. Standalone usage is supported (e.g. for
 * custom layout structures), but keyboard navigation and form association must be handled manually.
 *
 * @element vi-radio
 * @slot - Label text/content.
 *
 * @csspart circle - The visual outer circle wrapper.
 * @csspart dot - The visual inner dot indicator.
 * @csspart label - The label text span.
 */
export declare class ViRadio extends ViRadio_base {
    static styles: import('lit').CSSResult;
    protected get _focusableElement(): HTMLInputElement | null;
    /** The value this radio represents. */
    accessor value: string;
    /** Selected state (managed by vi-radio-group). */
    accessor checked: boolean;
    /** Disabled state. */
    accessor disabled: boolean;
    /** Shared name for the radio group (synced by parent). */
    accessor name: string;
    /** Size scale. */
    accessor size: RadioSize;
    private get _group();
    /** Computes the effective disabled state based on local state and parent group state. */
    private get _isEffectiveDisabled();
    updated(changed: PropertyValues): void;
    protected _setHostFocusable(enabled: boolean): void;
    private _onChange;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-radio': ViRadio;
    }
}
export {};
//# sourceMappingURL=vi-radio.d.ts.map