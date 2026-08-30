import { LitElement, html, svg, unsafeCSS, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import styles from './vi-progress.scss?inline';

// Import icons
import '../icons/vi-icon';
import { registerIcons } from '../icons/registry.js';
import { checkIcon, xIcon, checkCircleIcon } from '@vialiq/icons';

registerIcons([checkIcon, xIcon, checkCircleIcon]);

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
@customElement('vi-progress')
export class ViProgress extends LitElement {
  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    // Remove aria-label from host to prevent Axe violations since it's forwarded to the inner progressbar
    if (this.hasAttribute('aria-label')) {
      this.removeAttribute('aria-label');
    }
  }
  static styles = unsafeCSS(styles);

  private _gradId = `vi-grad-${Math.random().toString(36).substring(2, 9)}`;

  /** Current progress value (0 to max) */
  @property({ type: Number }) accessor value = 0;

  /** Maximum progress value */
  @property({ type: Number }) accessor max = 100;

  /** Visual type of the progress bar */
  @property({ type: String, reflect: true }) accessor type: ProgressType = 'line';

  /** Semantic color variant */
  @property({ type: String, reflect: true }) accessor variant: ProgressVariant = 'primary';

  /** Visual size */
  @property({ type: String, reflect: true }) accessor size: ProgressSize = 'md';

  /** Status overrides behavior and variant (normal, active, exception, success) */
  @property({ type: String, reflect: true })  accessor status: ProgressStatus = 'normal';

  /** Whether to show the info text/icon alongside the progress */
  @property({ type: Boolean, attribute: 'show-info' }) accessor showInfo = true;

  /** SVG stroke linecap for circle or border-radius handling for line */
  @property({ type: String, attribute: 'stroke-linecap' }) accessor strokeLinecap: StrokeLinecap = 'round';

  /** Number of steps for a segmented progress bar */
  @property({ type: Number }) accessor steps: number | undefined = undefined;

  /** Value for secondary success segment */
  @property({ type: Number, attribute: 'success-percent' }) accessor successPercent = 0;

  /** Custom stroke color (string or gradient object) */
  @property() accessor strokeColor: string | Record<string, string> | undefined = undefined;

  /** Custom trail color */
  @property({ type: String, attribute: 'trail-color' }) accessor trailColor: string | undefined = undefined;

  /** Custom stroke width (in px) */
  @property({ type: Number, attribute: 'stroke-width' }) accessor strokeWidth: number | undefined = undefined;

  /** Width for circle/dashboard in px */
  @property({ type: Number }) accessor width: number | undefined = undefined;

  /** Gap degree for circle/dashboard (0-360) */
  @property({ type: Number, attribute: 'gap-degree' }) accessor gapDegree: number | undefined = undefined;

  /** Gap position for circle/dashboard */
  @property({ type: String, attribute: 'gap-position' }) accessor gapPosition: ProgressGapPosition | undefined = undefined;

  /** Formatter for percentage text */
  @property({ attribute: false }) accessor format: ((percent: number) => string) | undefined = undefined;

  /** Forwarded aria-label for accessibility */
  @property({ attribute: 'aria-label' }) accessor ariaLabel: string | null = null;

  private get baseStyles() {
    const styles: Record<string, string> = {};
    if (this.strokeColor) {
      if (typeof this.strokeColor === 'string') {
        styles['--vi-progress-indicator-bg'] = this.strokeColor;
      } else {
        // Handle object format: { '0%': 'red', '100%': 'blue' } or { from: 'red', to: 'blue', direction: 'to right' }
        const stops = Object.entries(this.strokeColor)
          .filter(([key]) => key !== 'direction')
          .map(([key, value]) => {
            if (key === 'from') return `${value} 0%`;
            if (key === 'to') return `${value} 100%`;
            return `${value} ${key}`;
          })
          .join(', ');
        const direction = this.strokeColor.direction || 'to right';
        styles['--vi-progress-indicator-bg'] = `linear-gradient(${direction}, ${stops})`;
      }
    }
    if (this.trailColor) {
      styles['--vi-progress-track-bg'] = this.trailColor;
    }
    if (this.strokeWidth !== undefined) {
      styles['--vi-progress-line-height'] = `${this.strokeWidth}px`;
      styles['--vi-progress-circle-stroke-width'] = `${this.strokeWidth}`;
    }
    if (this.width !== undefined && this.type !== 'line') {
      styles['--vi-progress-circle-size'] = `${this.width}px`;
      styles['width'] = `${this.width}px`;
      styles['height'] = `${this.width}px`;
    }
    return styles;
  }

  private get percentage(): number {
    const clampedValue = Math.max(0, Math.min(this.value, this.max));
    return Math.floor((clampedValue / this.max) * 100);
  }

  private get effectiveStatus(): ProgressStatus {
    if (this.status === 'normal' && this.value >= this.max) {
      return 'success';
    }
    return this.status;
  }

  private get effectiveVariant(): ProgressVariant {
    const status = this.effectiveStatus;
    if (status === 'exception') return 'error';
    if (status === 'success') return 'success';
    return this.variant;
  }

  private renderInfo() {
    if (!this.showInfo) {
      return html`<span class="sr-only">${this.percentage}%</span>`;
    }

    const isLine = this.type === 'line';
    const successIcon = isLine ? 'check-circle' : 'check';
    const errorIcon = 'x'; // We'll just style the 'x' with border-radius: 50% to look like a circle

    return html`
      <span part="info" class="vi-progress-info" aria-hidden="true">
        <slot name="info">
          ${this.effectiveStatus === 'exception'
            ? html`<vi-icon name=${errorIcon}></vi-icon>`
            : this.effectiveStatus === 'success'
            ? html`<vi-icon name=${successIcon}></vi-icon>`
            : html`${this.format ? this.format(this.percentage) : this.percentage + '%'}`}
        </slot>
      </span>
    `;
  }

  private renderLine() {
    return html`
      <div class="vi-progress-outer">
        <div part="track" class="vi-progress-track">
          <div
            part="indicator"
            class="vi-progress-indicator"
            style=${styleMap({
              width: `${this.percentage}%`,
              borderRadius: this.strokeLinecap === 'square' || this.strokeLinecap === 'butt' ? '0' : undefined
            })}
          ></div>
          ${this.successPercent > 0
            ? html`<div
                class="vi-progress-success-indicator"
                style=${styleMap({
                  width: `${Math.min(100, Math.max(0, this.successPercent))}%`,
                  borderRadius: this.strokeLinecap === 'square' || this.strokeLinecap === 'butt' ? '0' : undefined
                })}
              ></div>`
            : nothing}
        </div>
      </div>
      ${this.renderInfo()}
    `;
  }

  private renderSteps() {
    const stepsCount = Math.max(1, this.steps!);
    const stepRatio = 100 / stepsCount;
    const currentStep = Math.floor(this.percentage / stepRatio);

    return html`
      <div class="vi-progress-steps">
        ${Array.from({ length: stepsCount }).map((_, i) => {
          const stepStyle = {
            backgroundColor: i < currentStep ? (typeof this.strokeColor === 'string' ? this.strokeColor : 'var(--vi-progress-indicator-bg)') : (this.trailColor || 'var(--vi-progress-track-bg)'),
            height: this.strokeWidth ? `${this.strokeWidth}px` : 'var(--vi-progress-line-height)'
          };
          return html`
          <div class=${classMap({
            'vi-progress-step-item': true,
            'vi-progress-step-item--active': i < currentStep
          })}
          style=${styleMap(stepStyle)}></div>
        `})}
      </div>
      ${this.renderInfo()}
    `;
  }

  private renderCircle() {
    const radius = 47;
    const circumference = 2 * Math.PI * radius;
    const isDashboard = this.type === 'dashboard';
    const gapDeg = this.gapDegree ?? (isDashboard ? 75 : 0);
    const gapPosition = this.gapPosition ?? (isDashboard ? 'bottom' : 'top');
    const gapLength = (gapDeg / 360) * circumference;
    const drawLength = circumference - gapLength;
    
    // Rotate to position the gap correctly
    let rotation = -90; // Default is gap at top (for circle)
    if (isDashboard) {
      if (gapPosition === 'bottom') rotation = 90 + (gapDeg / 2);
      if (gapPosition === 'top') rotation = -90 + (gapDeg / 2);
      if (gapPosition === 'left') rotation = 180 + (gapDeg / 2);
      if (gapPosition === 'right') rotation = 0 + (gapDeg / 2);
    }

    // Gradient parsing
    let gradientDefs: unknown = nothing;
    let circleStrokeColor = typeof this.strokeColor === 'string' ? this.strokeColor : undefined;

    if (this.strokeColor) {
      if (typeof this.strokeColor === 'string' && this.strokeColor.includes('linear-gradient')) {
        const match = this.strokeColor.match(/linear-gradient\(\s*(.*?)\s*,\s*(.*?)\s*,\s*(.*?)\s*\)/);
        if (match) {
          gradientDefs = svg`
            <defs>
              <linearGradient id=${this._gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color=${match[2]} />
                <stop offset="100%" stop-color=${match[3]} />
              </linearGradient>
            </defs>
          `;
          circleStrokeColor = `url(#${this._gradId})`;
        }
      } else if (typeof this.strokeColor === 'object') {
        const stops = Object.entries(this.strokeColor)
          .filter(([key]) => key !== 'direction')
          .map(([key, value]) => {
            let offset = key;
            if (key === 'from') offset = '0%';
            if (key === 'to') offset = '100%';
            return svg`<stop offset=${offset} stop-color=${value} />`;
          });
          
        gradientDefs = svg`
          <defs>
            <linearGradient id=${this._gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              ${stops}
            </linearGradient>
          </defs>
        `;
        circleStrokeColor = `url(#${this._gradId})`;
      }
    }

    // Circular Steps
    if (this.steps !== undefined && this.steps > 0) {
      const stepsCount = this.steps;
      const stepGap = 2; // Fixed gap size in px equivalent
      const numGaps = isDashboard ? (stepsCount - 1) : stepsCount;
      const totalStepGapLength = numGaps * stepGap;
      const stepLength = (drawLength - totalStepGapLength) / stepsCount;
      const stepRatio = 100 / stepsCount;
      const currentStep = Math.ceil(this.percentage / stepRatio);

      const renderCircularStep = (i: number) => {
        const isActive = i < currentStep;
        const offsetAngle = i * (stepLength + stepGap) * (360 / circumference);
        const stepRotation = rotation + offsetAngle;
        
        return svg`
          <circle
            class=${isActive ? 'vi-progress-circle-indicator' : 'vi-progress-circle-track'}
            cx="50" cy="50" r=${radius}
            stroke-linecap=${this.strokeLinecap}
            style=${styleMap({
              strokeDasharray: `${stepLength} ${circumference}`,
              strokeDashoffset: '0',
              transform: `rotate(${stepRotation}deg)`,
              transformOrigin: '50% 50%',
              stroke: isActive && circleStrokeColor ? circleStrokeColor : (!isActive && this.trailColor ? this.trailColor : undefined)
            })}
          />
        `;
      };

      return html`
        <svg viewBox="0 0 100 100" class="vi-progress-circle-svg" style="transform: none;">
          ${gradientDefs}
          ${Array.from({ length: stepsCount }).map((_, i) => renderCircularStep(i))}
        </svg>
        ${this.renderInfo()}
      `;
    }
    
    const offset = drawLength - ((this.percentage / 100) * drawLength);
    const successOffset = drawLength - ((Math.min(100, Math.max(0, this.successPercent)) / 100) * drawLength);

    return html`
      <svg viewBox="0 0 100 100" class="vi-progress-circle-svg" style="transform: rotate(${rotation}deg);">
        ${gradientDefs}
        <circle
          part="track"
          class="vi-progress-circle-track"
          cx="50"
          cy="50"
          r=${radius}
          stroke-linecap=${this.strokeLinecap}
          style=${styleMap({
            strokeDasharray: `${drawLength} ${circumference}`,
            strokeDashoffset: isDashboard ? '0' : undefined
          })}
        />
        <circle
          part="indicator"
          class="vi-progress-circle-indicator"
          cx="50"
          cy="50"
          r=${radius}
          stroke-linecap=${this.strokeLinecap}
          style=${styleMap({
            strokeDasharray: `${drawLength} ${circumference}`,
            strokeDashoffset: `${offset}`,
            stroke: circleStrokeColor
          })}
        />
        ${this.successPercent > 0 ? html`
        <circle
          class="vi-progress-circle-success"
          cx="50"
          cy="50"
          r=${radius}
          stroke-linecap=${this.strokeLinecap}
          style=${styleMap({
            strokeDasharray: `${drawLength} ${circumference}`,
            strokeDashoffset: `${successOffset}`,
          })}
        />` : nothing}
      </svg>
      ${this.renderInfo()}
    `;
  }

  render() {
    const classes = {
      'vi-progress': true,
      [`vi-progress--${this.type}`]: true,
      [`vi-progress--variant-${this.effectiveVariant}`]: true,
      [`vi-progress--size-${this.size}`]: true,
      [`vi-progress--status-${this.effectiveStatus}`]: true,
      'vi-progress--steps': this.steps !== undefined
    };

    return html`
      <div
        part="base"
        class=${classMap(classes)}
        style=${styleMap(this.baseStyles)}
        role="progressbar"
        aria-valuenow=${this.value}
        aria-valuemin="0"
        aria-valuemax=${this.max}
        aria-label=${this.ariaLabel || 'progress'}
      >
        ${this.steps !== undefined && this.type === 'line' 
          ? this.renderSteps() 
          : (this.type === 'line' ? this.renderLine() : this.renderCircle())}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-progress': ViProgress;
  }
}
// Force HMR update
