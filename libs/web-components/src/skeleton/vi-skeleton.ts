import { css, html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ViElement } from '../base/vi-element.js';
import skeletonStyles from './vi-skeleton.scss?inline';

export type ViSkeletonVariant = 'text' | 'circle' | 'rect';
export type ViSkeletonAnimation = 'shimmer' | 'pulse' | 'none';

/**
 * vi-skeleton
 * An atomic placeholder component used before content is loaded.
 *
 * @element vi-skeleton
 * @attr variant - The shape of the skeleton ('text' | 'circle' | 'rect')
 * @attr animation - The animation style ('shimmer' | 'pulse' | 'none')
 *
 * @csspart skeleton - The main skeleton block
 * 
 * @cssprop --vi-skeleton-width - Width of the skeleton
 * @cssprop --vi-skeleton-height - Height of the skeleton
 * @cssprop --vi-skeleton-radius - Border radius of the skeleton
 */
@customElement('vi-skeleton')
export class ViSkeleton extends ViElement {
  static override styles = css`${unsafeCSS(skeletonStyles)}`;

  /** The shape of the skeleton */
  @property({ type: String, reflect: true }) accessor variant: ViSkeletonVariant = 'text';

  /** The animation style */
  @property({ type: String, reflect: true }) accessor animation: ViSkeletonAnimation = 'shimmer';

  override render(): TemplateResult {
    const classes = {
      'vi-skeleton': true,
      [`vi-skeleton--${this.variant}`]: true,
      [`vi-skeleton--animation-${this.animation}`]: true,
    };

    return html`
      <div class=${classMap(classes)} part="skeleton"></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-skeleton': ViSkeleton;
  }
}
