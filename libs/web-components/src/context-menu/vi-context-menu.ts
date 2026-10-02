import { customElement } from 'lit/decorators.js';
import { css, unsafeCSS } from 'lit';
import { ViDropdown } from '../dropdown/vi-dropdown.js';
import contextMenuStyles from './vi-context-menu.scss?inline';

/**
 * vi-context-menu
 *
 * A specialized dropdown that automatically opens on right-click (contextmenu).
 *
 * @element vi-context-menu
 */
@customElement('vi-context-menu')
export class ViContextMenu extends ViDropdown {
  static override styles = [
    ViDropdown.styles,
    css`
      ${unsafeCSS(contextMenuStyles)}
    `,
  ];

  constructor() {
    super();
    this.trigger = 'contextmenu';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-context-menu': ViContextMenu;
  }
}
