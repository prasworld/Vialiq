import { html, css, nothing, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import { FocusableMixin } from '../base/focusable-mixin.js';
import '../icons/vi-icon.js';
import linkStyles from './vi-link.scss?inline';

type LinkVariant = 'primary' | 'secondary' | 'muted';
type LinkSize = 'inherit' | 'sm' | 'md' | 'lg';
type LinkUnderline = 'always' | 'hover' | 'none';

@customElement('vi-link')
export class ViLink extends FocusableMixin(ViElement) {
  static override styles = css`
    ${unsafeCSS(linkStyles)}
  `;

  @property({ type: String }) accessor href = '';
  @property({ type: String }) accessor target = '_self';
  @property({ type: String }) accessor rel = '';
  @property({ type: String }) accessor download = '';
  @property({ type: String, reflect: true }) accessor variant: LinkVariant =
    'primary';
  @property({ type: String }) accessor size: LinkSize = 'inherit';
  @property({ type: String }) accessor underline: LinkUnderline = 'hover';
  @property({ type: Boolean, reflect: true }) accessor disabled = false;
  @property({ type: Boolean }) accessor external = false;

  protected override get _focusableElement() {
    return this.shadowRoot?.querySelector('a') as HTMLElement;
  }

  protected get _effectiveTarget() {
    return this.external ? '_blank' : this.target;
  }

  protected get _effectiveRel() {
    const isExternal = this.external || this.target === '_blank';
    if (!isExternal) {
      return this.rel || nothing;
    }
    const rels = new Set((this.rel || '').split(' ').filter(Boolean));
    rels.add('noopener');
    rels.add('noreferrer');
    return Array.from(rels).join(' ');
  }

  override render() {
    const effectiveTarget = this._effectiveTarget;
    const effectiveRel = this._effectiveRel;
    const ariaDisabled = this.disabled ? 'true' : null;
    const href = this.disabled || !this.href ? nothing : this.href;

    const ariaLabel = this.getAttribute('aria-label') || nothing;

    return html`
      <a
        part="link"
        class="link ${this.disabled ? 'disabled' : ''} variant-${this
          .variant} size-${this.size} underline-${this.underline}"
        href=${href}
        target=${effectiveTarget}
        rel=${effectiveRel}
        download=${this.download || nothing}
        aria-disabled=${ariaDisabled}
        aria-label=${ariaLabel}
        tabindex=${this.disabled ? '-1' : '0'}
      >
        <span part="icon"><slot name="icon"></slot></span>
        <slot></slot>
        ${this.external
          ? html`<span part="external-icon"
              ><vi-icon name="external-link" size="14"></vi-icon
            ></span>`
          : nothing}
      </a>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-link': ViLink;
  }
}
