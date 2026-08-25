import { html, css, nothing, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element';
import { FocusableMixin } from '../base/focusable-mixin';
import linkStyles from './vi-link.scss?inline';

type LinkVariant = 'primary' | 'secondary' | 'muted';
type LinkSize = 'inherit' | 'sm' | 'md' | 'lg';
type LinkUnderline = 'always' | 'hover' | 'none';

@customElement('vi-link')
export class ViLink extends FocusableMixin(ViElement) {
  static styles = [
    ViElement.styles,
    css`${unsafeCSS(linkStyles)}`
  ];

  @property({ type: String }) href = '';
  @property({ type: String }) target = '_self';
  @property({ type: String }) rel = '';
  @property({ type: String }) download = '';
  @property({ type: String, reflect: true }) variant: LinkVariant = 'primary';
  @property({ type: String }) size: LinkSize = 'inherit';
  @property({ type: String }) underline: LinkUnderline = 'hover';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean }) external = false;

  get _focusableElement() {
    return this.shadowRoot?.querySelector('a') as HTMLElement;
  }

  private _getEffectiveTarget() {
    return this.external ? '_blank' : this.target;
  }

  private _getEffectiveRel() {
    const isExternal = this.external || this.target === '_blank';
    if (!isExternal) {
      return this.rel || nothing;
    }
    const rels = new Set((this.rel || '').split(' ').filter(Boolean));
    rels.add('noopener');
    rels.add('noreferrer');
    return Array.from(rels).join(' ');
  }

  render() {
    const effectiveTarget = this._getEffectiveTarget();
    const effectiveRel = this._getEffectiveRel();
    const ariaDisabled = this.disabled ? 'true' : null;
    const href = this.disabled ? nothing : this.href;
    const ariaLabel = this.external ? `${this.textContent || ''} (opens in new tab)`.trim() : nothing;

    return html`
      <a
        part="link"
        class="link ${this.disabled ? 'disabled' : ''} variant-${this.variant} size-${this.size} underline-${this.underline}"
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
        ${this.external ? html`<span part="external-icon"><vi-icon name="external-link" size="14"></vi-icon></span>` : nothing}
      </a>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-link': ViLink;
  }
}
