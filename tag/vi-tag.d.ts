import { TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
export type TagVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'contrast';
export type TagAppearance = 'subtle' | 'outline' | 'solid';
export type TagSize = 'xs' | 'sm' | 'md' | 'lg';
/**
 * vi-tag
 *
 * An interactive, highly customizable label/chip supporting status dots,
 * avatars, selectable filter states, counts, and dismissible remove buttons.
 * Reuses `<vi-button>` and `<vi-icon>` for design system consistency.
 *
 * @element vi-tag
 *
 * @attr {string} variant - Colour variant ('neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'contrast')
 * @attr {string} appearance - Visual style ('subtle' | 'outline' | 'solid')
 * @attr {string} size - Tag size ('xs' | 'sm' | 'md' | 'lg')
 * @attr {boolean} pill - Renders fully rounded pill shape (9999px radius)
 * @attr {boolean} dot - Renders a status dot indicator prefix
 * @attr {number} count - Numeric counter badge suffix
 * @attr {boolean} removable - Shows a removable button
 * @attr {boolean} selectable - Enables interactive selection toggle mode
 * @attr {boolean} selected - Active selected state
 * @attr {boolean} disabled - Disables interactions
 *
 * @slot - Default slot for tag label text
 * @slot icon - Leading icon slot
 * @slot avatar - Avatar image/thumbnail slot
 * @slot suffix - Suffix element slot (after label/count)
 *
 * @fires vi-tag-remove - Fired when remove button is clicked or Delete/Backspace key is pressed.
 * @fires vi-tag-select - Fired when tag is clicked in selectable mode.
 *
 * @csspart tag - The tag container `<span>`
 * @csspart icon - Leading icon slot wrapper
 * @csspart avatar - Avatar slot wrapper
 * @csspart label - Label text wrapper
 * @csspart count - Counter badge wrapper
 * @csspart remove-btn - The remove button wrapper
 */
export declare class ViTag extends ViElement {
    static styles: import('lit').CSSResult;
    /** Colour variant */
    accessor variant: TagVariant;
    /** Visual appearance mode */
    accessor appearance: TagAppearance;
    /** Size scale */
    accessor size: TagSize;
    /** Fully rounded pill shape (9999px radius) */
    accessor pill: boolean;
    /** Status dot indicator prefix */
    accessor dot: boolean;
    /** Suffix count badge value */
    accessor count: number | undefined;
    /** Show remove button */
    accessor removable: boolean;
    /** Interactive selectable filter mode */
    accessor selectable: boolean;
    /** Selected/active state */
    accessor selected: boolean;
    /** Disable interactions */
    accessor disabled: boolean;
    private static _iconsRegistered;
    connectedCallback(): void;
    private _handleTagClick;
    private _handleRemoveClick;
    private _handleKeyDown;
    private _handleSlotChange;
    private _fireRemoveEvent;
    private get _removeLabel();
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-tag': ViTag;
    }
}
//# sourceMappingURL=vi-tag.d.ts.map