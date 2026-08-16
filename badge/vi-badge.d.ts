import { TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';
/**
 * vi-badge
 * A compact inline indicator used to communicate status, category, or count.
 *
 * @element vi-badge
 * @attr variant - Colour semantic: neutral | primary | success | warning | danger | info (default: neutral)
 * @attr size    - Size: sm | md | lg (default: md)
 * @attr dot     - Show coloured dot instead of text
 * @attr pill    - Fully rounded (pill shape) vs. square (default: true)
 * @attr count   - Numeric count to display
 * @attr max     - Max count before showing {max}+
 * @attr outline - Outlined/ghost style
 *
 * @slot         - Badge text content
 * @slot icon    - Optional leading icon
 *
 * @csspart badge - The badge <span> element
 * @csspart dot   - The dot indicator circle
 * @csspart icon  - Icon slot wrapper
 */
export declare class ViBadge extends ViElement {
    static styles: import('lit').CSSResult;
    /** Colour semantic */
    accessor variant: BadgeVariant;
    /** Size */
    accessor size: BadgeSize;
    /** Show coloured dot */
    accessor dot: boolean;
    /** Fully rounded (pill shape) vs. square */
    accessor pill: boolean;
    /** Numeric count to display */
    accessor count: number | undefined;
    /** Show the badge even if the count is zero */
    accessor showZero: boolean;
    /** Max count before showing {max}+ */
    accessor max: number;
    /** Outlined/ghost style */
    accessor outline: boolean;
    private accessor _hasIcon;
    private accessor _hasDefaultSlot;
    connectedCallback(): void;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    private updateAriaHidden;
    private onIconSlotChange;
    private onDefaultSlotChange;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-badge': ViBadge;
    }
}
//# sourceMappingURL=vi-badge.d.ts.map