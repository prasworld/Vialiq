import { css, html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import '../skeleton/vi-skeleton.js'; // Import skeleton for the loading state
import cardStyles from './vi-card.scss?inline';

/**
 * vi-card
 * A flexible container for grouping related content and actions, utilizing fluid container queries.
 *
 * @element vi-card
 * @attr bordered - Renders a border around the card
 * @attr hoverable - Adds a shadow and border highlight on hover
 * @attr loading - Shows a skeleton loader in the card body
 * @attr size - 'fluid' (default) | 'sm' | 'md' | 'lg'
 *
 * @slot         - Card body content
 * @slot cover   - Slot for the card's top cover image/video
 * @slot title   - Slot for the main card title
 * @slot extra   - Slot for additional elements in the top right header (e.g. actions, tags)
 * @slot footer  - Card footer content
 * @slot actions - Slot for bottom action buttons. Multiple elements will be distributed evenly.
 * @slot loader  - Slot to override the default loading skeleton when `loading` is true
 *
 * @csspart card   - The main card container
 * @csspart cover  - The cover media wrapper
 * @csspart header - The header container
 * @csspart title  - The title wrapper
 * @csspart extra  - The extra actions wrapper
 * @csspart body   - The body container
 * @csspart footer - The footer container
 * @csspart actions - The bottom actions wrapper
 */
@customElement('vi-card')
export class ViCard extends ViElement {
  static override styles = css`${unsafeCSS(cardStyles)}`;

  /** Renders a border around the card */
  @property({ type: Boolean, reflect: true }) accessor bordered = false;

  /** Adds a shadow and border highlight on hover */
  @property({ type: Boolean, reflect: true }) accessor hoverable = false;

  /** Shows a skeleton loader in the card body */
  @property({ type: Boolean, reflect: true }) accessor loading = false;

  /** Controls the padding size scale */
  @property({ type: String, reflect: true }) accessor size: 'fluid' | 'sm' | 'md' | 'lg' = 'fluid';

  override render(): TemplateResult {
    // Classes applied based on attributes
    const classes = {
      'vi-card': true,
      'vi-card--bordered': this.bordered,
      'vi-card--hoverable': this.hoverable,
      [`vi-card--size-${this.size}`]: this.size !== 'fluid',
    };

    // Helper to generate class string
    const classStr = Object.entries(classes)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(' ');

    return html`
      <div class="${classStr}" part="card">
        <!-- Cover Section -->
        <div class="vi-card-cover" part="cover">
          <slot name="cover"></slot>
        </div>

        <!-- Header Section -->
        <div class="vi-card-header" part="header">
          <div class="vi-card-title" part="title">
            <slot name="title"></slot>
          </div>
          <div class="vi-card-extra" part="extra">
            <slot name="extra"></slot>
          </div>
        </div>

        <!-- Body Section -->
        <div class="vi-card-body" part="body">
          ${this.loading ? html`
            <slot name="loader">
              <div class="vi-card-skeleton">
                <div class="vi-card-skeleton-content">
                  <vi-skeleton variant="text" class="vi-card-skeleton-title"></vi-skeleton>
                  <vi-skeleton variant="text"></vi-skeleton>
                  <vi-skeleton variant="text"></vi-skeleton>
                  <vi-skeleton variant="text" class="vi-card-skeleton-short"></vi-skeleton>
                </div>
              </div>
            </slot>
          ` : html`
            <slot></slot>
          `}
        </div>

        <!-- Footer Section -->
        <div class="vi-card-footer" part="footer" style=${this.loading ? 'display: none;' : ''}>
          <slot name="footer"></slot>
        </div>

        <!-- Actions Section -->
        <div class="vi-card-actions" part="actions" style=${this.loading ? 'display: none;' : ''}>
          <slot name="actions"></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-card': ViCard;
  }
}
