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
import type { ViAccordionItem } from './vi-accordion-item.js';
import accordionStyles from './vi-accordion.scss?inline';

export type AccordionVariant = 'default' | 'bordered' | 'flush' | 'card';
export type AccordionSize = 'sm' | 'md' | 'lg';

/**
 * vi-accordion
 * Container component for vertically stacked collapsible panels.
 *
 * @element vi-accordion
 *
 * @attr {boolean} multi          - Allows opening multiple items simultaneously
 * @attr {AccordionVariant} variant - Visual style variant
 * @attr {AccordionSize} size      - Component scale/sizing
 *
 * @slot - Default slot for vi-accordion-item elements
 *
 * @fires {CustomEvent<{itemId: string; open: boolean}>} vialiq-change - Fired when any accordion item toggles
 */
@customElement('vi-accordion')
export class ViAccordion extends ViElement {
  static override styles = css`
    ${unsafeCSS(accordionStyles)}
  `;

  /** Allow multiple items open simultaneously. */
  @property({ type: Boolean, reflect: true }) accessor multi = false;

  /** Visual style variant: 'default' | 'bordered' | 'flush' | 'card' */
  @property({ reflect: true }) accessor variant: AccordionVariant = 'default';

  /** Sizing of the headers and panels: 'sm' | 'md' | 'lg' */
  @property({ reflect: true }) accessor size: AccordionSize = 'md';

  constructor() {
    super();
    this.addEventListener('vialiq-accordion-before-open', this._handleBeforeItemOpen);
    this.addEventListener('vialiq-accordion-open', this._handleItemOpen);
    this.addEventListener('vialiq-accordion-close', this._handleItemClose);
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has('size') || changed.has('variant')) {
      this._propagateProps();
    }
  }

  private _handleSlotChange(): void {
    this._propagateProps();
  }

  private _getAccordionItems(): ViAccordionItem[] {
    return Array.from(this.querySelectorAll('vi-accordion-item'));
  }

  private _propagateProps(): void {
    const items = this._getAccordionItems();
    items.forEach(item => {
      item.size = this.size;
      item.variant = this.variant;
    });
  }

  private _handleBeforeItemOpen(e: Event): void {
    const target = e.target as ViAccordionItem;
    const targetId = target.itemId;

    const items = this._getAccordionItems();
    const openItems = items.filter(item => item.open && item.itemId !== targetId);

    for (const openItem of openItems) {
      const beforeCloseEvent = new CustomEvent('vialiq-accordion-before-close', {
        detail: { itemId: openItem.itemId },
        bubbles: true,
        composed: true,
        cancelable: true,
      });

      const isAllowed = openItem.dispatchEvent(beforeCloseEvent);
      if (!isAllowed) {
        e.preventDefault();
        break;
      }
    }
  }

  private _handleItemOpen(e: Event): void {
    const target = e.target as ViAccordionItem;
    const targetId = target.itemId;

    if (!this.multi) {
      const items = this._getAccordionItems();
      items.forEach(item => {
        if (item.itemId !== targetId && item.open) {
          item.open = false;
          item.dispatchEvent(
            new CustomEvent('vialiq-accordion-close', {
              detail: { itemId: item.itemId },
              bubbles: true,
              composed: true,
            })
          );
        }
      });
    }

    this._dispatchChangeEvent(targetId, true);
  }

  private _handleItemClose(e: Event): void {
    const target = e.target as ViAccordionItem;
    this._dispatchChangeEvent(target.itemId, false);
  }

  private _dispatchChangeEvent(itemId: string, open: boolean): void {
    this.dispatchEvent(
      new CustomEvent('vialiq-accordion-change', {
        detail: { itemId, open },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onKeyDown(e: KeyboardEvent): void {
    const items = this._getAccordionItems().filter(item => !item.disabled);
    if (items.length === 0) return;

    const activeElement = document.activeElement;
    // Roving focus matching: check button inside shadow root of accordion items, or host element
    const focusedIndex = items.findIndex(
      item =>
        item === activeElement ||
        item.shadowRoot?.activeElement === activeElement ||
        item === (activeElement as unknown as { host?: unknown })?.host
    );

    if (focusedIndex === -1) return;

    let nextIndex = focusedIndex;
    switch (e.key) {
      case 'ArrowDown':
        nextIndex = (focusedIndex + 1) % items.length;
        e.preventDefault();
        break;
      case 'ArrowUp':
        nextIndex = (focusedIndex - 1 + items.length) % items.length;
        e.preventDefault();
        break;
      case 'Home':
        nextIndex = 0;
        e.preventDefault();
        break;
      case 'End':
        nextIndex = items.length - 1;
        e.preventDefault();
        break;
      default:
        return;
    }

    const nextItem = items[nextIndex];
    if (nextItem) {
      const button = nextItem.shadowRoot?.querySelector('button');
      if (button) {
        button.focus();
      }
    }
  }

  override render(): TemplateResult {
    const containerClasses = classMap({
      'accordion': true,
      'accordion--bordered': this.variant === 'bordered',
      'accordion--flush': this.variant === 'flush',
      'accordion--card': this.variant === 'card',
      'accordion--sm': this.size === 'sm',
      'accordion--md': this.size === 'md',
      'accordion--lg': this.size === 'lg',
    });

    return html`
      <div
        class=${containerClasses}
        part="accordion"
        @keydown=${this._onKeyDown}
      >
        <slot @slotchange=${this._handleSlotChange}></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-accordion': ViAccordion;
  }
}
