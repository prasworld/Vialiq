import { css, html, nothing, unsafeCSS, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { FocusableMixin } from '../base/focusable-mixin.js';
import { ViElement } from '../base/vi-element.js';
import buttonStyles from './vi-button.scss?inline';

/**
 * Button visual variant.
 * Defined here, not in ViElement — each component owns its variant type
 * (functional composition, not inheritance). Different components may
 * support different subsets of these values.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'ghost';

/**
 * Button size scale. Controls padding and font-size via CSS custom properties.
 * xs → sm → md (default) → lg
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Icon placement relative to the label.
 * 'start' (default) places the icon before the text; 'end' places it after.
 * Controlled via CSS `order` — no extra wrapper elements needed.
 */
export type ButtonIconPlacement = 'start' | 'end';

/**
 * vi-button
 * Self-styled button component using Flux UI token fallbacks.
 *
 * @element vi-button
 * @attr variant        - Visual variant: primary | secondary | danger | success | info
 * @attr size           - Size scale: xs | sm | md | lg (default: md)
 * @attr icon-placement - Icon slot position: start | end (default: start)
 * @attr disabled       - Disables the button
 * @attr full-width     - Stretches button to fill its container
 * @attr icon-only      - Styles the button for an icon-only layout
 *
 * @slot           - Button label (text / content)
 * @slot icon      - A single icon (vi-icon or any inline SVG)
 *
 * @csspart button - The inner <button> element
 * @csspart icon   - The icon slot wrapper
 * @csspart label  - The label span
 */
@customElement('vi-button')
export class ViButton extends FocusableMixin(ViElement) {
  static override styles = css`${unsafeCSS(buttonStyles)}`;

  protected override get _focusableElement(): HTMLButtonElement | null {
    return this.shadowRoot?.querySelector('button') ?? null;
  }

  /** Visual variant. */
  @property({ type: String, reflect: true }) accessor variant: ButtonVariant = 'primary';

  /** Size scale — controls padding and font-size. */
  @property({ type: String, reflect: true }) accessor size: ButtonSize = 'md';

  /** Icon placement: 'start' (before label) or 'end' (after label). CSS order handles it — no DOM changes on toggle. */
  @property({ type: String, reflect: true, attribute: 'icon-placement' }) accessor iconPlacement: ButtonIconPlacement = 'start';

  /** When true, stretches the button to fill the width of its container. */
  @property({ type: Boolean, reflect: true, attribute: 'full-width' }) accessor fullWidth = false;

  /** When true, styles the button for an icon-only layout (typically square with equal padding). */
  @property({ type: Boolean, reflect: true, attribute: 'icon-only' }) accessor iconOnly = false;

  /** Disables the button. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** The button type — 'button', 'submit', or 'reset'. Forwarded to the inner native button. */
  @property({ type: String, reflect: true }) accessor type: 'button' | 'submit' | 'reset' = 'button';

  /** Accessible label forwarded to the inner native button. */
  @property({ attribute: 'aria-label' }) override accessor ariaLabel: string | null = null;

  @state() private accessor _hasIcon = false;

  override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has('disabled')) {
      if (this.disabled) {
        // Becoming disabled — always remove from tab order.
        this._setHostFocusable(false);
      } else if (changed.get('disabled') !== undefined) {
        // Transitioning from a real disabled state back to enabled.
        // Skip when old value is `undefined` (first render) — connectedCallback
        // already set the correct tabIndex, respecting any consumer tabindex attr.
        this._setHostFocusable(true);
      }
    }
  }

  private onIconSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    this._hasIcon = slot.assignedElements({ flatten: true }).length > 0;
  }

  private onClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
// Shadow DOM isolation: a <button type="reset|submit"> inside a shadow root
// cannot natively interact with the parent form. We must do it manually.
if (this.type === 'reset' || this.type === 'submit') {
  const form = event
    .composedPath()
    .find((n): n is HTMLFormElement => n instanceof HTMLFormElement);

  if (form) {
    if (this.type === 'reset') {
      form.reset();
    } else {
      const submitter = event.currentTarget instanceof HTMLButtonElement ? event.currentTarget : undefined;
      form.requestSubmit(submitter);
    }
  }
}
  }

  override render(): TemplateResult {
    const { _hasIcon, disabled, onClick, onIconSlotChange } = this;

    return html`
      <button
        class="button"
        part="button"
        type=${this.type}
        tabindex="0"
        ?disabled=${disabled}
        aria-label=${this.ariaLabel ?? nothing}
        @click=${onClick}
      >
        <slot
          name="icon"
          class="icon"
          part="icon"
          ?hidden=${!_hasIcon}
          @slotchange=${onIconSlotChange}
        ></slot>
        <span part="label" class="label"><slot></slot></span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-button': ViButton;
  }
}
