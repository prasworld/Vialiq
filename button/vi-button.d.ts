import { PropertyValues, TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
/**
 * Button visual variant.
 * Defined here, not in ViElement — each component owns its variant type
 * (functional composition, not inheritance). Different components may
 * support different subsets of these values.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'ghost';
/**
 * Button size scale. Controls padding and font-size via CSS custom properties.
 * xs → sm → md (default) → lg
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
/**
 * Icon placement relative to the label.
 * 'start' (default) places the icon before the text; 'end' places it after.
 * Controlled via CSS `order` — no extra wrapper elements needed.
 */
export type ButtonIconPlacement = 'start' | 'end';
declare const ViButton_base: typeof ViElement & (new (...args: any[]) => import('../base/focusable-mixin.js').FocusableInterface);
/**
 * vi-button
 * Self-styled button component using Flux UI token fallbacks.
 *
 * @element vi-button
 * @attr variant        - Visual variant: primary | secondary | danger | success | info
 * @attr size           - Size scale: xs | sm | md | lg (default: md)
 * @attr icon-placement - Icon slot position: start | end (default: start)
 * @attr disabled       - Disables the button
 * @attr full-width     - Stretches button to fill its container
 * @attr icon-only      - Styles the button for an icon-only layout
 *
 * @slot           - Button label (text / content)
 * @slot icon      - A single icon (vi-icon or any inline SVG)
 *
 * @csspart button - The inner <button> element
 * @csspart icon   - The icon slot wrapper
 * @csspart label  - The label span
 */
export declare class ViButton extends ViButton_base {
    static styles: import('lit').CSSResult;
    protected get _focusableElement(): HTMLButtonElement | null;
    /** Visual variant. */
    accessor variant: ButtonVariant;
    /** Size scale — controls padding and font-size. */
    accessor size: ButtonSize;
    /** Icon placement: 'start' (before label) or 'end' (after label). CSS order handles it — no DOM changes on toggle. */
    accessor iconPlacement: ButtonIconPlacement;
    /** When true, stretches the button to fill the width of its container. */
    accessor fullWidth: boolean;
    /** When true, styles the button for an icon-only layout (typically square with equal padding). */
    accessor iconOnly: boolean;
    /** Disables the button. */
    accessor disabled: boolean;
    /** The button type — 'button', 'submit', or 'reset'. Forwarded to the inner native button. */
    accessor type: 'button' | 'submit' | 'reset';
    /** Accessible label forwarded to the inner native button. */
    accessor ariaLabel: string | null;
    private accessor _hasIcon;
    updated(changed: PropertyValues): void;
    private onIconSlotChange;
    private onClick;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-button': ViButton;
    }
}
export {};
//# sourceMappingURL=vi-button.d.ts.map