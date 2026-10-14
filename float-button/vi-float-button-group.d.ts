import { PropertyValues, TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
import { FloatButtonShape } from './vi-float-button.js';
export type FloatButtonGroupTrigger = 'click' | 'hover';
/**
 * vi-float-button-group
 * Speed-dial cluster container for multiple floating action buttons.
 *
 * @element vi-float-button-group
 * @attr shape - Geometry shape inherited by children: circle | square (default: circle)
 * @attr trigger - Interaction mode to expand menu: click | hover (default: hover)
 * @attr open - Expanded menu state
 * @attr close-icon - Icon name or fallback when menu is expanded
 *
 * @slot - Child <vi-float-button> items
 * @slot icon - Trigger icon (collapsed state)
 * @slot close-icon - Custom close icon (expanded state)
 * @slot description - Trigger description label
 *
 * @csspart group - Group container
 * @csspart trigger - Main toggle trigger button
 * @csspart menu - Speed dial menu container
 *
 * @fires vi-float-button-open-change - Dispatched when menu open state changes
 */
export declare class ViFloatButtonGroup extends ViElement {
    static styles: import('lit').CSSResult;
    /** Geometry shape passed to child buttons. */
    accessor shape: FloatButtonShape;
    /** Interaction trigger mode. */
    accessor trigger: FloatButtonGroupTrigger;
    /** Expanded state. */
    accessor open: boolean;
    /** Icon displayed on the trigger button when expanded. */
    accessor closeIcon: string;
    /** Whether clicking a menu action item closes the speed dial menu. */
    accessor closeOnSelect: boolean;
    /** Accessible label for the group. */
    accessor ariaLabel: string | null;
    private accessor _hasSlottedIcon;
    private accessor _hasSlottedCloseIcon;
    /**
     * When true, the next `updated()` cycle will focus the first menu item.
     * This avoids calling focus() before Lit has reflected the [open] attribute
     * (which controls CSS visibility).
     */
    private _pendingFocusOnOpen;
    /**
     * Tracks previously assigned menu items so that when a child is removed from the
     * group (or on group teardown), its standalone state can be restored.
     */
    private _previousMenuItems;
    private _restoreChild;
    private _handleDocumentClick;
    private _handleMenuItemClick;
    connectedCallback(): void;
    disconnectedCallback(): void;
    updated(changedProperties: PropertyValues): void;
    private _syncChildrenProps;
    private _getAllMenuItems;
    private _getMenuItems;
    private _updateTabbableItems;
    private _setActiveItem;
    private _handleFocusIn;
    private _handleSlotChange;
    private _handleTriggerClick;
    private _handleMouseEnter;
    private _handleMouseLeave;
    private _handleKeyDown;
    private _handleIconSlotChange;
    private _handleCloseIconSlotChange;
    private _renderTriggerIcon;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-float-button-group': ViFloatButtonGroup;
    }
}
//# sourceMappingURL=vi-float-button-group.d.ts.map