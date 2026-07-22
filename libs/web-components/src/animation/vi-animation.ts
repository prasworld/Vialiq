import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export type AnimationPreset =
  | 'fade-in' | 'fade-out' | 'fade-in-up' | 'fade-in-down' | 'fade-in-left' | 'fade-in-right'
  | 'zoom-in' | 'zoom-out' | 'scale-up' | 'scale-down' | 'bounce-in' | 'bounce-out'
  | 'slide-in-top' | 'slide-in-bottom' | 'slide-in-left' | 'slide-in-right'
  | 'slide-out-top' | 'slide-out-bottom' | 'slide-out-left' | 'slide-out-right'
  | 'flip-x' | 'flip-y' | 'expand-vertical' | 'collapse-vertical'
  | 'pulse' | 'bounce' | 'shake' | 'shimmer';

export type StaggerDirection = 'normal' | 'reverse' | 'center' | 'random';
export type AnimationPhase = 'enter' | 'exit' | 'custom';

export interface ViAnimationEventDetail {
  name: string;
  target: HTMLElement;
  phase: AnimationPhase;
  duration?: number;
  delay?: number;
  completed?: boolean;
}

const PRESET_KEYFRAMES: Record<string, Keyframe[]> = {
  'fade-in': [
    { opacity: 0 },
    { opacity: 1 }
  ],
  'fade-out': [
    { opacity: 1 },
    { opacity: 0 }
  ],
  'fade-in-up': [
    { opacity: 0, transform: 'translate3d(0, 1rem, 0)' },
    { opacity: 1, transform: 'translate3d(0, 0, 0)' }
  ],
  'fade-in-down': [
    { opacity: 0, transform: 'translate3d(0, -1rem, 0)' },
    { opacity: 1, transform: 'translate3d(0, 0, 0)' }
  ],
  'fade-out-up': [
    { opacity: 1, transform: 'translate3d(0, 0, 0)' },
    { opacity: 0, transform: 'translate3d(0, -1rem, 0)' }
  ],
  'fade-out-down': [
    { opacity: 1, transform: 'translate3d(0, 0, 0)' },
    { opacity: 0, transform: 'translate3d(0, 1rem, 0)' }
  ],
  'zoom-in': [
    { opacity: 0, transform: 'scale3d(0.92, 0.92, 0.92)' },
    { opacity: 1, transform: 'scale3d(1, 1, 1)' }
  ],
  'zoom-out': [
    { opacity: 1, transform: 'scale3d(1, 1, 1)' },
    { opacity: 0, transform: 'scale3d(0.92, 0.92, 0.92)' }
  ],
  'slide-in-bottom': [
    { transform: 'translate3d(0, 100%, 0)' },
    { transform: 'translate3d(0, 0, 0)' }
  ],
  'slide-out-bottom': [
    { transform: 'translate3d(0, 0, 0)' },
    { transform: 'translate3d(0, 100%, 0)' }
  ],
  'bounce-in': [
    { opacity: 0, transform: 'scale3d(0.3, 0.3, 0.3)' },
    { opacity: 0.9, transform: 'scale3d(1.05, 1.05, 1.05)' },
    { opacity: 1, transform: 'scale3d(1, 1, 1)' }
  ],
  'expand-vertical': [
    { height: '0px', opacity: 0, overflow: 'hidden' },
    { height: 'auto', opacity: 1, overflow: 'visible' }
  ],
  'collapse-vertical': [
    { height: 'auto', opacity: 1, overflow: 'hidden' },
    { height: '0px', opacity: 0, overflow: 'hidden' }
  ],
  'pulse': [
    { transform: 'scale3d(1, 1, 1)' },
    { transform: 'scale3d(1.05, 1.05, 1.05)' },
    { transform: 'scale3d(1, 1, 1)' }
  ],
  'shimmer': [
    { backgroundPosition: '-200% 0' },
    { backgroundPosition: '200% 0' }
  ]
};

@customElement('vi-animation')
export class ViAnimation extends LitElement {
  static override styles = css`
    :host {
      display: contents;
    }
    :host([hidden]) {
      display: none !important;
    }
  `;

  @property({ type: String, reflect: true }) accessor name: AnimationPreset | string = 'fade-in';
  @property({ type: String, reflect: true }) accessor enter: AnimationPreset | string = '';
  @property({ type: String, reflect: true }) accessor exit: AnimationPreset | string = '';
  @property({ type: Number, reflect: true }) accessor duration = 300;
  @property({ type: Number, reflect: true }) accessor delay = 0;
  @property({ type: String, reflect: true }) accessor easing = 'cubic-bezier(0.2, 0, 0, 1)';
  @property({ type: Number, reflect: true }) accessor iterations = 1;
  @property({ type: String, reflect: true }) accessor direction: PlaybackDirection = 'normal';
  @property({ type: String, reflect: true }) accessor fill: FillMode = 'forwards';
  @property({ type: Boolean, reflect: true }) accessor open = true;
  @property({ type: Boolean, attribute: 'auto-play', reflect: true }) accessor autoPlay = true;

  @property({ type: Boolean, reflect: true }) accessor cascade = false;
  @property({ type: Number, reflect: true }) accessor stagger = 50;
  @property({ type: String, attribute: 'stagger-selector', reflect: true }) accessor staggerSelector = ':scope > *';
  @property({ type: String, attribute: 'stagger-direction', reflect: true }) accessor staggerDirection: StaggerDirection = 'normal';

  @property({ type: String, attribute: 'reduced-motion', reflect: true }) accessor reducedMotion: 'auto' | 'disable' | 'fade-only' = 'auto';

  @property({ attribute: false }) accessor keyframes: Keyframe[] | PropertyIndexedKeyframes | null = null;

  @state() private accessor _isAnimating = false;
  private _activeAnimations: Animation[] = [];
  private _animationPromise: Promise<void> | null = null;

  override connectedCallback() {
    super.connectedCallback();
    if (this.autoPlay && this.open) {
      this.updateComplete.then(() => this.play());
    }
    if (!this.open && !this.hasAttribute('hidden')) {
      this.hidden = true;
      this.setAttribute('hidden', '');
    }
  }

  override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('open') && !changedProperties.isFirstProperties) {
      if (this.open) {
        this._animationPromise = this._playShowAnimation();
      } else {
        this._animationPromise = this._playHideAnimation();
      }
    }
  }

  public getAnimations(): Animation[] {
    return [...this._activeAnimations];
  }

  private async _playShowAnimation(): Promise<void> {
    this.hidden = false;
    if (this.hasAttribute("hidden")) {
      this.removeAttribute("hidden");
    }
    const animName = this.enter || this.name || 'fade-in';
    await this._runAnimationSequence(animName, 'enter');
  }

  private async _playHideAnimation(): Promise<void> {
    const animName = this.exit || (this.name.includes('in') ? this.name.replace('in', 'out') : 'fade-out');
    await this._runAnimationSequence(animName, 'exit');
    this.hidden = true;
    if (!this.hasAttribute("hidden")) {
      this.setAttribute("hidden", "");
    }
  }

  public async show(): Promise<void> {
    if (this.open) return;
    this.open = true;
    await this.updateComplete;
    await this._animationPromise;
  }

  public async hide(): Promise<void> {
    if (!this.open) return;
    this.open = false;
    await this.updateComplete;
    await this._animationPromise;
  }

  public async toggle(): Promise<void> {
    if (this.open) {
      await this.hide();
    } else {
      await this.show();
    }
  }

  public async play(): Promise<void> {
    const phase: AnimationPhase = this.open ? 'enter' : 'custom';
    await this._runAnimationSequence(this.name, phase);
  }

  public pause(): void {
    this._activeAnimations.forEach(a => a.pause());
  }

  public resume(): void {
    this._activeAnimations.forEach(a => a.play());
  }

  public reverse(): void {
    this._activeAnimations.forEach(a => a.reverse());
  }

  public cancel(): void {
    this._activeAnimations.forEach(a => a.cancel());
    this._activeAnimations = [];
    this._isAnimating = false;
    this._dispatch('vi-animation-cancel', { name: this.name, target: this, phase: 'custom' });
  }

  public finish(): void {
    this._activeAnimations.forEach(a => a.finish());
    this._dispatch('vi-animation-finish', { name: this.name, target: this, phase: 'custom' });
  }

  private _getTargetElements(): HTMLElement[] {
    const slot = this.shadowRoot?.querySelector('slot');
    if (!slot) return [this];

    const assignedNodes = slot.assignedElements({ flatten: true }) as HTMLElement[];
    if (assignedNodes.length === 0) return [this];

    if (!this.cascade) {
      return assignedNodes;
    }

    const targetElements: HTMLElement[] = [];
    assignedNodes.forEach(node => {
      if (node.matches(this.staggerSelector)) {
        targetElements.push(node);
      }
      const children = Array.from(node.querySelectorAll<HTMLElement>(this.staggerSelector));
      targetElements.push(...children);
    });

    return targetElements.length > 0 ? targetElements : assignedNodes;
  }

  private _getKeyframes(animName: string, isReducedMotion: boolean): Keyframe[] {
    if (isReducedMotion) {
      return PRESET_KEYFRAMES['fade-in'];
    }
    if (this.keyframes) {
      return Array.isArray(this.keyframes) ? this.keyframes : [this.keyframes];
    }
    return PRESET_KEYFRAMES[animName] || PRESET_KEYFRAMES['fade-in'];
  }

  private _calculateStaggerDelay(index: number, total: number): number {
    if (!this.cascade || total <= 1) return this.delay;

    let orderIndex = index;
    if (this.staggerDirection === 'reverse') {
      orderIndex = total - 1 - index;
    } else if (this.staggerDirection === 'center') {
      const middle = (total - 1) / 2;
      orderIndex = Math.abs(middle - index);
    } else if (this.staggerDirection === 'random') {
      orderIndex = Math.floor(Math.random() * total);
    }

    return this.delay + (orderIndex * this.stagger);
  }

  private async _runAnimationSequence(animName: string, phase: AnimationPhase): Promise<void> {
    const isReduced = this._shouldReduceMotion();
    const targets = this._getTargetElements();
    if (targets.length === 0) return;

    this.cancel();
    this._isAnimating = true;

    const actualDuration = isReduced ? Math.min(this.duration, 100) : this.duration;

    this._dispatch('vi-animation-start', {
      name: animName,
      target: this,
      phase,
      duration: actualDuration,
      delay: this.delay
    });

    const keyframes = this._getKeyframes(animName, isReduced);

    const animationPromises = targets.map((el, index) => {
      const elementDelay = isReduced ? 0 : this._calculateStaggerDelay(index, targets.length);

      const anim = el.animate(keyframes, {
        duration: actualDuration,
        delay: elementDelay,
        easing: this.easing,
        iterations: this.iterations,
        direction: this.direction,
        fill: this.fill
      });

      this._activeAnimations.push(anim);
      return anim.finished.catch(() => null);
    });

    await Promise.all(animationPromises);

    this._isAnimating = false;
    this._activeAnimations = [];

    this._dispatch('vi-animation-end', {
      name: animName,
      target: this,
      phase,
      completed: true
    });
  }

  private _shouldReduceMotion(): boolean {
    if (this.reducedMotion === 'disable') return false;
    if (this.reducedMotion === 'fade-only') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private _dispatch(eventName: string, detail: ViAnimationEventDetail) {
    this.dispatchEvent(new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true
    }));
  }

  override render() {
    return html`<slot></slot>`;
  }
}
