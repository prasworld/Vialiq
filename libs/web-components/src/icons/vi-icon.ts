import { css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ViElement } from '../base/vi-element.js';
import { type SvgIconDef, getIcon } from './registry.js';

/**
 * vi-icon
 *
 * Renders a named SVG icon from the registry. Icons must be registered first
 * by importing their definition from @vialiq/icons and calling registerIcons():
 *
 *   import { checkIcon } from '@vialiq/icons/check';
 *   import { registerIcons } from '@vialiq/web-components';
 *   registerIcons([checkIcon]);
 *   // <vi-icon name="check"></vi-icon>
 *
 * @element vi-icon
 * @attr name  - The icon name to render (must be registered)
 * @attr size  - Width/height in px (default: 24)
 * @attr label - Accessible label; omit for decorative icons
 */
@customElement('vi-icon')
export class ViIcon extends ViElement {
  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--vi-icon-size, 24px);
      height: var(--vi-icon-size, 24px);
    }

    svg {
      width: 100%;
      height: 100%;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `;

  /**
   * The registered icon name to render.
   * @attr
   */
  @property({ type: String, reflect: true }) accessor name = '';

  /**
   * Size in pixels applied as a CSS custom property.
   * @attr
   */
  @property({ type: Number }) accessor size = 24;

  /**
   * Accessible label. When set the SVG gets role="img" + aria-label.
   * When omitted the icon is treated as decorative (aria-hidden).
   * @attr
   */
  @property({ type: String }) accessor label = '';

  @state() private accessor _icon: SvgIconDef | undefined = undefined;

  override willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);
    if (changedProperties.has('name')) {
      this._icon = getIcon(this.name);
    }
  }

  override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    // Set or clear the inline custom property based on whether the consumer
    // has explicitly provided a size attribute. Clearing on removal ensures
    // a stale inline style does not keep overriding consumer CSS.
    if (changedProperties.has('size')) {
      if (this.hasAttribute('size')) {
        this.style.setProperty('--vi-icon-size', `${this.size}px`);
      } else {
        this.style.removeProperty('--vi-icon-size');
      }
    }
  }

  override firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);
    if (this.hasAttribute('size')) {
      this.style.setProperty('--vi-icon-size', `${this.size}px`);
    }
  }

  override render(): TemplateResult {
    if (!this._icon) {
      // Not registered — render nothing; avoids broken UI silently.
      return html`${nothing}`;
    }

    if (this.label) {
      return html`
        <span role="img" aria-label=${this.label}>
          ${unsafeHTML(this._icon.data)}
        </span>
      `;
    }

    return html`
      <span aria-hidden="true">
        ${unsafeHTML(this._icon.data)}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-icon': ViIcon;
  }
}
