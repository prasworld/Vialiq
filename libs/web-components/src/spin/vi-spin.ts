import { html, LitElement, css, unsafeCSS, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import spinStyles from './vi-spin.scss?inline';

export type SpinSize = 'sm' | 'md' | 'lg';
export type SpinVariant = 'arc' | 'dots';

/**
 * A loading spinner component that mimics Ant Design's Spin.
 * It can be used standalone or as a wrapper to overlay and dim content.
 * 
 * @slot - Default slot for wrapping content. If content is provided, the spinner acts as an overlay.
 */
@customElement('vi-spin')
export class ViSpin extends LitElement {
  static styles = css`
    ${unsafeCSS(spinStyles)}
  `;

  /**
   * Whether the spinner is active.
   */
  @property({ type: Boolean }) accessor spinning = true;

  /**
   * The size of the spinner.
   */
  @property({ type: String }) accessor size: SpinSize = 'md';

  /**
   * The variant of the spinner.
   */
  @property({ type: String }) accessor variant: SpinVariant = 'arc';

  /**
   * Whether the spinner overlays the entire viewport.
   */
  @property({ type: Boolean }) accessor fullscreen = false;

  /**
   * Determinate progress percent (0-100). Only applies to arc variant.
   */
  @property({ type: Number }) accessor percent: number | undefined;

  /**
   * A text label to display underneath the spinner.
   */
  @property({ type: String }) accessor tip: string | undefined;

  /**
   * Delay in milliseconds before showing the spinner (prevents flashing for fast loads).
   */
  @property({ type: Number }) accessor delay: number | undefined;

  @state() accessor shouldRenderSpinning = false;
  private delayTimeout?: ReturnType<typeof setTimeout>;

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('spinning') || changedProperties.has('delay')) {
      if (this.delayTimeout) {
        clearTimeout(this.delayTimeout);
        this.delayTimeout = undefined;
      }

      if (this.spinning && this.delay && this.delay > 0) {
        this.shouldRenderSpinning = false;
        this.delayTimeout = setTimeout(() => {
          this.shouldRenderSpinning = true;
        }, this.delay);
      } else {
        this.shouldRenderSpinning = this.spinning;
      }
    }
  }

  private get hasChildren() {
    return Array.from(this.childNodes).some(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE ||
        (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== '')
    );
  }

  render() {
    const isSpinning = this.shouldRenderSpinning;
    const hasChildren = this.hasChildren;

    const spinWrapperClasses = {
      'spin-wrapper': true,
      'spinning': isSpinning,
      [`spin-${this.size}`]: true,
      'spin-fullscreen': this.fullscreen,
    };

    const containerClasses = {
      'spin-container': true,
      'spin-blur': isSpinning,
    };

    const renderIndicator = () => {
      if (this.variant === 'dots') {
        return html`
          <span class="spin-dot">
            <i class="spin-dot-item"></i>
            <i class="spin-dot-item"></i>
            <i class="spin-dot-item"></i>
            <i class="spin-dot-item"></i>
          </span>
        `;
      }
      
      const arcPercent = this.percent !== undefined ? Math.max(0, Math.min(100, this.percent)) : undefined;
      const isDeterminate = arcPercent !== undefined;
      const circumference = 62.83; // 2 * pi * r (10)
      const dashOffset = isDeterminate ? circumference - (arcPercent / 100) * circumference : 0;
      
      const circleStyle = isDeterminate 
        ? { strokeDasharray: `${circumference}`, strokeDashoffset: `${dashOffset}`, transition: 'stroke-dashoffset 0.3s ease 0s' }
        : { strokeDasharray: '20 42', strokeDashoffset: '0' };
        
      const svgClasses = {
        'spin-circle': true,
        'spin-circle-determinate': isDeterminate,
      };
      
      return html`
        <svg viewBox="0 0 24 24" class=${classMap(svgClasses)} xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" style=${styleMap(circleStyle)}></circle>
        </svg>
      `;
    };

    const spinElement = isSpinning
      ? html`
          <div class=${classMap(spinWrapperClasses)} part="wrapper">
            <slot name="indicator">
              ${renderIndicator()}
            </slot>
            ${this.tip ? html`<div class="spin-text" part="tip">${this.tip}</div>` : ''}
          </div>
        `
      : '';

    if (hasChildren) {
      return html`
        <div class="spin-nested-loading" part="nested">
          ${spinElement}
          <div class=${classMap(containerClasses)} part="container">
            <slot></slot>
          </div>
        </div>
      `;
    }

    return spinElement;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-spin': ViSpin;
  }
}
