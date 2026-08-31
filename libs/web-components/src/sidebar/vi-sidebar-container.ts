import { css, html, unsafeCSS } from 'lit';
import { customElement, property, queryAssignedElements } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import containerStyles from './vi-sidebar-container.scss?inline';
import type { ViSidebar } from './vi-sidebar.js';

/**
 * @element vi-sidebar-container
 * @slot sidebar - The slot for vi-sidebar components
 * @slot content - The slot for the main page content
 */
@customElement('vi-sidebar-container')
export class ViSidebarContainer extends ViElement {
  static override styles = css`
    ${unsafeCSS(containerStyles)}
  `;

  @property({ type: Boolean, attribute: 'show-backdrop' })
  accessor showBackdrop = false;

  @property({ type: Boolean, reflect: true })
  accessor animations = true;

  @property({ type: Boolean, attribute: 'allow-sidebar-backdrop-control' })
  accessor allowSidebarBackdropControl = true;

  @property({ type: String, attribute: 'content-class' })
  accessor contentClass = '';

  @property({ type: String, attribute: 'backdrop-class' })
  accessor backdropClass = '';

  @queryAssignedElements({ slot: 'sidebar', selector: 'vi-sidebar' })
  private accessor _sidebars!: ViSidebar[];

  override firstUpdated() {
    this._handleSidebarSlotChange();
  }

  override render() {
    return html`
      <div class="vi-sidebar-container__inner">
        <slot name="sidebar" @slotchange=${this._handleSidebarSlotChange}></slot>
        <div class="vi-sidebar-container__content-wrapper ${this.contentClass}" part="content-wrapper">
          <slot name="content"></slot>
          ${this.showBackdrop
            ? html`<div class="vi-sidebar-container__backdrop ${this.backdropClass}" @click=${this._onBackdropClick}></div>`
            : ''}
        </div>
      </div>
    `;
  }

  private _handleSidebarSlotChange() {
    this._sidebars.forEach((sidebar) => {
      sidebar.container = this;
      this.updateLayout();
    });
  }

  private _onBackdropClick() {
    this.dispatchEvent(new CustomEvent('vi-backdrop-click', { bubbles: true, composed: true }));
    this._sidebars.forEach(sidebar => {
      if (sidebar.opened && sidebar.closeOnClickBackdrop) {
        sidebar.close();
      }
    });
  }

  requestBackdrop(show: boolean) {
    if (this.allowSidebarBackdropControl) {
      if (this.showBackdrop !== show) {
        this.showBackdrop = show;
        this.dispatchEvent(new CustomEvent('vi-show-backdrop-change', { 
          detail: { showBackdrop: show },
          bubbles: true, 
          composed: true 
        }));
      }
    }
  }

  updateLayout() {
    let marginLeft = 0;
    let marginRight = 0;
    let marginTop = 0;
    let marginBottom = 0;
    let translateX = 0;
    let translateY = 0;

    this._sidebars.forEach(sidebar => {
      const isLeftOrRight = sidebar.position === 'left' || sidebar.position === 'right' ||
                            sidebar.position === 'start' || sidebar.position === 'end';
      const isLeftOrTop = sidebar.position === 'left' || sidebar.position === 'top' ||
                          sidebar.position === 'start';
      const dockedSize = parseFloat(sidebar.dockedSize) || 0;
      const isDocked = sidebar.dock && !sidebar.opened;

      // --- Slide mode: translate the content wrapper ---
      if (sidebar.mode === 'slide') {
        // Only translate when the sidebar is open (not just docked)
        if (sidebar.opened) {
          const size = isLeftOrRight
            ? (sidebar.offsetWidth || 250)
            : (sidebar.offsetHeight || 250);
          const amt = isLeftOrTop ? size : -size;
          if (isLeftOrRight) {
            translateX += amt;
          } else {
            translateY += amt;
          }
        }
        // In slide mode, content never gets padding (even docked)
        return;
      }

      // --- Push / Over mode: pad the content wrapper ---
      // Push mode: pad when opened OR docked
      // Over mode: pad only when docked (the open sidebar floats over content)
      const shouldPad = (sidebar.mode === 'push' && (sidebar.opened || isDocked)) ||
                        (sidebar.mode === 'over' && isDocked);

      if (!shouldPad) return;

      // Amount to pad: use dockedSize when closed+docked, full size when open
      let paddingAmt = 0;
      if (isDocked) {
        paddingAmt = dockedSize;
      } else {
        paddingAmt = this._getSidebarSize(sidebar);
      }

      if (sidebar.position === 'left' || sidebar.position === 'start') marginLeft = Math.max(marginLeft, paddingAmt);
      else if (sidebar.position === 'right' || sidebar.position === 'end') marginRight = Math.max(marginRight, paddingAmt);
      else if (sidebar.position === 'top') marginTop = Math.max(marginTop, paddingAmt);
      else if (sidebar.position === 'bottom') marginBottom = Math.max(marginBottom, paddingAmt);
    });

    const wrapper = this.shadowRoot?.querySelector('.vi-sidebar-container__content-wrapper') as HTMLElement;
    if (wrapper) {
      wrapper.style.padding = (marginLeft || marginRight || marginTop || marginBottom)
        ? `${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px`
        : '';

      wrapper.style.transform = (translateX || translateY)
        ? `translate(${translateX}px, ${translateY}px)`
        : '';
    }
  }

  private _getSidebarSize(sidebar: ViSidebar): number {
    const isVertical = sidebar.position === 'left' || sidebar.position === 'right' || sidebar.position === 'start' || sidebar.position === 'end';
    if (isVertical) {
      // In dock mode, offsetWidth transitions from 0 during animation -- it's unreliable.
      // Use the inline CSS variable (set by the resizer) or fall back to 250px default.
      if (sidebar.dock) {
        return parseFloat(sidebar.style.getPropertyValue('--vi-sidebar-width')) || 250;
      }
      return sidebar.offsetWidth || parseFloat(getComputedStyle(sidebar).getPropertyValue('--vi-sidebar-width')) || 250;
    }
    if (sidebar.dock) {
      return parseFloat(sidebar.style.getPropertyValue('--vi-sidebar-height')) || 250;
    }
    return sidebar.offsetHeight || parseFloat(getComputedStyle(sidebar).getPropertyValue('--vi-sidebar-height')) || 250;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-sidebar-container': ViSidebarContainer;
  }
}
