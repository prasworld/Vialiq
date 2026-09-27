import { css, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ViElement } from '../base/vi-element.js';
import menuStyles from './vi-menu.scss?inline';

export interface ViMenuItemClickEventDetail {
  value: string;
  item: ViMenuItem;
}

/**
 * vi-menu-item
 *
 * An individual item inside a vi-menu.
 *
 * @element vi-menu-item
 * @attr value - Unique identifier for the item
 * @attr disabled - Disables the item
 * @attr danger - Applies danger/destructive styling
 * 
 * @fires vi-menu-item-click - Fired when clicked
 */
@customElement('vi-menu-item')
export class ViMenuItem extends ViElement {
  static override styles = css`${unsafeCSS(menuStyles)}`;

  @property({ type: String }) accessor value = '';
  @property({ type: Boolean, reflect: true }) accessor disabled = false;
  @property({ type: Boolean, reflect: true }) accessor danger = false;
  @property({ type: Boolean }) accessor tabbable = false;

  private _handleClick = (e: Event) => {
    if (this.disabled) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    this.dispatchEvent(
      new CustomEvent<ViMenuItemClickEventDetail>('vi-menu-item-click', {
        bubbles: true,
        composed: true,
        detail: { value: this.value, item: this },
      }),
    );
  };

  private _handleKeyDown = (e: KeyboardEvent) => {
    if (this.disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._handleClick(e);
    }
  };

  override focus(options?: FocusOptions) {
    const li = this.shadowRoot?.querySelector('li');
    if (li) li.focus(options);
    else super.focus(options);
  }

  override render() {
    const classes = {
      'vi-menu-item': true,
      'is-disabled': this.disabled,
      'is-danger': this.danger,
    };

    return html`
      <li
        class=${classMap(classes)}
        role="menuitem"
        tabindex=${this.disabled ? '-1' : (this.tabbable ? '0' : '-1')}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        @click=${this._handleClick}
        @keydown=${this._handleKeyDown}
      >
        <slot></slot>
      </li>
    `;
  }
}
