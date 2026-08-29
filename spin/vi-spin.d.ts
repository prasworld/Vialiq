import { LitElement, PropertyValues } from 'lit';
export type SpinSize = 'sm' | 'md' | 'lg';
export type SpinVariant = 'arc' | 'dots';
/**
 * A loading spinner component that mimics Ant Design's Spin.
 * It can be used standalone or as a wrapper to overlay and dim content.
 *
 * @slot - Default slot for wrapping content. If content is provided, the spinner acts as an overlay.
 */
export declare class ViSpin extends LitElement {
    static styles: import('lit').CSSResult;
    /**
     * Whether the spinner is active.
     */
    accessor spinning: boolean;
    /**
     * The size of the spinner.
     */
    accessor size: SpinSize;
    /**
     * The variant of the spinner.
     */
    accessor variant: SpinVariant;
    /**
     * Whether the spinner overlays the entire viewport.
     */
    accessor fullscreen: boolean;
    /**
     * Determinate progress percent (0-100). Only applies to arc variant.
     */
    accessor percent: number | undefined;
    /**
     * A text label to display underneath the spinner.
     */
    accessor tip: string | undefined;
    /**
     * Delay in milliseconds before showing the spinner (prevents flashing for fast loads).
     */
    accessor delay: number | undefined;
    accessor shouldRenderSpinning: boolean;
    private delayTimeout?;
    willUpdate(changedProperties: PropertyValues<this>): void;
    private get hasChildren();
    render(): "" | import('lit-html').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-spin': ViSpin;
    }
}
//# sourceMappingURL=vi-spin.d.ts.map