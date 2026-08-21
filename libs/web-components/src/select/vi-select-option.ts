import { css, html, unsafeCSS, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import { registerIcons } from '../icons/registry.js';
import { checkIcon } from '@vialiq/icons';
import { SlottedListboxItem } from '../shared/types/listbox.types.js';
import optionStyles from './vi-select-option.scss?inline';

registerIcons([checkIcon]);

/**
 * vi-select-option
 * Dropdown item primitive for declarative composition inside <vi-select>.
 *
 * @element vi-select-option
 */
@customElement('vi-select-option')
export class ViSelectOption extends ViElement implements SlottedListboxItem {
  static override styles = css`
    ${unsafeCSS(optionStyles)}
  `;

  @property({ type: String, reflect: true }) accessor value = '';
  @property({ type: String, reflect: true }) accessor label = '';
  @property({ attribute: false }) accessor data: unknown = undefined;
  @property({ type: String, reflect: true }) accessor group = '';
  @property({ type: Boolean, reflect: true }) accessor disabled = false;
  @property({ type: String, reflect: true }) accessor icon = '';
  @property({ type: String, reflect: true }) accessor description = '';
  
  @property({
    attribute: 'search-text',
    reflect: false,
    converter: {
      fromAttribute: (v: string | null): string[] => v ? v.split(/\s+/).filter(Boolean) : [],
    },
  })
  accessor searchText: string[] = [];

  @property({ type: Boolean, reflect: true }) accessor selected = false;
  @property({ type: Boolean, reflect: true }) accessor active = false;
  @property({ type: Boolean, attribute: 'wrap-text' }) accessor wrapText = false;

  @property({ type: String, attribute: 'highlight-text' }) accessor highlightText = '';

  @state() private accessor _hasSlotContent = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this._handleClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this._handleClick);
  }

  protected override firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);
    this.setAttribute('role', 'option');
    this.setAttribute('aria-selected', this.selected ? 'true' : 'false');
    this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
  }

  protected override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('selected') || changedProperties.has('disabled')) {
      this.setAttribute('aria-selected', this.selected ? 'true' : 'false');
      this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
    }
  }

  private _handleClick = (e: Event) => {
    if (this.disabled) {
      e.stopPropagation();
      return;
    }
    this.dispatchEvent(
      new CustomEvent('vi-select-item-select', {
        detail: { item: this },
        bubbles: true,
        composed: true,
      })
    );
  };

  private _handleSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const nodes = slot.assignedNodes({ flatten: true }).filter(
      (n) => n.nodeType === Node.ELEMENT_NODE || (n.nodeType === Node.TEXT_NODE && n.textContent?.trim())
    );
    const hasContent = nodes.length > 0;
    if (this._hasSlotContent !== hasContent) {
      this._hasSlotContent = hasContent;
    }
  }

  private _renderHighlightedLabel(): TemplateResult | string {
    if (!this.highlightText || !this.label) {
      return this.label;
    }

    const regex = new RegExp(`(${this.highlightText})`, 'gi');
    const parts = this.label.split(regex);

    return html`${parts.map(part => 
      part.toLowerCase() === this.highlightText.toLowerCase() 
        ? html`<mark class="highlight">${part}</mark>` 
        : part
    )}`;
  }

  override render(): TemplateResult {
    return html`
      <li
        part="item"
        role="presentation"
        class="select-option ${this.selected ? 'is-selected' : ''} ${this.active ? 'is-active' : ''} ${this.disabled ? 'is-disabled' : ''}"
        title=${this.label}
      >
        ${this.icon ? html`<vi-icon part="icon" name="${this.icon}" class="select-option-icon"></vi-icon>` : ''}

        <div part="content" class="select-option-content">
          <slot @slotchange=${this._handleSlotChange}></slot>
          ${!this._hasSlotContent
            ? html`
                <span part="label" class="select-option-label ${this.wrapText ? 'is-wrapped' : ''}">${this._renderHighlightedLabel()}</span>
                ${this.description ? html`<span part="description" class="select-option-description">${this.description}</span>` : ''}
              `
            : ''}
        </div>

        ${this.selected ? html`<vi-icon part="check" name="check" class="select-option-check"></vi-icon>` : ''}
      </li>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-select-option': ViSelectOption;
  }
}
