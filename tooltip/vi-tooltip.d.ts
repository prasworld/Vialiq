import { PropertyValues, TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
import { ComputePositionConfig } from '@floating-ui/dom';
export type TooltipPlacement = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right';
export type TooltipTrigger = 'hover focus' | 'hover' | 'focus' | 'click';
/**
 * vi-tooltip
 *
 * A floating hint providing supplementary info on hover or focus using Floating UI.
 *
 * **Developer Notes & Architecture:**
 * - **Positioning Strategy**: Tooltips always use `strategy: absolute` natively, but users can override this via the `popper-options` property if they need `fixed` hoisting to escape tight containers.
 * - **Z-Index**: `OverlayManager` guarantees tooltips render above modals and dropdowns.
 * - **Accessibility**: Automatically calculates whether its slotted content is interactive (contains links/buttons). If so, it uses `aria-details`; if plain text, it uses `aria-describedby`.
 * - **Teleportation**: `vi-tooltip` does **not** teleport its floating panel to `document.body`. This is an explicit design choice to preserve Shadow DOM encapsulation for the `<slot name="content">` and scoped styling.
 *
 * @element vi-tooltip
 * @attr content - Plain text tooltip content
 * @attr placement - Preferred position: top | top-start | top-end | bottom | bottom-start | bottom-end | left | right (default: top)
 * @attr trigger - Events that trigger: hover focus | hover | focus | click (default: hover focus)
 * @attr delay - Show delay in ms (default: 500)
 * @attr hide-delay - Hide delay in ms (default: 100)
 * @attr max-width - Max width of tooltip in px (default: 240)
 * @attr disabled - Suppress display of tooltip
 * @attr popper-options - Custom options passed directly to Floating UI's computePosition.
 *
 * @slot - Trigger element
 * @slot content - Rich/interactive tooltip content
 *
 * @csspart tooltip - Floating tooltip panel
 * @csspart content - Tooltip content container
 * @csspart arrow - Arrow pointer
 */
export declare class ViTooltip extends ViElement {
    static styles: import('lit').CSSResult;
    accessor content: string;
    accessor placement: TooltipPlacement;
    accessor trigger: TooltipTrigger;
    accessor delay: number;
    accessor hideDelay: number;
    accessor maxWidth: number;
    accessor disabled: boolean;
    /**
     * Custom options passed directly to Floating UI's computePosition.
     * Note: the `popper-options` attribute only supports JSON-serializable values;
     * middleware functions must be set via the `popperOptions` property.
    */
    accessor popperOptions: Partial<ComputePositionConfig>;
    private accessor _open;
    private accessor _isInteractive;
    private accessor _tooltipPanel;
    private accessor _defaultSlot;
    private accessor _contentSlot;
    private _showTimeout?;
    private _hideTimeout?;
    private _triggerElement;
    private _cleanupAutoUpdate?;
    private _overlayZIndex;
    private _panelId;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected firstUpdated(): void;
    updated(changed: PropertyValues): void;
    /** Force show the tooltip */
    show(): void;
    /** Force hide the tooltip */
    hide(immediate?: boolean): void;
    private _openTooltip;
    private _closeTooltip;
    private _clearTimeouts;
    private _handleSlotChange;
    private _updateTriggerElement;
    private _hasInteractiveContent;
    private _updateTriggerAria;
    private _removeTriggerAria;
    private _onPointerEnter;
    private _onPointerLeave;
    private _onFocusIn;
    private _onFocusOut;
    private _onClick;
    private _onKeyDown;
    private _handleDocumentClick;
    private _positionTooltip;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-tooltip': ViTooltip;
    }
}
//# sourceMappingURL=vi-tooltip.d.ts.map