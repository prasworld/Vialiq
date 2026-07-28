import { css, html, unsafeCSS, LitElement, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import { registerIcons, type SvgIconDef } from '../icons/registry.js';
import itemStyles from './vi-combobox-item.scss?inline';

import { checkIcon } from '@vialiq/icons';

registerIcons([checkIcon]);

/**
 * vi-combobox-item
 * Dropdown item primitive for declarative composition inside <vi-combobox>.
 *
 * @element vi-combobox-item
 *
 * @attr {string}  value       - Value submitted when selected (reflected)
 * @attr {string}  label       - Display text; used for search filtering (reflected)
 * @attr {string}  group       - Optgroup header text (reflected)
 * @attr {boolean} disabled    - Prevents selection (reflected)
 * @attr {string}  icon        - Icon name from icon registry (reflected)
 * @attr {string}  description - Secondary text rendered below label (reflected)
 * @attr {boolean} selected    - Selected state (reflected)
 *
 * @slot - Custom HTML template for option item layout
 *
 * @csspart item        - The <li> wrapper element
 * @csspart icon        - Leading icon wrapper
 * @csspart label       - Primary text span
 * @csspart description - Secondary text span
 * @csspart check       - Checkmark icon when selected
 * @csspart content     - Custom slot wrapper
 */
@customElement('vi-combobox-item')
export class ViComboboxItem extends ViElement {
  static override styles = css`
    ${unsafeCSS(itemStyles)}
  `;

  @property({ type: String, reflect: true }) accessor value = '';
  @property({ type: String, reflect: true }) accessor label = '';
  @property({ attribute: false }) accessor data: unknown = undefined;
  @property({ type: String, reflect: true }) accessor group = '';
  @property({ type: Boolean, reflect: true }) accessor disabled = false;
  @property({ type: String, reflect: true }) accessor icon = '';
  @property({ type: String, reflect: true }) accessor description = '';
  /**
   * Search corpus override for slotted mode. Accepts an array of search terms; joined with a
   * space internally. Falls back to `label` when empty.
   * HTML attribute: space-separated string — `search-text="Alice PI alice@acme.com"`
   * JS property: string array  — `.searchText=${['Alice', 'PI', 'alice@acme.com']}`
   */
  @property({
    attribute: 'search-text',
    reflect: false,
    converter: {
      fromAttribute: (v: string | null): string[] =>
        v ? v.split(/\s+/).filter(Boolean) : [],
    },
  })
  accessor searchText: string[] = [];
  @property({ type: Boolean, reflect: true }) accessor selected = false;

  @property({ type: Boolean, reflect: true }) accessor active = false;

  @state() accessor _hasSlotContent = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this._handleClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this._handleClick);
  }

  private _handleClick = (e: Event) => {
    if (this.disabled) {
      e.stopPropagation();
      return;
    }
    this.dispatchEvent(
      new CustomEvent('vi-item-select', {
        detail: { item: this },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private _handleSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const nodes = slot
      .assignedNodes({ flatten: true })
      .filter(
        (n) =>
          n.nodeType === Node.ELEMENT_NODE ||
          (n.nodeType === Node.TEXT_NODE && n.textContent?.trim()),
      );
    this._hasSlotContent = nodes.length > 0;
    this.requestUpdate();
  }

  override render(): TemplateResult {
    return html`
      <li
        part="item"
        role="option"
        aria-selected="${this.selected ? 'true' : 'false'}"
        aria-disabled="${this.disabled ? 'true' : 'false'}"
        aria-label="${this.label}"
        class="combobox-option ${this.selected ? 'is-selected' : ''} ${this
          .active
          ? 'is-active'
          : ''} ${this.disabled ? 'is-disabled' : ''}"
      >
        ${this.icon
          ? html`<vi-icon
              part="icon"
              name="${this.icon}"
              class="combobox-option-icon"
            ></vi-icon>`
          : ''}

        <div part="content" class="combobox-option-content">
          <slot @slotchange=${this._handleSlotChange}></slot>
          ${!this._hasSlotContent
            ? html`
                <span part="label" class="combobox-option-label"
                  >${this.label}</span
                >
                ${this.description
                  ? html`<span
                      part="description"
                      class="combobox-option-description"
                      >${this.description}</span
                    >`
                  : ''}
              `
            : ''}
        </div>

        ${this.selected
          ? html`<vi-icon
              part="check"
              name="check"
              class="combobox-option-check"
            ></vi-icon>`
          : ''}
      </li>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-combobox-item': ViComboboxItem;
  }
}
