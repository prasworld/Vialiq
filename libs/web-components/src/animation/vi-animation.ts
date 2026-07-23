import { css, html, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';
import animationStyles from './vi-animation.scss?inline';

export type AnimationPreset =
  | 'fade-in'
  | 'fade-out'
  | 'fade-in-up'
  | 'fade-in-down'
  | 'fade-in-left'
  | 'fade-in-right'
  | 'fade-out-up'
  | 'fade-out-down'
  | 'fade-out-left'
  | 'fade-out-right'
  | 'zoom-in'
  | 'zoom-out'
  | 'scale-up'
  | 'scale-down'
  | 'bounce-in'
  | 'bounce-out'
  | 'pop-in'
  | 'pop-out'
  | 'slide-in-top'
  | 'slide-in-bottom'
  | 'slide-in-left'
  | 'slide-in-right'
  | 'slide-out-top'
  | 'slide-out-bottom'
  | 'slide-out-left'
  | 'slide-out-right'
  | 'flip-x'
  | 'flip-y'
  | 'perspective-pop'
  | 'expand-vertical'
  | 'collapse-vertical'
  | 'expand-horizontal'
  | 'collapse-horizontal'
  | 'pulse'
  | 'bounce'
  | 'shake'
  | 'wobble'
  | 'heartbeat'
  | 'shimmer';

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

/**
 * Explicit exit counterpart map.
 * Replaces fragile string.replace('in','out') which corrupted strings like 'spin' -> 'spout'.
 */
const EXIT_COUNTERPART: Partial<Record<string, string>> = {
  'fade-in': 'fade-out',
  'fade-in-up': 'fade-out-down',
  'fade-in-down': 'fade-out-up',
  'fade-in-left': 'fade-out-right',
  'fade-in-right': 'fade-out-left',
  'zoom-in': 'zoom-out',
  'scale-up': 'scale-down',
  'bounce-in': 'bounce-out',
  'pop-in': 'pop-out',
  'slide-in-top': 'slide-out-top',
  'slide-in-bottom': 'slide-out-bottom',
  'slide-in-left': 'slide-out-left',
  'slide-in-right': 'slide-out-right',
  'flip-x': 'fade-out',
  'flip-y': 'fade-out',
  'perspective-pop': 'fade-out',
  'expand-vertical': 'collapse-vertical',
  'expand-horizontal': 'collapse-horizontal',
};

const PRESET_KEYFRAMES: Record<string, Keyframe[]> = {
  'fade-in': [{ opacity: 0 }, { opacity: 1 }],
  'fade-out': [{ opacity: 1 }, { opacity: 0 }],

  'fade-in-up': [
    { opacity: 0, transform: 'translate3d(0, 1rem, 0)' },
    { opacity: 1, transform: 'translate3d(0, 0, 0)' },
  ],
  'fade-in-down': [
    { opacity: 0, transform: 'translate3d(0, -1rem, 0)' },
    { opacity: 1, transform: 'translate3d(0, 0, 0)' },
  ],
  'fade-in-left': [
    { opacity: 0, transform: 'translate3d(-1rem, 0, 0)' },
    { opacity: 1, transform: 'translate3d(0, 0, 0)' },
  ],
  'fade-in-right': [
    { opacity: 0, transform: 'translate3d(1rem, 0, 0)' },
    { opacity: 1, transform: 'translate3d(0, 0, 0)' },
  ],

  'fade-out-up': [
    { opacity: 1, transform: 'translate3d(0, 0, 0)' },
    { opacity: 0, transform: 'translate3d(0, -1rem, 0)' },
  ],
  'fade-out-down': [
    { opacity: 1, transform: 'translate3d(0, 0, 0)' },
    { opacity: 0, transform: 'translate3d(0, 1rem, 0)' },
  ],
  'fade-out-left': [
    { opacity: 1, transform: 'translate3d(0, 0, 0)' },
    { opacity: 0, transform: 'translate3d(-1rem, 0, 0)' },
  ],
  'fade-out-right': [
    { opacity: 1, transform: 'translate3d(0, 0, 0)' },
    { opacity: 0, transform: 'translate3d(1rem, 0, 0)' },
  ],

  'zoom-in': [
    { opacity: 0, transform: 'scale3d(0.92, 0.92, 0.92)' },
    { opacity: 1, transform: 'scale3d(1, 1, 1)' },
  ],
  'zoom-out': [
    { opacity: 1, transform: 'scale3d(1, 1, 1)' },
    { opacity: 0, transform: 'scale3d(0.92, 0.92, 0.92)' },
  ],
  'scale-up': [
    { transform: 'scale3d(0.8, 0.8, 0.8)' },
    { transform: 'scale3d(1, 1, 1)' },
  ],
  'scale-down': [
    { transform: 'scale3d(1.2, 1.2, 1.2)' },
    { transform: 'scale3d(1, 1, 1)' },
  ],

  'bounce-in': [
    { opacity: 0, transform: 'scale3d(0.3, 0.3, 0.3)', offset: 0 },
    { opacity: 0.9, transform: 'scale3d(1.08, 1.08, 1.08)', offset: 0.5 },
    { opacity: 1, transform: 'scale3d(0.95, 0.95, 0.95)', offset: 0.75 },
    { opacity: 1, transform: 'scale3d(1, 1, 1)', offset: 1 },
  ],
  'bounce-out': [
    { opacity: 1, transform: 'scale3d(1, 1, 1)', offset: 0 },
    { opacity: 1, transform: 'scale3d(0.9, 0.9, 0.9)', offset: 0.2 },
    { opacity: 1, transform: 'scale3d(1.1, 1.1, 1.1)', offset: 0.5 },
    { opacity: 0, transform: 'scale3d(0.3, 0.3, 0.3)', offset: 1 },
  ],
  'pop-in': [
    { opacity: 0, transform: 'scale3d(0.8, 0.8, 1)', offset: 0 },
    { opacity: 1, transform: 'scale3d(1.05, 1.05, 1)', offset: 0.7 },
    { opacity: 1, transform: 'scale3d(1, 1, 1)', offset: 1 },
  ],
  'pop-out': [
    { opacity: 1, transform: 'scale3d(1, 1, 1)' },
    { opacity: 0, transform: 'scale3d(0.8, 0.8, 1)' },
  ],

  'slide-in-top': [
    { transform: 'translate3d(0, -100%, 0)' },
    { transform: 'translate3d(0, 0, 0)' },
  ],
  'slide-in-bottom': [
    { transform: 'translate3d(0, 100%, 0)' },
    { transform: 'translate3d(0, 0, 0)' },
  ],
  'slide-in-left': [
    { transform: 'translate3d(-100%, 0, 0)' },
    { transform: 'translate3d(0, 0, 0)' },
  ],
  'slide-in-right': [
    { transform: 'translate3d(100%, 0, 0)' },
    { transform: 'translate3d(0, 0, 0)' },
  ],

  'slide-out-top': [
    { transform: 'translate3d(0, 0, 0)' },
    { transform: 'translate3d(0, -100%, 0)' },
  ],
  'slide-out-bottom': [
    { transform: 'translate3d(0, 0, 0)' },
    { transform: 'translate3d(0, 100%, 0)' },
  ],
  'slide-out-left': [
    { transform: 'translate3d(0, 0, 0)' },
    { transform: 'translate3d(-100%, 0, 0)' },
  ],
  'slide-out-right': [
    { transform: 'translate3d(0, 0, 0)' },
    { transform: 'translate3d(100%, 0, 0)' },
  ],

  'flip-x': [
    { transform: 'perspective(400px) rotate3d(1, 0, 0, 90deg)', opacity: 0 },
    { transform: 'perspective(400px) rotate3d(1, 0, 0, 0deg)', opacity: 1 },
  ],
  'flip-y': [
    { transform: 'perspective(400px) rotate3d(0, 1, 0, 90deg)', opacity: 0 },
    { transform: 'perspective(400px) rotate3d(0, 1, 0, 0deg)', opacity: 1 },
  ],
  'perspective-pop': [
    { transform: 'perspective(600px) translateZ(-100px)', opacity: 0 },
    { transform: 'perspective(600px) translateZ(0)', opacity: 1 },
  ],

  // Fallbacks — dynamically replaced with scrollHeight/Width in _getKeyframes
  'expand-vertical': [
    { maxHeight: '0px', opacity: 0, overflow: 'hidden' },
    { maxHeight: '2000px', opacity: 1, overflow: 'hidden' },
  ],
  'collapse-vertical': [
    { maxHeight: '2000px', opacity: 1, overflow: 'hidden' },
    { maxHeight: '0px', opacity: 0, overflow: 'hidden' },
  ],
  'expand-horizontal': [
    { maxWidth: '0px', opacity: 0, overflow: 'hidden' },
    { maxWidth: '2000px', opacity: 1, overflow: 'hidden' },
  ],
  'collapse-horizontal': [
    { maxWidth: '2000px', opacity: 1, overflow: 'hidden' },
    { maxWidth: '0px', opacity: 0, overflow: 'hidden' },
  ],

  'pulse': [
    { transform: 'scale3d(1, 1, 1)' },
    { transform: 'scale3d(1.05, 1.05, 1.05)' },
    { transform: 'scale3d(1, 1, 1)' },
  ],
  'bounce': [
    { transform: 'translate3d(0, 0, 0)' },
    { transform: 'translate3d(0, -12px, 0)' },
    { transform: 'translate3d(0, 0, 0)' },
    { transform: 'translate3d(0, -6px, 0)' },
    { transform: 'translate3d(0, 0, 0)' },
  ],
  'shake': [
    { transform: 'translate3d(0, 0, 0)' },
    { transform: 'translate3d(-4px, 0, 0)' },
    { transform: 'translate3d(4px, 0, 0)' },
    { transform: 'translate3d(-4px, 0, 0)' },
    { transform: 'translate3d(0, 0, 0)' },
  ],
  'wobble': [
    { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
    { transform: 'translate3d(-15%, 0, 0) rotate(-4deg)' },
    { transform: 'translate3d(12%, 0, 0) rotate(3deg)' },
    { transform: 'translate3d(-9%, 0, 0) rotate(-2deg)' },
    { transform: 'translate3d(6%, 0, 0) rotate(1deg)' },
    { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
  ],
  'heartbeat': [
    { transform: 'scale(1)' },
    { transform: 'scale(1.15)' },
    { transform: 'scale(1)' },
    { transform: 'scale(1.15)' },
    { transform: 'scale(1)' },
  ],
  'shimmer': [
    { backgroundPosition: '-200% 0' },
    { backgroundPosition: '200% 0' },
  ],
};

const EXPAND_COLLAPSE_PRESETS = new Set([
  'expand-vertical',
  'collapse-vertical',
  'expand-horizontal',
  'collapse-horizontal',
]);

/** Shuffle indices using Fisher-Yates — no duplicate delay slots. */
function shuffleIndices(length: number): number[] {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * vi-animation
 * Declarative and imperative Web Animations API wrapper element.
 *
 * @element vi-animation
 * @attr name - Name of preset or custom animation
 * @attr enter - Preset name for enter animation phase
 * @attr exit - Preset name for exit animation phase
 * @attr duration - Animation duration in ms (default: 300)
 * @attr delay - Delay before animation starts in ms (default: 0)
 * @attr easing - Easing timing function (default: cubic-bezier(0.2, 0, 0, 1))
 * @attr iterations - Repeat count (default: 1)
 * @attr direction - Playback direction (default: normal)
 * @attr fill - Fill mode (default: forwards)
 * @attr open - Visibility toggle state (default: true)
 * @attr auto-play - Auto play on mount (default: true)
 * @attr cascade - Enable staggered animation across children
 * @attr stagger - Delay offset per child in ms when cascade is enabled (default: 50)
 * @attr stagger-selector - CSS selector for stagger children (default: :scope > *)
 * @attr stagger-direction - Stagger direction order: normal | reverse | center | random
 * @attr reduced-motion - Accessibility motion handling: auto | disable | fade-only
 *
 * @fires vi-animation-before-show - Cancelable. Call preventDefault() to block show().
 * @fires vi-animation-before-hide - Cancelable. Call preventDefault() to block hide().
 * @fires vi-animation-start - Fired when animation starts
 * @fires vi-animation-end - Fired when animation ends naturally
 * @fires vi-animation-cancel - Fired when consumer calls cancel()
 * @fires vi-animation-finish - Fired when consumer calls finish()
 */
@customElement('vi-animation')
export class ViAnimation extends ViElement {
  static override styles = css`${unsafeCSS(animationStyles)}`;

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
  /**
   * Monotonically incrementing sequence ID. Incremented on every new sequence
   * start (via _cancelSilently). Async continuations check their captured ID
   * against the current to detect stale callbacks.
   */
  private _sequenceId = 0;
  /**
   * Prevents updated() from re-calling show()/hide() when the imperative API
   * internally mutates this.open to keep it in sync with animation state.
   */
  private _updateGuard = false;
  /** Cached matchMedia object for prefers-reduced-motion. */
  private _reducedMotionMQ: MediaQueryList | null = null;
  private _reducedMotionListener: (() => void) | null = null;

  // ─── Public getters ───────────────────────────────────────────────────────

  /** Whether an animation sequence is currently running. */
  public get isAnimating(): boolean {
    return this._isAnimating;
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.open) {
      this.hidden = true;
    } else if (this.autoPlay) {
      this.updateComplete.then(() => this.play());
    }

    if (typeof window !== 'undefined') {
      this._reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
      this._reducedMotionListener = () => this.requestUpdate();
      this._reducedMotionMQ.addEventListener('change', this._reducedMotionListener);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    // Cancel in-flight animations to release resources on detached nodes
    this._cancelSilently();
    if (this._reducedMotionMQ && this._reducedMotionListener) {
      this._reducedMotionMQ.removeEventListener('change', this._reducedMotionListener);
      this._reducedMotionMQ = null;
      this._reducedMotionListener = null;
    }
  }

  override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    // _updateGuard prevents show()/hide() from being called again when the
    // imperative API internally sets this.open to keep property state in sync
    if (this._updateGuard) return;
    if (changedProperties.has('open') && changedProperties.get('open') !== undefined) {
      if (this.open) {
        this.show();
      } else {
        this.hide();
      }
    }
  }

  // ─── Imperative API ───────────────────────────────────────────────────────

  /** Returns a snapshot of the currently running Animation objects. */
  public getAnimations(): Animation[] {
    return [...this._activeAnimations];
  }

  /**
   * Animate element into view.
   * Fires cancelable `vi-animation-before-show` — call preventDefault() to block.
   */
  public async show(): Promise<void> {
    const allowed = this._dispatchCancelable('vi-animation-before-show', {
      name: this.enter || this.name,
      target: this,
      phase: 'enter',
    });
    if (!allowed) {
      // If show() was triggered by a declarative open=true change while still hidden,
      // revert to a consistent closed state.
      if (this.open && this.hidden) {
        this._withUpdateGuard(() => {
          this.open = false;
          this.hidden = true;
        });
      }
      return;
    }

    this._withUpdateGuard(() => {
      if (!this.open) this.open = true;
      this.hidden = false;
    });
    const animName = this.enter || this.name || 'fade-in';
    await this._runAnimationSequence(animName, 'enter', false);
  }

  /**
   * Animate element out of view.
   * Fires cancelable `vi-animation-before-hide` — call preventDefault() to block.
   */
  public async hide(): Promise<void> {
    const exitName = this.exit || EXIT_COUNTERPART[this.name] || 'fade-out';
    const allowed = this._dispatchCancelable('vi-animation-before-hide', {
      name: exitName,
      target: this,
      phase: 'exit',
    });
    if (!allowed) return;

    await this._runAnimationSequence(exitName, 'exit', true);
    this._withUpdateGuard(() => {
      if (this.open) this.open = false;
      this.hidden = true;
    });
  }

  /** Toggle between show() and hide(). */
  public async toggle(): Promise<void> {
    if (this.open) {
      await this.hide();
    } else {
      await this.show();
    }
  }

  /** Play the current `name` animation without changing visibility. */
  public async play(): Promise<void> {
    const phase: AnimationPhase = this.open ? 'enter' : 'custom';
    await this._runAnimationSequence(this.name, phase, false);
  }

  public pause(): void {
    this._activeAnimations.forEach((a) => a.pause());
  }

  public resume(): void {
    this._activeAnimations.forEach((a) => a.play());
  }

  public reverse(): void {
    this._activeAnimations.forEach((a) => a.reverse());
  }

  /**
   * Cancel all running animations and fire `vi-animation-cancel`.
   */
  public cancel(): void {
    this._cancelSilently();
    this._dispatch('vi-animation-cancel', { name: this.name, target: this, phase: 'custom' });
  }

  /**
   * Jump all running animations to their end state and fire `vi-animation-finish`.
   */
  public finish(): void {
    const anims = [...this._activeAnimations];
    // Clear state first so stale callbacks don't double-process
    this._cancelSilently();
    anims.forEach((a) => {
      try { a.finish(); } catch { /* already finished or cancelled */ }
    });
    this._dispatch('vi-animation-finish', { name: this.name, target: this, phase: 'custom' });
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Cancel all in-flight animations WITHOUT firing a public event.
   * Used for: self-interruption when a new sequence starts, and for lifecycle cleanup.
   */
  private _cancelSilently(): void {
    this._sequenceId++; // invalidate any pending async continuations
    this._activeAnimations.forEach((a) => {
      try { a.cancel(); } catch { /* already finished or cancelled */ }
    });
    this._activeAnimations = [];
    this._isAnimating = false;
  }

  /**
   * Runs a function that mutates reactive properties without triggering
   * the updated() -> show()/hide() feedback loop.
   */
  private _withUpdateGuard(fn: () => void): void {
    this._updateGuard = true;
    fn();
    this.updateComplete.then(() => {
      this._updateGuard = false;
    });
  }

  private _getTargetElements(): HTMLElement[] {
    const slot = this.shadowRoot?.querySelector('slot');
    if (!slot) return [this];

    const assignedNodes = slot.assignedElements({ flatten: true }) as HTMLElement[];
    if (assignedNodes.length === 0) return [this];

    if (!this.cascade) return assignedNodes;

    const targetElements: HTMLElement[] = [];
    for (const node of assignedNodes) {
      let matched = false;
      try {
        if (node.matches(this.staggerSelector)) {
          targetElements.push(node);
          matched = true;
        }
        const children = Array.from(node.querySelectorAll<HTMLElement>(this.staggerSelector));
        if (children.length > 0) {
          targetElements.push(...children);
          matched = true;
        }
      } catch (e) {
        console.warn(`[vi-animation] Invalid stagger-selector "${this.staggerSelector}":`, e);
        return assignedNodes; // graceful fallback to all assigned nodes
      }
      if (!matched) targetElements.push(node);
    }

    return targetElements.length > 0 ? targetElements : assignedNodes;
  }

  /**
   * Returns keyframes for a given animation name.
   * - Consumer keyframes are passed through as-is (Keyframe[] or PropertyIndexedKeyframes).
   * - Expand/collapse presets dynamically read scrollHeight/scrollWidth to avoid magic-number clipping.
   * - Falls back to PRESET_KEYFRAMES, then 'fade-in' if unknown.
   */
  private _getKeyframes(
    animName: string,
    phase: AnimationPhase,
    isReducedMotion: boolean,
    target?: HTMLElement,
  ): Keyframe[] | PropertyIndexedKeyframes {
    if (isReducedMotion) {
      return PRESET_KEYFRAMES[phase === 'exit' ? 'fade-out' : 'fade-in'];
    }
    // Pass consumer keyframes through directly — no wrapping
    if (this.keyframes) return this.keyframes;
    // Dynamic expand/collapse using actual element dimensions
    if (EXPAND_COLLAPSE_PRESETS.has(animName) && target) {
      const h = target.scrollHeight;
      const w = target.scrollWidth;
      switch (animName) {
        case 'expand-vertical':
          return [{ maxHeight: '0px', opacity: 0, overflow: 'hidden' }, { maxHeight: `${h}px`, opacity: 1, overflow: 'hidden' }];
        case 'collapse-vertical':
          return [{ maxHeight: `${h}px`, opacity: 1, overflow: 'hidden' }, { maxHeight: '0px', opacity: 0, overflow: 'hidden' }];
        case 'expand-horizontal':
          return [{ maxWidth: '0px', opacity: 0, overflow: 'hidden' }, { maxWidth: `${w}px`, opacity: 1, overflow: 'hidden' }];
        case 'collapse-horizontal':
          return [{ maxWidth: `${w}px`, opacity: 1, overflow: 'hidden' }, { maxWidth: '0px', opacity: 0, overflow: 'hidden' }];
      }
    }
    return PRESET_KEYFRAMES[animName] ?? PRESET_KEYFRAMES['fade-in'];
  }

  private _calculateStaggerDelay(index: number, total: number, shuffledOrder?: number[]): number {
    if (!this.cascade || total <= 1) return this.delay;

    let orderIndex = index;
    if (this.staggerDirection === 'reverse') {
      orderIndex = total - 1 - index;
    } else if (this.staggerDirection === 'center') {
      orderIndex = Math.abs((total - 1) / 2 - index);
    } else if (this.staggerDirection === 'random' && shuffledOrder) {
      orderIndex = shuffledOrder[index];
    }

    return this.delay + orderIndex * this.stagger;
  }

  private async _runAnimationSequence(
    animName: string,
    phase: AnimationPhase,
    isExitPhase: boolean,
  ): Promise<void> {
    const isReduced = this._shouldReduceMotion();
    const targets = this._getTargetElements();
    if (targets.length === 0) return;

    // Interrupt previous sequence silently (no vi-animation-cancel event)
    this._cancelSilently();
    const mySequenceId = this._sequenceId;

    this._isAnimating = true;
    const actualDuration = isReduced ? Math.min(this.duration, 100) : this.duration;

    this._dispatch('vi-animation-start', {
      name: animName,
      target: this,
      phase,
      duration: actualDuration,
      delay: this.delay,
    });

    // Pre-compute shuffled order so all elements get unique, non-repeating delay slots
    const shuffledOrder = this.staggerDirection === 'random' ? shuffleIndices(targets.length) : undefined;

    const animationPromises = targets.map((el, index) => {
      const elementDelay = isReduced ? 0 : this._calculateStaggerDelay(index, targets.length, shuffledOrder);
      const kf = this._getKeyframes(animName, isReduced, el);

      const anim = el.animate(kf as Parameters<typeof el.animate>[0], {
        duration: actualDuration,
        delay: elementDelay,
        easing: this.easing,
        iterations: this.iterations,
        direction: this.direction,
        fill: this.fill,
      });

      this._activeAnimations.push(anim);

      return anim.finished.then(
        () => {
          // For exit animations: commit the end-frame styles to element.style and
          // cancel the WAAPI fill so external CSS can take over later (avoids
          // invisible elements if the element is re-shown via show() or style).
          if (isExitPhase) {
            try { anim.commitStyles(); } catch { /* element not rendered or already cancelled */ }
            try { anim.cancel(); } catch { /* already finished */ }
          }
        },
        () => null, // Animation was cancelled — treat as resolved so Promise.all doesn't reject
      );
    });

    await Promise.all(animationPromises);

    // Discard stale result if a newer sequence has already started
    if (this._sequenceId !== mySequenceId) return;

    this._isAnimating = false;
    this._activeAnimations = [];

    this._dispatch('vi-animation-end', {
      name: animName,
      target: this,
      phase,
      completed: true,
    });
  }

  private _shouldReduceMotion(): boolean {
    if (this.reducedMotion === 'disable') return false;
    if (this.reducedMotion === 'fade-only') return true;
    return this._reducedMotionMQ?.matches ??
      (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  private _dispatch(eventName: string, detail: ViAnimationEventDetail): void {
    this.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true, composed: true }));
  }

  /**
   * Dispatch a cancelable event. Returns true if the animation should proceed
   * (i.e. preventDefault() was NOT called), false if it should be blocked.
   */
  private _dispatchCancelable(
    eventName: string,
    detail: Omit<ViAnimationEventDetail, 'completed'>,
  ): boolean {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(event);
    return !event.defaultPrevented;
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-animation': ViAnimation;
  }
}
