import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('vi-select-group')
export class ViSelectGroup extends LitElement {
  /** The label text for the group header. */
  @property({ type: String }) label = '';

  // Instead of shadow DOM styling, we'll let the Light DOM style it or just use simple shadow DOM
  // Wait, vi-select relies on slots and styling. Let's provide basic CSS inline or use external.
  // Actually, we'll import styles from vi-select.scss or similar if needed.
  // Let's just create a basic render.

  override render() {
    return html`
      <style>
        :host {
          display: block;
        }
        .select-group-header {
          padding: 8px 16px;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--vi-color-text-secondary, #6b7280);
          font-weight: 600;
          letter-spacing: 0.05em;
        }
      </style>
      <div class="select-group">
        ${this.label ? html`<div class="select-group-header" part="header">${this.label}</div>` : ''}
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-select-group': ViSelectGroup;
  }
}
