import { css, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import dropdownStyles from './vi-dropdown.scss?inline';
import type { Placement } from '@floating-ui/dom';
import '../popover/index.js';

/**
 * vi-dropdown
 *
 * A dropdown menu overlay that composes vi-popover and vi-menu.
 *
 * @element vi-dropdown
 * @attr placement - The placement of the dropdown (e.g., bottom-start)
 * @attr trigger - The interaction that triggers the dropdown (click, hover, focus, contextmenu)
 * @attr open - Whether the dropdown is open
 * 
 * @slot - The trigger element
 * @slot content - The vi-menu element
 */
@customElement('vi-dropdown')
export class ViDropdown extends ViElement {
  static override styles = css`${unsafeCSS(dropdownStyles)}`;

  @property({ type: String }) accessor placement: Placement = 'bottom-start';
  @property({ type: String }) accessor trigger: 'click' | 'hover' | 'focus' | 'contextmenu' = 'click';
  @property({ type: Boolean, reflect: true }) accessor open = false;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this._handleKeyDown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._handleKeyDown);
  }

  private _handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      // If focus is already inside the menu, let the menu handle it
      if (document.activeElement?.closest('vi-menu')) return;

      e.preventDefault();
      if (!this.open) this.open = true;

      // Wait for popover and menu to render/display
      setTimeout(() => {
        const menu = this.querySelector('vi-menu');
        const firstItem = menu?.querySelector('vi-menu-item:not([disabled])') as HTMLElement;
        firstItem?.focus();
      }, 10);
    }
  };

  private _handleShow = () => {
    this.open = true;
    this.dispatchEvent(new CustomEvent('vi-dropdown-open-change', {
      detail: { open: true },
      bubbles: true,
      composed: true
    }));
  };

  private _handleHide = () => {
    this.open = false;
    this.dispatchEvent(new CustomEvent('vi-dropdown-open-change', {
      detail: { open: false },
      bubbles: true,
      composed: true
    }));
  };

  private _handleMenuItemClick = () => {
    this.open = false;
  };

  override render() {
    return html`
      <vi-popover
        class="vi-dropdown-popover"
        .placement=${this.placement}
        .trigger=${this.trigger}
        ?open=${this.open}
        @vi-popover-show=${this._handleShow}
        @vi-popover-hide=${this._handleHide}
        @vi-menu-item-click=${this._handleMenuItemClick}
      >
        <slot></slot>
        <slot name="content" slot="content"></slot>
      </vi-popover>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-dropdown': ViDropdown;
  }
}
