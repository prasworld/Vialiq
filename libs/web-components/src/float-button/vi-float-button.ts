import {
  css,
  html,
  nothing,
  unsafeCSS,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { FocusableMixin } from '../base/focusable-mixin.js';
import { ViElement } from '../base/vi-element.js';
import '../tooltip/vi-tooltip.js';
import '../icons/vi-icon.js';
import { registerIcons } from '../icons/registry.js';
import { chevronUpIcon } from '@vialiq/icons';
import floatButtonStyles from './vi-float-button.scss?inline';

registerIcons([chevronUpIcon]);

export type FloatButtonShape = 'circle' | 'square';
export type FloatButtonType = 'default' | 'primary';
export type FloatButtonSize = 'default' | 'sm';
export type BadgeStatus =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

/**
 * vi-float-button
 * Floating action button for quick actions, back-to-top navigation, and speed dial clusters.
 *
 * @element vi-float-button
 * @attr shape - Button geometry: circle | square (default: circle)
 * @attr type - Visual type: default | primary (default: default)
 * @attr size - Size: default | sm (default: default)
 * @attr description - Text description label under icon
 * @attr tooltip - Text tooltip displayed on hover/focus
 * @attr href - Optional URL to navigate to (renders <a> when provided)
 * @attr target - Anchor target (_blank, _self, etc.)
 * @attr badge - Numeric count or text badge
 * @attr badge-dot - Show a status dot badge
 * @attr badge-status - Badge status semantic color: neutral | primary | success | warning | danger | info
 * @attr back-top - Enable back-to-top scroll behavior
 * @attr visibility-height - Scroll threshold (px) before backTop button appears (default: 400)
 * @attr scroll-target - CSS selector or element ID for custom scroll container
 * @attr disabled - Disables interactions
 *
 * @slot icon - Custom icon element
 * @slot description - Custom description content
 * @slot tooltip - Custom slotted tooltip
 * @slot - Fallback content
 *
 * @csspart control - Host wrapper container
 * @csspart button - Inner <button> or <a> element
 * @csspart icon - Icon slot wrapper
 * @csspart description - Description label wrapper
 * @csspart badge - Badge indicator wrapper
 *
 * @fires vi-float-button-click - Dispatched when button is clicked
 * @fires vi-float-button-back-top - Dispatched when back-top triggers scrolling
 */
@customElement('vi-float-button')
export class ViFloatButton extends FocusableMixin(ViElement) {
  static override styles = css`
    ${unsafeCSS(floatButtonStyles)}
  `;

  protected override get _focusableElement(): HTMLElement | null {
    return (
      (this.shadowRoot?.querySelector(
        '.float-button',
      ) as HTMLElement | null) ?? null
    );
  }

  /** Button geometry shape. */
  @property({ type: String, reflect: true })
  accessor shape: FloatButtonShape = 'circle';

  /** Visual type. */
  @property({ type: String, reflect: true })
  accessor type: FloatButtonType = 'default';

  /** Size scale. */
  @property({ type: String, reflect: true })
  accessor size: FloatButtonSize = 'default';

  /** Description text displayed under the icon. */
  @property({ type: String, reflect: true })
  accessor description: string | undefined = undefined;

  /** Tooltip text. */
  @property({ type: String })
  accessor tooltip: string | undefined = undefined;

  /** Optional anchor link URL. */
  @property({ type: String, reflect: true })
  accessor href: string | undefined = undefined;

  /** Target for anchor link. */
  @property({ type: String, reflect: true })
  accessor target: string | undefined = undefined;

  /** Badge count or string label. */
  @property({ reflect: true })
  accessor badge: number | string | undefined = undefined;

  /** Badge dot indicator mode. */
  @property({ type: Boolean, reflect: true, attribute: 'badge-dot' })
  accessor badgeDot = false;

  /** Badge semantic status color. */
  @property({ type: String, reflect: true, attribute: 'badge-status' })
  accessor badgeStatus: BadgeStatus = 'danger';

  /** Enables smooth scroll-to-top mode. */
  @property({ type: Boolean, reflect: true, attribute: 'back-top' })
  accessor backTop = false;

  /** Scroll distance threshold before backTop button appears. */
  @property({ type: Number, reflect: true, attribute: 'visibility-height' })
  accessor visibilityHeight = 400;

  /** Target scrollable container selector. */
  @property({ type: String, attribute: 'scroll-target' })
  accessor scrollTarget: string | undefined = undefined;

  /** Disabled state. */
  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  /** Reflects if the button is placed inside a <vi-float-button-group>. */
  @property({ type: Boolean, reflect: true, attribute: 'in-group' })
  accessor inGroup = false;

  /** Accessible label. */
  @property({ attribute: 'aria-label' })
  override accessor ariaLabel: string | null = null;

  /** Internal state tracking back-top visibility below threshold. */
  @property({ type: Boolean, reflect: true, attribute: 'hidden-back-top' })
  accessor hiddenBackTop = false;

  @state() private accessor _hasSlottedIcon = false;
  private _scrollHandlerBound?: () => void;
  private _currentScrollContainer?: HTMLElement | Window;

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.backTop) {
      this._setupScrollListener();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._teardownScrollListener();
  }

  override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('disabled')) {
      this._setHostFocusable(!this.disabled);
    }

    if (
      changedProperties.has('backTop') ||
      changedProperties.has('scrollTarget') ||
      changedProperties.has('visibilityHeight')
    ) {
      if (this.backTop) {
        this._setupScrollListener();
      } else {
        this._teardownScrollListener();
        this.hiddenBackTop = false;
      }
    }
  }

  private _resolveScrollContainer(): HTMLElement | Window {
    if (this.scrollTarget) {
      const container = document.querySelector(
        this.scrollTarget,
      ) as HTMLElement | null;
      if (container) return container;
    }
    return window;
  }

  private _setupScrollListener(): void {
    this._teardownScrollListener();

    this._currentScrollContainer = this._resolveScrollContainer();
    this._scrollHandlerBound = () => this._handleScroll();

    this._currentScrollContainer.addEventListener(
      'scroll',
      this._scrollHandlerBound,
      { passive: true },
    );

    // Initial check
    this._handleScroll();
  }

  private _teardownScrollListener(): void {
    if (this._currentScrollContainer && this._scrollHandlerBound) {
      this._currentScrollContainer.removeEventListener(
        'scroll',
        this._scrollHandlerBound,
      );
    }
    this._scrollHandlerBound = undefined;
    this._currentScrollContainer = undefined;
  }

  private _handleScroll(): void {
    if (!this.backTop) return;

    const container = this._currentScrollContainer ?? window;
    let scrollTop = 0;

    if (container instanceof Window) {
      scrollTop = window.scrollY ?? document.documentElement.scrollTop ?? 0;
    } else {
      scrollTop = (container as HTMLElement).scrollTop ?? 0;
    }

    const shouldHide = scrollTop < this.visibilityHeight;
    if (this.hiddenBackTop !== shouldHide) {
      this.hiddenBackTop = shouldHide;
    }
  }

  private _handleSlotChange(event: Event): void {
    const slot = event.target as HTMLSlotElement;
    if (slot.name === 'icon') {
      this._hasSlottedIcon = slot.assignedElements().length > 0;
    }
  }

  private _handleClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    if (this.backTop) {
      this._scrollToTop();
    }

    this.dispatchEvent(
      new CustomEvent('vi-float-button-click', {
        bubbles: true,
        composed: true,
        detail: { originalEvent: event },
      }),
    );
  }

  private _scrollToTop(): void {
    const container = this._resolveScrollContainer();
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const behavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

    if (container instanceof Window) {
      window.scrollTo({ top: 0, behavior });
    } else {
      container.scrollTo({ top: 0, behavior });
    }

    this.dispatchEvent(
      new CustomEvent('vi-float-button-back-top', {
        bubbles: true,
        composed: true,
        detail: { scrollTarget: container },
      }),
    );
  }

  private _renderBadge(): TemplateResult | typeof nothing {
    if (this.badgeDot) {
      return html`
        <span class="float-button__badge" part="badge" aria-hidden="true">
          <span class="badge-dot"></span>
        </span>
      `;
    }

    if (this.badge !== undefined && this.badge !== null && this.badge !== '') {
      return html`
        <span class="float-button__badge" part="badge" aria-hidden="true">
          <span class="badge-count">${this.badge}</span>
        </span>
      `;
    }

    return nothing;
  }

  private _renderIcon(): TemplateResult {
    return html`
      <span class="float-button__icon" part="icon">
        <slot name="icon" @slotchange="${this._handleSlotChange}"></slot>
        ${!this._hasSlottedIcon && this.backTop
          ? html`<vi-icon name="chevron-up" class="default-icon"></vi-icon>`
          : nothing}
      </span>
    `;
  }

  private _renderButtonContent(): TemplateResult {
    const isSquare = this.shape === 'square';
    const isSm = this.size === 'sm';
    const isPrimary = this.type === 'primary';

    const classes = [
      'float-button',
      isSquare ? 'float-button--square' : '',
      isSm ? 'float-button--sm' : '',
      isPrimary ? 'float-button--primary' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const accessibleLabel =
      this.ariaLabel ??
      (this.tooltip
        ? this.tooltip
        : this.backTop
          ? 'Back to top'
          : this.description
            ? this.description
            : undefined);

    if (this.href) {
      return html`
        <a
          class="${classes}"
          part="button"
          href="${this.href}"
          target="${this.target ?? nothing}"
          tabindex="${this.disabled ? -1 : 0}"
          role="${this.inGroup ? 'menuitem' : nothing}"
          aria-label="${accessibleLabel ?? nothing}"
          aria-disabled="${this.disabled ? 'true' : nothing}"
          @click="${this._handleClick}"
        >
          ${this._renderBadge()} ${this._renderIcon()}
          ${this.description
            ? html`
                <span class="float-button__description" part="description">
                  <slot name="description">${this.description}</slot>
                </span>
              `
            : html`<slot name="description"></slot>`}
          <slot></slot>
        </a>
      `;
    }

    return html`
      <button
        class="${classes}"
        part="button"
        type="button"
        ?disabled="${this.disabled}"
        tabindex="${this.disabled ? -1 : 0}"
        role="${this.inGroup ? 'menuitem' : nothing}"
        aria-label="${accessibleLabel ?? nothing}"
        @click="${this._handleClick}"
      >
        ${this._renderBadge()} ${this._renderIcon()}
        ${this.description
          ? html`
              <span class="float-button__description" part="description">
                <slot name="description">${this.description}</slot>
              </span>
            `
          : html`<slot name="description"></slot>`}
        <slot></slot>
      </button>
    `;
  }

  override render(): TemplateResult {
    const inner = html`
      <div class="float-button__control" part="control">
        ${this._renderButtonContent()}
      </div>
    `;

    if (this.tooltip && !this.disabled) {
      return html`
        <vi-tooltip content="${this.tooltip}" placement="left">
          ${inner}
        </vi-tooltip>
      `;
    }

    return inner;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-float-button': ViFloatButton;
  }
}
