import { ViElement } from '../base/vi-element.js';
import { ComputePositionConfig } from '@floating-ui/dom';
export type PopoverPlacement = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right';
export type PopoverTrigger = 'click' | 'hover' | 'focus' | 'contextmenu';
/**
 * vi-popover
 *
 * A floating panel for rich, interactive content.
 *
 * @element vi-popover
 * @attr placement - Preferred position: top | bottom | left | right (default: bottom)
 * @attr trigger - Events that trigger: click | hover | focus | contextmenu (default: click)
 * @attr title - Optional plain text title
 * @attr content - Optional plain text content
 * @attr open - Controls visibility programmatically
 * @attr popper-options - Custom config for Floating UI
 *
 * @slot - Trigger element
 * @slot content - Rich HTML content
 * @slot title - Custom HTML title
 */
export declare class ViPopover extends ViElement {
    static styles: import('lit').CSSResult;
    accessor placement: PopoverPlacement;
    accessor trigger: PopoverTrigger;
    accessor title: string;
    accessor content: string;
    accessor open: boolean;
    accessor popperOptions: Partial<ComputePositionConfig>;
    private accessor _panel;
    private accessor _arrowEl;
    private accessor _defaultSlot;
    private _cleanupFloating?;
    private _triggerElement;
    private _showTimeout?;
    private _hideTimeout?;
    private _contextMenuEvent?;
    connectedCallback(): void;
    disconnectedCallback(): void;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    private _getActualTrigger;
    private _handleSlotChange;
    private _attachTriggerListeners;
    private _detachTriggerListeners;
    private _handleTriggerClick;
    private _handleTriggerKeyDown;
    private _handleContextMenu;
    private _handleDocumentClick;
    private _handleKeyDown;
    private _handleMouseEnter;
    private _handleMouseLeave;
    private _handleFocusIn;
    private _handleFocusOut;
    private _setupPosition;
    private _cleanupPosition;
    accessor accessibleName: string;
    private get _hasTitle();
    render(): import('lit-html').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-popover': ViPopover;
    }
}
//# sourceMappingURL=vi-popover.d.ts.map