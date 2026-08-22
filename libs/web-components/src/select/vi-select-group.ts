import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('vi-select-group')
export class ViSelectGroup extends LitElement {
  /** The label text for the group header. */
  @property({ type: String }) accessor label = '';

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
        ${this.label
          ? html`<div class="select-group-header" part="header">
              ${this.label}
            </div>`
          : ''}
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
