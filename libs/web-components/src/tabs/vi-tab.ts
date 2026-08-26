import { css, html, nothing, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ViElement } from '../base/vi-element.js';
import tabStyles from './vi-tab.scss?inline';

export type TabSize = 'sm' | 'md' | 'lg';

/**
 * `vi-tab`
 *
 * A single tab button within a `vi-tabs` container.
 * Renders a native `<button role="tab">` with ARIA attributes managed
 * by the parent `vi-tabs` via direct property setting.
 *
 * @element vi-tab
 *
 * @attr {string}  tab-id      - Unique ID linking to the associated `vi-tab-panel[for]`
 * @attr {boolean} disabled    - Tab is not selectable
 * @attr {boolean} closable    - Tab shows a close button; fires vi-tab-before-close / vi-tab-close
 * @attr {number}  badge-count - Notification badge count (renders a pill badge)
 *
 * @slot         - Tab label text
 * @slot icon    - Leading icon (optional)
 *
 * @csspart tab          - The inner `<button>` element
 * @csspart icon         - Icon slot wrapper
 * @csspart label        - Label text span
 * @csspart badge        - Count badge
 * @csspart close-button - The close `<button>` (when closable)
 *
 * @fires {CustomEvent<{tabId: string}>} vi-tab-select       - Internal event bubbled to vi-tabs on click
 * @fires {CustomEvent<{tabId: string}>} vi-tab-before-close - Cancelable. Fired before close button removes tab.
 * @fires {CustomEvent<{tabId: string}>} vi-tab-close        - Fired after close (not cancelled). Host app should remove element.
 */
@customElement('vi-tab')
export class ViTab extends ViElement {
  static override styles = css`
    ${unsafeCSS(tabStyles)}
  `;

  /** Unique ID linking to vi-tab-panel[for]. Auto-generated if not set. */
  @property({ type: String, attribute: 'tab-id', reflect: true })
  accessor tabId = '';

  /** Tab is not selectable. */
  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  /**
   * Tab shows a close (×) button. Fires `vi-tab-before-close` (cancelable)
   * and `vi-tab-close` (host app should remove the element on this event).
   */
  @property({ type: Boolean, reflect: true })
  accessor closable = false;

  /** Notification badge count. Rendered when > 0. */
  @property({ type: Number, attribute: 'badge-count' })
  accessor badgeCount: number | undefined = undefined;

  /**
   * Whether this tab is currently active.
   * Managed by vi-tabs — do not set manually.
   */
  @property({ type: Boolean, reflect: true })
  accessor active = false;

  /**
   * Tab's position in the tablist (1-indexed). Used for aria-posinset.
   * Managed by vi-tabs.
   */
  @property({ type: Number, attribute: false })
  accessor posinset = 1;

  /**
   * Total tab count in the tablist. Used for aria-setsize.
   * Managed by vi-tabs.
   */
  @property({ type: Number, attribute: false })
  accessor setsize = 1;

  /** Whether the tab's inner button participates in tab order. Managed by vi-tabs. */
  override set tabIndex(val: number) {
    if (this._tabIndex !== val) {
      this._tabIndex = val;
      this.setAttribute('tabindex', String(val));
    }
  }
  override get tabIndex(): number {
    return this._tabIndex;
  }
  private _tabIndex = -1;

  private _hasIcon = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.tabId) {
      this.tabId = `vi-tab-${Math.random().toString(36).substring(2, 9)}`;
    }
    this.setAttribute('role', 'presentation');
  }

  private _onIconSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    this._hasIcon = slot.assignedNodes({ flatten: true }).length > 0;
    this.requestUpdate();
  }

  override updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has('active')) {
      this.setAttribute('aria-selected', this.active ? 'true' : 'false');
    }
    if (changedProperties.has('disabled')) {
      this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
    }
    if (changedProperties.has('setsize')) {
      this.setAttribute('aria-setsize', String(this.setsize));
    }
    if (changedProperties.has('posinset')) {
      this.setAttribute('aria-posinset', String(this.posinset));
    }
  }

  private _onClick(): void {
    if (this.disabled) return;
    this.focus();
    this.dispatchEvent(
      new CustomEvent<{ tabId: string }>('vi-tab-select', {
        detail: { tabId: this.tabId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onCloseClick(e: MouseEvent): void {
    e.stopPropagation(); // Don't also trigger tab selection

    const beforeEvent = new CustomEvent<{ tabId: string }>(
      'vi-tab-before-close',
      {
        detail: { tabId: this.tabId },
        bubbles: true,
        composed: true,
        cancelable: true,
      },
    );
    if (!this.dispatchEvent(beforeEvent)) return; // Host cancelled

    this.dispatchEvent(
      new CustomEvent<{ tabId: string }>('vi-tab-close', {
        detail: { tabId: this.tabId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render(): TemplateResult {
    const classes = {
      'vi-tab': true,
      'vi-tab--active': this.active,
      'vi-tab--disabled': this.disabled,
      'vi-tab--closable': this.closable,
    };

    return html`
      <div
        part="tab"
        class=${classMap(classes)}
        tabindex="-1"
        @click=${this._onClick}
      >
        <span
          part="icon"
          class="vi-tab__icon"
          style=${!this._hasIcon ? 'display: none' : nothing}
        >
          <slot name="icon" @slotchange=${this._onIconSlotChange}></slot>
        </span>

        <span part="label" class="vi-tab__label">
          <slot></slot>
        </span>

        ${this.badgeCount !== undefined && this.badgeCount > 0
          ? html`<span
              part="badge"
              class="vi-tab__badge"
              aria-label="${this.badgeCount} notifications"
            >
              ${this.badgeCount}
            </span>`
          : nothing}
        ${this.closable
          ? html`<button
              part="close-button"
              class="vi-tab__close"
              aria-label="Close tab"
              tabindex="-1"
              @click=${this._onCloseClick}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1 1L9 9M9 1L1 9"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-tab': ViTab;
  }
}
