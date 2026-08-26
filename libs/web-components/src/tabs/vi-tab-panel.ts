import { css, html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import tabPanelStyles from './vi-tab-panel.scss?inline';

/**
 * `vi-tab-panel`
 *
 * Content pane associated with a `vi-tab`. Visibility is controlled
 * by the parent `vi-tabs` container via the `active` property.
 *
 * @element vi-tab-panel
 *
 * @attr {string}  for  - The `tab-id` of the corresponding `vi-tab`
 * @attr {boolean} lazy - Only render slot content on first activation
 *
 * @slot - Panel content
 * @csspart panel - The `role="tabpanel"` container
 */
@customElement('vi-tab-panel')
export class ViTabPanel extends ViElement {
  static override shadowRootOptions = {
    ...ViElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    ${unsafeCSS(tabPanelStyles)}
  `;

  /** The `tab-id` of the corresponding `vi-tab`. */
  @property({ type: String })
  accessor for = '';

  /**
   * When true, slot content is only stamped on first activation.
   * Subsequent tab switches keep the content alive but hidden.
   */
  @property({ type: Boolean })
  accessor lazy = false;

  /**
   * Whether this panel is currently visible.
   * Managed by vi-tabs — do not set manually.
   */
  @property({ type: Boolean, reflect: true })
  accessor active = false;

  /**
   * Internal flag: once the panel has been activated, lazy content is stamped.
   */
  private _hasBeenActivated = false;

  override updated(): void {
    if (this.active) {
      this._hasBeenActivated = true;
    }
  }

  override render(): TemplateResult {
    const shouldRender = !this.lazy || this._hasBeenActivated;

    return html`
      <div part="panel">
        ${shouldRender ? html`<slot></slot>` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-tab-panel': ViTabPanel;
  }
}
