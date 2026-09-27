import { TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
export type MessageVariant = 'info' | 'success' | 'warning' | 'error' | 'loading';
/**
 * vi-message
 * Ephemeral global feedback message.
 *
 * @element vi-message
 * @attr variant - Colour semantic: info | success | warning | error | loading
 * @attr duration - Auto-dismiss ms; 0 = sticky
 * @attr paused - Timer paused (e.g. on hover)
 */
export declare class ViMessage extends ViElement {
    static styles: import('lit').CSSResult;
    accessor variant: MessageVariant;
    accessor content: string;
    accessor duration: number;
    accessor paused: boolean;
    accessor icon: string;
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
    private get defaultIcon();
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-message': ViMessage;
    }
}
//# sourceMappingURL=vi-message.d.ts.map