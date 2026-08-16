import { TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
export type AlertVariant = 'info' | 'success' | 'warning' | 'danger' | 'neutral';
/**
 * vi-alert
 * A persistent inline status message displayed within the page layout.
 *
 * @element vi-alert
 * @attr variant - Colour semantic: info | success | warning | danger | neutral (default: info)
 * @attr title   - Bold headline (optional)
 * @attr open - Controls alert visibility (default: true)
 * @attr floating - Positions alert absolutely over parent container (100% width)
 * @attr dismissible - Show × dismiss button
 * @attr icon    - Override the default status icon name
 * @attr no-icon - Hide the icon
 *
 * @slot         - Alert body content (text or rich HTML)
 * @slot title   - Override title
 * @slot icon    - Custom icon
 * @slot actions - Action buttons or links
 *
 * @csspart alert   - Root element
 * @csspart icon    - Status icon wrapper
 * @csspart content - Title + body column
 * @csspart title   - Title span
 * @csspart body    - Default slot wrapper
 * @csspart actions - Actions slot wrapper
 * @csspart close-btn - × dismiss button
 *
 * @fires vi-alert-show - Fired when the alert is shown
 * @fires vi-alert-close - Fired when the alert is dismissed
 */
export declare class ViAlert extends ViElement {
    static styles: import('lit').CSSResult;
    /** Colour, icon, ARIA role */
    accessor variant: AlertVariant;
    /** Bold headline (optional) */
    accessor title: string;
    /** Show × dismiss button */
    accessor dismissible: boolean;
    /** Accessible label for the dismiss button */
    accessor dismissLabel: string;
    /**
     * Enables auto-hiding after a duration (default: 5000ms).
     * Note: Setting a positive `duration` or `auto-hide-duration` also implicitly enables auto-hiding.
     */
    accessor autoHide: boolean;
    /** Auto hide duration in milliseconds (default: 5000ms) */
    accessor autoHideDuration: number;
    /**
     * Alias for auto-hide-duration in milliseconds.
     * Setting a positive duration enables auto-hiding automatically.
     */
    accessor duration: number | undefined;
    /** Override the default status icon name */
    accessor icon: string | undefined;
    /** Controls whether the alert is displayed */
    accessor open: boolean;
    /** Position alert absolutely over parent container without pushing layout */
    accessor floating: boolean;
    /** Hide the icon */
    accessor noIcon: boolean;
    private accessor _hasTitleSlot;
    private accessor _hasActionsSlot;
    private _autoHideTimer;
    /** Helper to check whether auto-hide is enabled via boolean toggle or duration setting */
    private get _shouldAutoHide();
    connectedCallback(): void;
    disconnectedCallback(): void;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    private updateRole;
    private get defaultIcon();
    private onTitleSlotChange;
    private onActionsSlotChange;
    private _startAutoHideTimer;
    private _clearAutoHideTimer;
    private _handleOpen;
    private _dismissPromise;
    private handleDismiss;
    /** Programmatically shows the alert */
    show(): Promise<void>;
    /** Programmatically hides/dismisses the alert */
    hide(): Promise<void>;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-alert': ViAlert;
    }
}
//# sourceMappingURL=vi-alert.d.ts.map