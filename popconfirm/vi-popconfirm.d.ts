import { ViElement } from '../base/vi-element.js';
import { ButtonVariant } from '../button/vi-button.js';
/**
 * vi-popconfirm
 *
 * A lightweight confirmation dialog built on top of vi-popover.
 *
 * @element vi-popconfirm
 * @attr title - Main confirmation text
 * @attr description - Optional secondary text
 * @attr icon - Icon name (default: warning)
 * @attr ok-text - OK button text (default: OK)
 * @attr cancel-text - Cancel button text (default: Cancel)
 * @attr ok-variant - Variant for OK button (default: primary)
 * @attr cancel-variant - Variant for Cancel button (default: secondary)
 * @attr placement - Preferred position: top | bottom | left | right (default: top)
 * @attr disabled - Suppress the popconfirm
 *
 * @slot - Trigger element
 * @slot title - Rich HTML title
 * @slot description - Rich HTML description
 * @slot icon - Custom icon
 */
export declare class ViPopconfirm extends ViElement {
    static styles: import('lit').CSSResult;
    accessor title: string;
    accessor description: string;
    accessor icon: string;
    accessor okText: string;
    accessor cancelText: string;
    accessor okVariant: ButtonVariant;
    accessor cancelVariant: ButtonVariant;
    accessor placement: string;
    accessor disabled: boolean;
    private accessor _open;
    private accessor _popover;
    private _isActionHandled;
    private _onPopoverShow;
    private _onPopoverHide;
    private _handleCancel;
    private _handleConfirm;
    private get _hasDescription();
    private get _hasTitle();
    render(): import('lit-html').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-popconfirm': ViPopconfirm;
    }
}
//# sourceMappingURL=vi-popconfirm.d.ts.map