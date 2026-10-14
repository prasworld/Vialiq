import { nothing, PropertyValues, TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
export type FloatButtonShape = 'circle' | 'square';
export type FloatButtonType = 'default' | 'primary';
export type FloatButtonSize = 'default' | 'sm';
export type BadgeStatus = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
declare const ViFloatButton_base: typeof ViElement & (new (...args: any[]) => import('../base/focusable-mixin.js').FocusableInterface);
export declare class ViFloatButton extends ViFloatButton_base {
    static styles: import('lit').CSSResult;
    protected get _focusableElement(): HTMLElement | null;
    /** Button geometry shape. */
    accessor shape: FloatButtonShape;
    /** Visual type. */
    accessor type: FloatButtonType;
    /** Size scale. */
    accessor size: FloatButtonSize;
    /** Description text displayed under the icon. */
    accessor description: string | undefined;
    /** Tooltip text. */
    accessor tooltip: string | undefined;
    /** Optional anchor link URL. */
    accessor href: string | undefined;
    /** Target for anchor link. */
    accessor target: string | undefined;
    /** Relationship attribute for anchor link. Enforces noopener noreferrer when target is _blank. */
    accessor rel: string | undefined;
    protected get _effectiveRel(): string | typeof nothing;
    /** Badge count or string label. */
    accessor badge: number | string | undefined;
    /** Badge dot indicator mode. */
    accessor badgeDot: boolean;
    /** Badge semantic status color. */
    accessor badgeStatus: BadgeStatus;
    /** Enables smooth scroll-to-top mode. */
    accessor backTop: boolean;
    /** Scroll distance threshold before backTop button appears. */
    accessor visibilityHeight: number;
    /** Target scrollable container CSS selector or element ID. */
    accessor scrollTarget: string | undefined;
    /** Scroll animation duration in milliseconds (applies to both window and custom scroll targets; 0 for instant). */
    accessor duration: number;
    /** Disabled state. */
    accessor disabled: boolean;
    /** Whether the button participates in sequential tab navigation. Used for roving tabindex in groups. */
    accessor tabbable: boolean;
    /** Reflects if the button is placed inside a <vi-float-button-group>. */
    accessor inGroup: boolean;
    /** Accessible label. */
    accessor ariaLabel: string | null;
    /** Pressed state for toggle button functionality. */
    accessor ariaPressed: string | null;
    /** Popup type (e.g. 'menu', 'dialog') forwarded to inner native button. */
    accessor ariaHasPopup: string | null;
    /** Expanded state forwarded to inner native button. */
    accessor ariaExpanded: string | null;
    /** Internal state tracking back-top visibility below threshold. */
    accessor hiddenBackTop: boolean;
    private accessor _hasSlottedIcon;
    private accessor _hasSlottedTooltip;
    private accessor _hasSlottedDescription;
    private _scrollHandlerBound?;
    private _currentScrollContainer?;
    private _scrollTargetObserver?;
    private _scrollAnimationId?;
    private get _hasSlottedTooltipContent();
    private _handleTooltipSlotChange;
    private get _hasSlottedDescriptionContent();
    private _handleDescriptionSlotChange;
    connectedCallback(): void;
    disconnectedCallback(): void;
    updated(changedProperties: PropertyValues): void;
    private _resolveScrollContainer;
    private _setupScrollListener;
    private _observeForScrollTarget;
    private _disconnectScrollTargetObserver;
    private _cancelScrollAnimation;
    private _teardownScrollListener;
    private _handleScroll;
    private _handleSlotChange;
    private _handleClick;
    private _scrollToTop;
    private _renderBadge;
    private _renderIcon;
    private _renderDescription;
    private _renderButtonContent;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-float-button': ViFloatButton;
    }
}
export {};
//# sourceMappingURL=vi-float-button.d.ts.map