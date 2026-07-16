import {
  css,
  html,
  unsafeCSS,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ViElement } from '../base/vi-element.js';
import { registerIcons, type SvgIconDef } from '../icons/registry.js';
import type { AccordionVariant, AccordionSize } from './vi-accordion.js';
import accordionItemStyles from './vi-accordion-item.scss?inline';

// Self-register chevron-right icon to support out-of-the-box rendering
const chevronRightIcon: SvgIconDef = {
  name: 'chevron-right',
  data: '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>',
};

registerIcons([chevronRightIcon]);

/**
 * vi-accordion-item
 * Collapsible item section within vi-accordion.
 *
 * @element vi-accordion-item
 *
 * @attr {string} item-id  - Unique element identifier
 * @attr {boolean} open     - Expanded state of the accordion panel
 * @attr {boolean} disabled - Whether the header is disabled/non-interactive
 * @attr {string} label     - Header text fallback if slot="header" is omitted
 *
 * @slot header         - Header content override
 * @slot header-icon    - Slot for leading header icon
 * @slot header-actions - Slot for trailing action buttons/badges
 * @slot - Default slot for panel body content
 */
@customElement('vi-accordion-item')
export class ViAccordionItem extends ViElement {
  static override styles = css`
    ${unsafeCSS(accordionItemStyles)}
  `;

  /** Unique ID for the item. */
  @property({ reflect: true, attribute: 'item-id' })
  accessor itemId = `vi-accordion-item-${Math.random().toString(36).substring(2, 9)}`;

  /** Expanded state. */
  @property({ type: Boolean, reflect: true }) accessor open = false;

  /** Disabled state. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Plain text header label. */
  @property() accessor label = '';

  /** Sizing of the item (propagated by parent accordion). */
  @property({ reflect: true }) accessor size: AccordionSize = 'md';

  /** Visual variant (propagated by parent accordion). */
  @property({ reflect: true }) accessor variant: AccordionVariant = 'default';

  private _resizeObserver?: ResizeObserver;

  override firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);
    const inner = this.shadowRoot?.querySelector('.accordion-panel-inner');
    if (inner) {
      this._resizeObserver = new ResizeObserver(entries => {
        const entry = entries[0];
        if (entry) {
          const height = entry.contentRect.height;
          this.style.setProperty('--vi-accordion-panel-height', `${height}px`);
        }
      });
      this._resizeObserver.observe(inner);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
  }

  private _handleHeaderClick(): void {
    if (this.disabled) return;

    const targetState = !this.open;
    const beforeEventName = targetState
      ? 'vialiq-accordion-before-open'
      : 'vialiq-accordion-before-close';

    const beforeEvent = new CustomEvent(beforeEventName, {
      detail: { itemId: this.itemId },
      bubbles: true,
      composed: true,
      cancelable: true,
    });

    const isAllowed = this.dispatchEvent(beforeEvent);
    if (!isAllowed) {
      return;
    }

    this.open = targetState;
    const finalEventName = this.open
      ? 'vialiq-accordion-open'
      : 'vialiq-accordion-close';

    this.dispatchEvent(
      new CustomEvent(finalEventName, {
        detail: { itemId: this.itemId },
        bubbles: true,
        composed: true,
      })
    );
  }

  override render(): TemplateResult {
    const itemClasses = classMap({
      'accordion-item': true,
      'accordion-item--open': this.open,
      'accordion-item--disabled': this.disabled,
      'accordion-item--sm': this.size === 'sm',
      'accordion-item--md': this.size === 'md',
      'accordion-item--lg': this.size === 'lg',
      'accordion-item--bordered': this.variant === 'bordered',
      'accordion-item--flush': this.variant === 'flush',
      'accordion-item--card': this.variant === 'card',
    });

    return html`
      <div class=${itemClasses} part="item">
        <button
          type="button"
          class="accordion-header"
          part="header"
          ?disabled=${this.disabled}
          aria-expanded=${this.open ? 'true' : 'false'}
          aria-controls="panel-${this.itemId}"
          id="header-${this.itemId}"
          @click=${this._handleHeaderClick}
        >
          <div class="accordion-header-content">
            <slot name="header-icon" part="header-icon"></slot>
            <slot name="header" part="label">
              <span class="accordion-label-text">${this.label}</span>
            </slot>
            <slot name="header-actions" part="header-actions"></slot>
          </div>
          <vi-icon
            name="chevron-right"
            part="chevron"
            class="accordion-chevron"
          ></vi-icon>
        </button>
        <div
          id="panel-${this.itemId}"
          class="accordion-panel"
          part="panel"
          role="region"
          aria-labelledby="header-${this.itemId}"
        >
          <div class="accordion-panel-inner" part="panel-inner">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-accordion-item': ViAccordionItem;
  }
}
