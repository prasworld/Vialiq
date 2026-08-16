import { PropertyValues, TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
export type ChipVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type ChipSize = 'sm' | 'md' | 'lg';
declare const ViChip_base: typeof ViElement & (new (...args: any[]) => import('../base/focusable-mixin.js').FocusableInterface);
/**
 * vi-chip
 * An interactive pill/chip component representing a discrete value.
 *
 * @element vi-chip
 * @attr value     - Value for group selection tracking
 * @attr selected  - Selected / active state
 * @attr disabled  - Chip is not interactive
 * @attr removable - Show × remove button
 * @attr variant   - Base colour: neutral | primary | success | warning | danger | info (default: neutral)
 * @attr size      - Chip size: sm | md | lg (default: md)
 *
 * @slot               - Chip label text
 * @slot avatar        - Leading avatar image or initials
 * @slot icon          - Leading icon (used when no avatar)
 * @slot trailing-icon - Trailing icon (separate from remove button)
 *
 * @csspart chip          - The <button> or <div> root
 * @csspart avatar        - Avatar slot wrapper
 * @csspart icon          - Leading icon slot wrapper
 * @csspart label         - Label text span
 * @csspart trailing-icon - Trailing icon slot wrapper
 * @csspart remove-btn    - × remove button
 * @csspart check-icon    - Checkmark when selected
 *
 * @fires vi-chip-select - Fired when the chip is clicked / activated
 * @fires vi-chip-remove - Fired when the × remove button is clicked
 */
export declare class ViChip extends ViChip_base {
    static styles: import('lit').CSSResult;
    protected get _focusableElement(): HTMLElement | null;
    /** Value for group selection tracking. */
    accessor value: string;
    /** Selected / active state. */
    accessor selected: boolean;
    /** Disables the chip. */
    accessor disabled: boolean;
    /** Show × remove button. */
    accessor removable: boolean;
    /** Screen reader text for the remove button (default: 'Remove') */
    accessor removeAriaLabel: string;
    /** Base colour. */
    accessor variant: ChipVariant;
    /** Chip size. */
    accessor size: ChipSize;
    private accessor _inGroup;
    private accessor _hasAvatar;
    private accessor _hasIcon;
    private accessor _hasTrailingIcon;
    connectedCallback(): void;
    firstUpdated(changed: PropertyValues): void;
    updated(changed: PropertyValues): void;
    private _syncSlotsFromLightDom;
    private _syncSlots;
    private onAvatarSlotChange;
    private onIconSlotChange;
    private onTrailingIconSlotChange;
    private _handleSelect;
    private _handleRemove;
    private _handleKeyDown;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-chip': ViChip;
    }
}
export {};
//# sourceMappingURL=vi-chip.d.ts.map