import { LitElement, html, TemplateResult, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';

import styles from './vi-modal-footer.scss?inline';

@customElement('vi-modal-footer')
export class ViModalFooter extends LitElement {
  static override styles = unsafeCSS(styles);

  override render(): TemplateResult {
    return html`
      <footer part="footer" class="modal-footer">
        <slot></slot>
      </footer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-modal-footer': ViModalFooter;
  }
}
