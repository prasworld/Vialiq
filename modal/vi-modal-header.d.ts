import { LitElement, TemplateResult } from 'lit';
export declare class ViModalHeader extends LitElement {
    static styles: import('lit').CSSResult;
    /** Title text (or use default slot for complex HTML) */
    accessor title: string;
    /** Header description text */
    accessor description: string;
    /** Whether to show a close "X" button */
    accessor closable: boolean;
    /** Whether to show a maximize/restore button */
    accessor maximizable: boolean;
    /** Current maximized state (bound by parent modal if needed, or visual only) */
    accessor maximized: boolean;
    /** Custom icon name for alert variants */
    accessor icon: string | undefined;
    /** Semantic alert variant to color the icon */
    accessor alertVariant: 'info' | 'success' | 'warning' | 'danger' | undefined;
    /** Close button label for screen readers */
    accessor closeLabel: string;
    /** Accessible label for the maximize button */
    accessor maximizeLabel: string;
    /** Accessible label for the restore button */
    accessor restoreLabel: string;
    private get _defaultIcon();
    private _handleClose;
    private _handleMaximize;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-modal-header': ViModalHeader;
    }
}
//# sourceMappingURL=vi-modal-header.d.ts.map