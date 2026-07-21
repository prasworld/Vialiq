import { css, html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import alertStyles from './vi-alert.scss?inline';
import '../icons/vi-icon.js';
import '../button/vi-button.js';
import { registerIcons, type SvgIconDef } from '../icons/registry.js';

const checkCircleIcon: SvgIconDef = {
  name: 'check-circle',
  data: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
};

const alertTriangleIcon: SvgIconDef = {
  name: 'alert-triangle',
  data: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
};

const infoIcon: SvgIconDef = {
  name: 'info',
  data: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
};

const xIcon: SvgIconDef = {
  name: 'x',
  data: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
};

const lockIcon: SvgIconDef = {
  name: 'lock',
  data: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
};

registerIcons([checkCircleIcon, alertTriangleIcon, infoIcon, xIcon, lockIcon]);

export type AlertVariant =
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral';

/**
 * vi-alert
 * A persistent inline status message displayed within the page layout.
 *
 * @element vi-alert
 * @attr variant - Colour semantic: info | success | warning | danger | neutral (default: info)
 * @attr title   - Bold headline (optional)
 * @attr open - Controls alert visibility (default: true)
 * @attr floating - Positions alert absolutely over parent container (100% width)
 * @attr dismissible - Show × dismiss button
 * @attr icon    - Override the default status icon name
 * @attr no-icon - Hide the icon
 *
 * @slot         - Alert body content (text or rich HTML)
 * @slot title   - Override title
 * @slot icon    - Custom icon
 * @slot actions - Action buttons or links
 *
 * @csspart alert   - Root element
 * @csspart icon    - Status icon wrapper
 * @csspart content - Title + body column
 * @csspart title   - Title span
 * @csspart body    - Default slot wrapper
 * @csspart actions - Actions slot wrapper
 * @csspart close-btn - × dismiss button
 *
 * @fires vialiq-alert-show - Fired when the alert is shown
 * @fires vialiq-alert-close - Fired when the alert is dismissed
 */
@customElement('vi-alert')
export class ViAlert extends ViElement {
  static override styles = css`
    ${unsafeCSS(alertStyles)}
  `;

  /** Colour, icon, ARIA role */
  @property({ type: String, reflect: true }) accessor variant: AlertVariant =
    'info';

  /** Bold headline (optional) */
  @property({ type: String }) accessor title = '';

  /** Show × dismiss button */
  @property({ type: Boolean, reflect: true }) accessor dismissible = false;

  /** Accessible label for the dismiss button */
  @property({ type: String, attribute: 'dismiss-label' })
  accessor dismissLabel = 'Dismiss alert';

  /** 
   * Enables auto-hiding after a duration (default: 5000ms).
   * Note: Setting a positive `duration` or `auto-hide-duration` also implicitly enables auto-hiding.
   */
  @property({ type: Boolean, attribute: 'auto-hide', reflect: true })
  accessor autoHide = false;

  /** Auto hide duration in milliseconds (default: 5000ms) */
  @property({ type: Number, attribute: 'auto-hide-duration' })
  accessor autoHideDuration = 5000;

  /** 
   * Alias for auto-hide-duration in milliseconds.
   * Setting a positive duration enables auto-hiding automatically.
   */
  @property({ type: Number })
  accessor duration: number | undefined = undefined;

  /** Override the default status icon name */
  @property({ type: String }) accessor icon: string | undefined = undefined;

  /** Controls whether the alert is displayed */
  @property({ type: Boolean, reflect: true }) accessor open = true;

  /** Position alert absolutely over parent container without pushing layout */
  @property({ type: Boolean, reflect: true }) accessor floating = false;

  /** Hide the icon */
  @property({ type: Boolean, attribute: 'no-icon', reflect: true })
  accessor noIcon = false;

  @state() private accessor _hasTitleSlot = false;
  @state() private accessor _hasActionsSlot = false;

  private _autoHideTimer: ReturnType<typeof setTimeout> | null = null;

  /** Helper to check whether auto-hide is enabled via boolean toggle or duration setting */
  private get _shouldAutoHide(): boolean {
    return (
      this.autoHide ||
      (this.duration !== undefined && this.duration > 0)
    );
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.updateRole();
    if (!this.open) {
      this.hidden = true;
    } else if (this._shouldAutoHide) {
      this._startAutoHideTimer();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._clearAutoHideTimer();
  }

  override updated(
    changedProperties: Map<string | number | symbol, unknown>,
  ): void {
    super.updated(changedProperties);
    if (changedProperties.has('variant')) {
      this.updateRole();
    }
    if (changedProperties.has('open') && changedProperties.get('open') !== undefined) {
      if (this.open) {
        this._handleOpen();
      } else if (!this.hidden) {
        this.handleDismiss();
      }
    }
    if (
      changedProperties.has('autoHide') ||
      changedProperties.has('autoHideDuration') ||
      changedProperties.has('duration')
    ) {
      if (this.open && this._shouldAutoHide) {
        this._startAutoHideTimer();
      } else {
        this._clearAutoHideTimer();
      }
    }
  }

  private updateRole(): void {
    switch (this.variant) {
      case 'warning':
      case 'danger':
        this.setAttribute('role', 'alert');
        break;
      case 'info':
      case 'success':
        this.setAttribute('role', 'status');
        break;
      case 'neutral':
      default:
        this.removeAttribute('role');
        break;
    }
  }

  private get defaultIcon(): string {
    switch (this.variant) {
      case 'success':
        return 'check-circle';
      case 'warning':
      case 'danger':
        return 'alert-triangle';
      case 'info':
      default:
        return 'info';
    }
  }

  private onTitleSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    this._hasTitleSlot = slot.assignedNodes({ flatten: true }).length > 0;
  }

  private onActionsSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    this._hasActionsSlot = slot.assignedNodes({ flatten: true }).length > 0;
  }

  private _startAutoHideTimer(): void {
    this._clearAutoHideTimer();
    const timeout = this.duration ?? this.autoHideDuration;
    if (timeout > 0) {
      this._autoHideTimer = setTimeout(() => {
        this.hide();
      }, timeout);
    }
  }

  private _clearAutoHideTimer(): void {
    if (this._autoHideTimer !== null) {
      clearTimeout(this._autoHideTimer);
      this._autoHideTimer = null;
    }
  }

  private _handleOpen(): void {
    this.hidden = false;

    if (this.shadowRoot) {
      const root = this.shadowRoot.querySelector('.alert-root') as HTMLElement;
      if (root && typeof root.getAnimations === 'function') {
        root.getAnimations().forEach((anim) => anim.cancel());
      }
    }

    if (this._shouldAutoHide) {
      this._startAutoHideTimer();
    }

    this.dispatchEvent(
      new CustomEvent('vialiq-alert-show', {
        bubbles: true,
        composed: true,
        detail: { id: this.id },
      }),
    );
  }

  private _dismissPromise: Promise<void> | null = null;

  private async handleDismiss(): Promise<void> {
    this._clearAutoHideTimer();
    if (this._dismissPromise) {
      return this._dismissPromise;
    }

    this._dismissPromise = (async () => {
      if (this.shadowRoot) {
        const root = this.shadowRoot.querySelector('.alert-root') as HTMLElement;
        if (root && typeof root.animate === 'function') {
          try {
            const computed = getComputedStyle(root);
            const currentHeight = root.offsetHeight;
            const currentPadding = computed.padding;
            const currentMargin = computed.margin;

            const animation = root.animate(
              [
                {
                  height: `${currentHeight}px`,
                  opacity: 1,
                  margin: currentMargin,
                  padding: currentPadding,
                },
                { height: '0px', opacity: 0, margin: '0px', padding: '0px' },
              ],
              { duration: 200, easing: 'ease-out', fill: 'forwards' },
            );

            await animation.finished;
          } catch {
            // Animation was cancelled or failed; swallow rejection and proceed
          }
        }
      }

      this.hidden = true;
      this.open = false;

      this.dispatchEvent(
        new CustomEvent('vialiq-alert-close', {
          bubbles: true,
          composed: true,
          detail: { id: this.id },
        }),
      );
    })();

    try {
      await this._dismissPromise;
    } finally {
      this._dismissPromise = null;
    }
  }

  /** Programmatically shows the alert */
  public async show(): Promise<void> {
    this.open = true;
    await this.updateComplete;
  }

  /** Programmatically hides/dismisses the alert */
  public async hide(): Promise<void> {
    if (this.open) {
      this.open = false;
      await this.updateComplete;
      if (this._dismissPromise) {
        await this._dismissPromise;
      }
    }
  }

  override render(): TemplateResult {
    return html`
      <div part="alert" class="alert-root" data-variant=${this.variant}>
        ${!this.noIcon
          ? html`
              <div part="icon" class="alert-icon">
                <slot name="icon">
                  <vi-icon
                    name=${this.icon || this.defaultIcon}
                    aria-hidden="true"
                  ></vi-icon>
                </slot>
              </div>
            `
          : ''}

        <div part="content" class="alert-content">
          <div
            part="title"
            class="alert-title"
            ?hidden=${!(this.title || this._hasTitleSlot)}
          >
            <slot name="title" @slotchange=${this.onTitleSlotChange}>
              ${this.title}
            </slot>
          </div>

          <div part="body" class="alert-body">
            <slot></slot>
          </div>

          <div
            part="actions"
            class="alert-actions"
            ?hidden=${!this._hasActionsSlot}
          >
            <slot name="actions" @slotchange=${this.onActionsSlotChange}></slot>
          </div>
        </div>

        ${this.dismissible
          ? html`
              <vi-button
                part="close-btn"
                variant="ghost"
                size="sm"
                icon-only
                aria-label=${this.dismissLabel}
                @click=${this.handleDismiss}
              >
                <vi-icon name="x" slot="icon"></vi-icon>
              </vi-button>
            `
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-alert': ViAlert;
  }
}
