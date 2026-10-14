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
import { sanitizeUrl } from '../base/sanitize-url.js';
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
 * @attr rel - Relationship attribute for anchor link (automatically includes noopener noreferrer for _blank)
 * @attr badge - Numeric count or text badge
 * @attr badge-dot - Show a status dot badge
 * @attr badge-status - Badge status semantic color: neutral | primary | success | warning | danger | info
 * @attr back-top - Enable back-to-top scroll behavior
 * @attr visibility-height - Scroll threshold (px) before backTop button appears (default: 400)
 * @attr scroll-target - CSS selector or element ID for custom scroll container
 * @attr duration - Scroll animation duration in milliseconds for window and custom containers (default: 450, 0 for instant)
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

/**
 * Cubic ease-in-out easing function.
 * @param t Normalized progress from 0 to 1.
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

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

  /** Relationship attribute for anchor link. Enforces noopener noreferrer when target is _blank. */
  @property({ type: String, reflect: true })
  accessor rel: string | undefined = undefined;

  protected get _effectiveRel(): string | typeof nothing {
    const isBlank = this.target === '_blank';
    if (!isBlank && !this.rel) {
      return nothing;
    }
    const rels = new Set((this.rel || '').split(' ').filter(Boolean));
    if (isBlank) {
      rels.add('noopener');
      rels.add('noreferrer');
    }
    return rels.size > 0 ? Array.from(rels).join(' ') : nothing;
  }

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

  /** Target scrollable container CSS selector or element ID. */
  @property({ type: String, attribute: 'scroll-target' })
  accessor scrollTarget: string | undefined = undefined;

  /** Scroll animation duration in milliseconds (applies to both window and custom scroll targets; 0 for instant). */
  @property({ type: Number })
  accessor duration = 450;

  /** Disabled state. */
  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  /** Whether the button participates in sequential tab navigation. Used for roving tabindex in groups. */
  @property({ type: Boolean })
  accessor tabbable = true;

  /** Reflects if the button is placed inside a <vi-float-button-group>. */
  @property({ type: Boolean, reflect: true, attribute: 'in-group' })
  accessor inGroup = false;

  /** Accessible label. */
  @property({ attribute: 'aria-label' })
  override accessor ariaLabel: string | null = null;

  /** Pressed state for toggle button functionality. */
  @property({ attribute: 'aria-pressed', reflect: true })
  accessor ariaPressed: string | null = null;

  /** Popup type (e.g. 'menu', 'dialog') forwarded to inner native button. */
  @property({ attribute: 'aria-haspopup', reflect: true })
  accessor ariaHasPopup: string | null = null;

  /** Expanded state forwarded to inner native button. */
  @property({ attribute: 'aria-expanded', reflect: true })
  accessor ariaExpanded: string | null = null;

  /** Internal state tracking back-top visibility below threshold. */
  @property({ type: Boolean, reflect: true, attribute: 'hidden-back-top' })
  accessor hiddenBackTop = false;

  @state() private accessor _hasSlottedIcon = false;
  @state() private accessor _hasSlottedTooltip = false;
  @state() private accessor _hasSlottedDescription = false;
  private _scrollHandlerBound?: () => void;
  private _currentScrollContainer?: HTMLElement | Window;
  private _scrollTargetObserver?: MutationObserver;
  private _scrollAnimationId?: number;

  private get _hasSlottedTooltipContent(): boolean {
    if (this._hasSlottedTooltip) return true;
    return Array.from(this.children).some(
      (child) => child.getAttribute('slot') === 'tooltip',
    );
  }

  private _handleTooltipSlotChange(event: Event): void {
    const slot = event.target as HTMLSlotElement;
    const nodes = slot.assignedNodes({ flatten: true });
    this._hasSlottedTooltip = nodes.some(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE ||
        (node.nodeType === Node.TEXT_NODE &&
          (node.textContent ?? '').trim() !== ''),
    );
  }

  private get _hasSlottedDescriptionContent(): boolean {
    if (this._hasSlottedDescription) return true;
    return Array.from(this.children).some(
      (child) => child.getAttribute('slot') === 'description',
    );
  }

  private _handleDescriptionSlotChange(event: Event): void {
    const slot = event.target as HTMLSlotElement;
    const nodes = slot.assignedNodes({ flatten: true });
    this._hasSlottedDescription = nodes.some(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE ||
        (node.nodeType === Node.TEXT_NODE &&
          (node.textContent ?? '').trim() !== ''),
    );
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.tabbable || this.disabled) {
      this._setHostFocusable(false);
    }
    if (this.backTop) {
      this._setupScrollListener();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._cancelScrollAnimation();
    this._teardownScrollListener();
  }

  override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (
      changedProperties.has('disabled') ||
      changedProperties.has('tabbable')
    ) {
      this._setHostFocusable(!this.disabled && this.tabbable);
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
    if (!this.scrollTarget) {
      return window;
    }

    const target = this.scrollTarget.trim();
    if (!target) {
      return window;
    }

    const rootNode = (this.getRootNode() as Document | ShadowRoot) ?? document;

    // 1. Direct ID lookup (handles bare IDs without '#')
    if (
      'getElementById' in rootNode &&
      typeof rootNode.getElementById === 'function'
    ) {
      const byId = rootNode.getElementById(target);
      if (byId) return byId;
    }
    const docById = document.getElementById(target);
    if (docById) return docById;

    // If target has a leading '#', also try getElementById with '#' stripped
    if (target.startsWith('#')) {
      const rawId = target.slice(1);
      if (
        'getElementById' in rootNode &&
        typeof rootNode.getElementById === 'function'
      ) {
        const byId = rootNode.getElementById(rawId);
        if (byId) return byId;
      }
      const docById = document.getElementById(rawId);
      if (docById) return docById;
    }

    // 2. Query selector lookup (CSS selector or ID with '#')
    try {
      const el = (rootNode.querySelector(target) ??
        document.querySelector(target)) as HTMLElement | null;
      if (el) return el;
    } catch {
      // Ignore syntax errors from invalid selector strings
    }

    // 3. Fallback: if bare ID didn't match a selector, attempt escaping ID as selector
    if (!/^([#.[:>])/.test(target)) {
      try {
        const escapedSelector = `#${CSS.escape(target)}`;
        const el = (rootNode.querySelector(escapedSelector) ??
          document.querySelector(escapedSelector)) as HTMLElement | null;
        if (el) return el;
      } catch {
        // Ignore escaping errors
      }
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

    // If a custom scrollTarget was configured but resolved to window,
    // observe the DOM to retry resolving when the target is inserted late.
    if (this.scrollTarget && this._currentScrollContainer instanceof Window) {
      this._observeForScrollTarget();
    }
  }

  private _observeForScrollTarget(): void {
    this._disconnectScrollTargetObserver();

    const rootNode = (this.getRootNode() as Document | ShadowRoot) ?? document;
    const targetsToObserve: Node[] = [];

    if (rootNode instanceof Document) {
      if (rootNode.documentElement) targetsToObserve.push(rootNode.documentElement);
    } else if (rootNode instanceof ShadowRoot) {
      targetsToObserve.push(rootNode);
      if (document.documentElement) targetsToObserve.push(document.documentElement);
    } else {
      if (document.documentElement) targetsToObserve.push(document.documentElement);
    }

    if (!targetsToObserve.length) return;

    this._scrollTargetObserver = new MutationObserver(() => {
      const container = this._resolveScrollContainer();
      if (!(container instanceof Window)) {
        this._disconnectScrollTargetObserver();
        this._setupScrollListener();
      }
    });

    for (const node of targetsToObserve) {
      this._scrollTargetObserver.observe(node, {
        childList: true,
        subtree: true,
      });
    }
  }

  private _disconnectScrollTargetObserver(): void {
    if (this._scrollTargetObserver) {
      this._scrollTargetObserver.disconnect();
      this._scrollTargetObserver = undefined;
    }
  }

  private _cancelScrollAnimation(): void {
    if (this._scrollAnimationId !== undefined) {
      cancelAnimationFrame(this._scrollAnimationId);
      this._scrollAnimationId = undefined;
    }
  }

  private _teardownScrollListener(): void {
    this._cancelScrollAnimation();
    this._disconnectScrollTargetObserver();
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

    // If configured scrollTarget was previously unresolved, check if it's now available
    if (this.scrollTarget && this._currentScrollContainer instanceof Window) {
      const resolved = this._resolveScrollContainer();
      if (!(resolved instanceof Window)) {
        this._disconnectScrollTargetObserver();
        this._setupScrollListener();
        return;
      }
    }

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
    const isWindow = container instanceof Window;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const duration =
      typeof this.duration === 'number' && !isNaN(this.duration)
        ? Math.max(0, this.duration)
        : 450;

    this._cancelScrollAnimation();

    const getScrollTop = (): number => {
      if (isWindow) {
        return (
          window.scrollY ??
          window.pageYOffset ??
          document.documentElement?.scrollTop ??
          document.body?.scrollTop ??
          0
        );
      }
      return (container as HTMLElement).scrollTop ?? 0;
    };

    const setScrollTop = (top: number): void => {
      if (isWindow) {
        if (typeof window.scrollTo === 'function') {
          try {
            window.scrollTo({ top, behavior: 'auto' });
          } catch {
            try {
              window.scrollTo(0, top);
            } catch {
              // Ignore
            }
          }
        }
        if (document.documentElement) {
          document.documentElement.scrollTop = top;
        }
        if (document.body) {
          document.body.scrollTop = top;
        }
      } else {
        const el = container as HTMLElement;
        if (typeof el.scrollTo === 'function') {
          try {
            el.scrollTo({ top, behavior: 'auto' });
          } catch {
            // Ignore
          }
        }
        el.scrollTop = top;
      }
    };

    const startTop = getScrollTop();

    if (prefersReducedMotion || duration === 0 || startTop <= 0) {
      setScrollTop(0);
    } else {
      const startTime = performance.now();
      const step = (currentTime: number): void => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);
        const currentTop = Math.max(
          0,
          Math.round(startTop * (1 - easedProgress)),
        );

        setScrollTop(currentTop);

        if (progress < 1) {
          this._scrollAnimationId = requestAnimationFrame(step);
        } else {
          this._scrollAnimationId = undefined;
          setScrollTop(0);
        }
      };

      this._scrollAnimationId = requestAnimationFrame(step);
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

  private _renderDescription(): TemplateResult {
    const hasDescription =
      Boolean(this.description) || this._hasSlottedDescriptionContent;

    return html`
      <span
        class="float-button__description"
        part="description"
        ?hidden="${!hasDescription}"
      >
        <slot
          name="description"
          @slotchange="${this._handleDescriptionSlotChange}"
        >${this.description ?? ''}</slot>
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

    const safeHref = sanitizeUrl(this.href);

    const effectiveAriaHasPopup =
      this.ariaHasPopup !== null && this.ariaHasPopup !== undefined
        ? String(this.ariaHasPopup)
        : nothing;

    const effectiveAriaExpanded =
      this.ariaExpanded !== null && this.ariaExpanded !== undefined
        ? String(this.ariaExpanded)
        : nothing;

    if (safeHref) {
      return html`
        <a
          class="${classes}"
          part="button"
          href="${this.disabled ? nothing : safeHref}"
          target="${this.target ?? nothing}"
          rel="${this._effectiveRel}"
          tabindex="${this.disabled ? -1 : this.tabbable ? 0 : -1}"
          role="${this.inGroup && !this.ariaHasPopup ? 'menuitem' : nothing}"
          aria-label="${accessibleLabel ?? nothing}"
          aria-pressed="${this.ariaPressed ?? nothing}"
          aria-disabled="${this.disabled ? 'true' : nothing}"
          aria-haspopup="${effectiveAriaHasPopup}"
          aria-expanded="${effectiveAriaExpanded}"
          @click="${this._handleClick}"
        >
          ${this._renderBadge()} ${this._renderIcon()}
          ${this._renderDescription()}
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
        tabindex="${this.disabled ? -1 : this.tabbable ? 0 : -1}"
        role="${this.inGroup && !this.ariaHasPopup ? 'menuitem' : nothing}"
        aria-label="${accessibleLabel ?? nothing}"
        aria-pressed="${this.ariaPressed ?? nothing}"
        aria-disabled="${this.disabled ? 'true' : nothing}"
        aria-haspopup="${effectiveAriaHasPopup}"
        aria-expanded="${effectiveAriaExpanded}"
        @click="${this._handleClick}"
      >
        ${this._renderBadge()} ${this._renderIcon()}
        ${this._renderDescription()}
        <slot></slot>
      </button>
    `;
  }

  override render(): TemplateResult {
    const buttonContent = this._renderButtonContent();
    const hasTooltip =
      (Boolean(this.tooltip) || this._hasSlottedTooltipContent) &&
      !this.disabled;

    const inner = hasTooltip
      ? html`
          <vi-tooltip placement="left" .content="${this.tooltip || ''}">
            ${buttonContent}
            <slot
              name="tooltip"
              slot="content"
              @slotchange="${this._handleTooltipSlotChange}"
            >${this.tooltip ?? nothing}</slot>
          </vi-tooltip>
        `
      : html`
          ${buttonContent}
          <div hidden style="display: none;">
            <slot
              name="tooltip"
              @slotchange="${this._handleTooltipSlotChange}"
            ></slot>
          </div>
        `;

    return html`
      <div class="float-button__control" part="control">
        ${inner}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-float-button': ViFloatButton;
  }
}
