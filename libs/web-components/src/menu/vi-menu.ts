import { css, html, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import { ViMenuItem } from './vi-menu-item.js';
import menuStyles from './vi-menu.scss?inline';

/**
 * vi-menu
 *
 * A versatile menu component for navigation and dropdowns.
 * Handles arrow key navigation natively across slotted items.
 *
 * @element vi-menu
 * @slot - Menu items (vi-menu-item, vi-menu-divider)
 */
@customElement('vi-menu')
export class ViMenu extends ViElement {
  static override styles = css`
    ${unsafeCSS(menuStyles)}
  `;

  private _handleSlotChange = () => {
    this._resetTabIndexes();
  };

  private _resetTabIndexes() {
    const items = this._getItems();
    items.forEach((item, index) => {
      // Make only the first non-disabled item tabbable
      item.tabbable = index === 0;
    });
  }

  private _getItems(): ViMenuItem[] {
    return Array.from(
      this.querySelectorAll('vi-menu-item:not([disabled])'),
    ) as ViMenuItem[];
  }

  private _handleKeyDown = (e: KeyboardEvent) => {
    // Basic arrow key navigation support for menu items
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;

    const items = this._getItems();
    if (!items.length) return;

    const activeItem = document.activeElement?.closest(
      'vi-menu-item',
    ) as ViMenuItem | null;
    const currentIndex = activeItem ? items.indexOf(activeItem) : -1;

    e.preventDefault();

    let newlyFocused: ViMenuItem | undefined;

    if (e.key === 'ArrowDown') {
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      newlyFocused = items[nextIndex];
    } else if (e.key === 'ArrowUp') {
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      newlyFocused = items[prevIndex];
    } else if (e.key === 'Home') {
      newlyFocused = items[0];
    } else if (e.key === 'End') {
      newlyFocused = items[items.length - 1];
    }

    if (newlyFocused) {
      newlyFocused.focus();
      items.forEach((item) => (item.tabbable = false));
      newlyFocused.tabbable = true;
    }
  };

  private _handleFocusIn = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    const item = target.closest('vi-menu-item') as ViMenuItem | null;
    if (item && !item.disabled) {
      this._getItems().forEach((i) => (i.tabbable = false));
      item.tabbable = true;
    }
  };

  override render() {
    return html`
      <ul
        class="vi-menu"
        role="menu"
        tabindex="-1"
        @keydown=${this._handleKeyDown}
        @focusin=${this._handleFocusIn}
      >
        <slot @slotchange=${this._handleSlotChange}></slot>
      </ul>
    `;
  }
}
