import { TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';
export interface ToastAction {
    label: string;
    action: string;
    variant?: 'primary' | 'ghost';
}
/**
 * vi-toast
 * Ephemeral floating notification.
 *
 * @element vi-toast
 * @attr variant - Colour semantic: info | success | warning | danger
 * @attr title   - Bold headline
 * @attr message - Body message text
 * @attr duration - Auto-dismiss ms; 0 = sticky
 * @attr closable - Show close (×) button
 * @attr show-progress - Progress bar shows remaining time
 * @attr paused - Timer and progress bar paused (e.g. on hover)
 */
export declare class ViToast extends ViElement {
    static styles: import('lit').CSSResult;
    accessor variant: ToastVariant;
    accessor title: string;
    accessor message: string;
    accessor duration: number;
    accessor closable: boolean;
    accessor showProgress: boolean;
    accessor paused: boolean;
    accessor closeIcon: string;
    accessor actions: ToastAction[];
    private _timer;
    private _startTime;
    private _remainingTime;
    connectedCallback(): void;
    disconnectedCallback(): void;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    private startTimer;
    private pauseTimer;
    private resumeTimer;
    clearTimer(): void;
    private handleDismiss;
    private handleAction;
    private get defaultIcon();
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-toast': ViToast;
    }
}
//# sourceMappingURL=vi-toast.d.ts.map