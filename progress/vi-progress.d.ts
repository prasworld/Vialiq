import { LitElement } from 'lit';
export type ProgressType = 'line' | 'circle' | 'dashboard';
export type ProgressVariant = 'primary' | 'success' | 'error' | 'warning';
export type ProgressSize = 'sm' | 'md' | 'lg';
export type ProgressStatus = 'normal' | 'active' | 'exception' | 'success';
export type StrokeLinecap = 'round' | 'butt' | 'square';
export type ProgressGapPosition = 'top' | 'bottom' | 'left' | 'right';
/**
 * @element vi-progress
 * @slot info - Optional slot to provide custom content instead of the standard percentage text
 *
 * @cssprop [--vi-progress-track-bg] - Background color of the track
 * @cssprop [--vi-progress-indicator-bg] - Color of the filled indicator
 * @cssprop [--vi-progress-text-color] - Color of the info text
 * @cssprop [--vi-progress-border-radius] - Border radius for track and indicator
 * @cssprop [--vi-progress-line-height] - Height for the line variant
 * @cssprop [--vi-progress-circle-size] - Diameter for the circle variant
 */
export declare class ViProgress extends LitElement {
    static styles: import('lit').CSSResult;
    private _gradId;
    /** Current progress value (0 to max) */
    accessor value: number;
    /** Maximum progress value */
    accessor max: number;
    /** Visual type of the progress bar */
    accessor type: ProgressType;
    /** Semantic color variant */
    accessor variant: ProgressVariant;
    /** Visual size */
    accessor size: ProgressSize;
    /** Status overrides behavior and variant (normal, active, exception, success) */
    accessor status: ProgressStatus;
    /** Whether to show the info text/icon alongside the progress */
    accessor showInfo: boolean;
    /** SVG stroke linecap for circle or border-radius handling for line */
    accessor strokeLinecap: StrokeLinecap;
    /** Number of steps for a segmented progress bar */
    accessor steps: number | undefined;
    /** Value for secondary success segment */
    accessor successPercent: number;
    /** Custom stroke color (string or gradient object) */
    accessor strokeColor: string | Record<string, string> | undefined;
    /** Custom trail color */
    accessor trailColor: string | undefined;
    /** Custom stroke width (in px) */
    accessor strokeWidth: number | undefined;
    /** Width for circle/dashboard in px */
    accessor width: number | undefined;
    /** Gap degree for circle/dashboard (0-360) */
    accessor gapDegree: number | undefined;
    /** Gap position for circle/dashboard */
    accessor gapPosition: ProgressGapPosition | undefined;
    /** Formatter for percentage text */
    accessor format: ((percent: number) => string) | undefined;
    /** Forwarded aria-label for accessibility */
    accessor ariaLabel: string | null;
    private get baseStyles();
    private get percentage();
    private get effectiveStatus();
    private get effectiveVariant();
    private renderInfo;
    private renderLine;
    private renderSteps;
    private renderCircle;
    render(): import('lit-html').TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-progress': ViProgress;
    }
}
//# sourceMappingURL=vi-progress.d.ts.map