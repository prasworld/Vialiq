import { css, html, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
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
  static override styles = css`${unsafeCSS(menuStyles)}`;

  private _handleKeyDown = (e: KeyboardEvent) => {
    // Basic arrow key navigation support for menu items
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;

    const items = Array.from(this.querySelectorAll('vi-menu-item:not([disabled])')) as HTMLElement[];
    if (!items.length) return;

    const activeItem = document.activeElement?.closest('vi-menu-item') as HTMLElement;
    const currentIndex = activeItem ? items.indexOf(activeItem) : -1;

    e.preventDefault();

    if (e.key === 'ArrowDown') {
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items[prevIndex]?.focus();
    } else if (e.key === 'Home') {
      items[0]?.focus();
    } else if (e.key === 'End') {
      items[items.length - 1]?.focus();
    }
  };

  override render() {
    return html`
      <ul 
        class="vi-menu" 
        role="menu"
        tabindex="-1"
        @keydown=${this._handleKeyDown}
      >
        <slot></slot>
      </ul>
    `;
  }
}
