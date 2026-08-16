import { PropertyValues } from 'lit';
import { ViElement } from '../base/vi-element.js';
import { AnimationPreset, StaggerDirection } from './animation-constants.js';
export * from './animation-constants.js';
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
 * @attr reduced-motion - Accessibility motion handling:
 * - `auto` (default): if the OS/browser has `prefers-reduced-motion: reduce`, shorten duration
 *   to ≤100 ms AND substitute the animation with a simple opacity fade.
 * - `fade-only`: if the OS/browser has `prefers-reduced-motion: reduce`, substitute the animation
 *   with an opacity fade but preserve the original duration (useful when the fade itself
 *   conveys intentional UI feedback and should not be truncated).
 * - `disable`: always play the full animation regardless of the OS/browser setting.
 *
 * @fires vi-animation-before-show - Cancelable. Call preventDefault() to block show().
 * @fires vi-animation-before-hide - Cancelable. Call preventDefault() to block hide().
 * @fires vi-animation-start - Fired when animation starts
 * @fires vi-animation-end - Fired when animation ends naturally
 * @fires vi-animation-cancel - Fired when consumer calls cancel()
 * @fires vi-animation-finish - Fired when consumer calls finish()
 */
export declare class ViAnimation extends ViElement {
    protected createRenderRoot(): this;
    accessor name: AnimationPreset | string;
    accessor enter: AnimationPreset | string;
    accessor exit: AnimationPreset | string;
    accessor duration: number;
    accessor delay: number;
    accessor easing: string;
    accessor iterations: number;
    accessor direction: PlaybackDirection;
    accessor fill: FillMode;
    accessor open: boolean;
    accessor autoPlay: boolean;
    accessor cascade: boolean;
    accessor stagger: number;
    accessor staggerSelector: string;
    accessor staggerDirection: StaggerDirection;
    accessor reducedMotion: 'auto' | 'disable' | 'fade-only';
    accessor keyframes: Keyframe[] | PropertyIndexedKeyframes | null;
    private accessor _isAnimating;
    private _activeAnimations;
    /**
     * Monotonically incrementing sequence ID. Incremented on every new sequence
     * start (via _cancelSilently). Async continuations check their captured ID
     * against the current to detect stale callbacks.
     */
    private _sequenceId;
    /**
     * Prevents updated() from re-calling show()/hide() when the imperative API
     * internally mutates this.open to keep it in sync with animation state.
     */
    private _updateGuard;
    /** Cached matchMedia object for prefers-reduced-motion. */
    private _reducedMotionMQ;
    private _reducedMotionListener;
    /** Whether an animation sequence is currently running. */
    get isAnimating(): boolean;
    connectedCallback(): void;
    disconnectedCallback(): void;
    updated(changedProperties: PropertyValues): void;
    /** Returns a snapshot of the currently running Animation objects. */
    getAnimations(): Animation[];
    /**
     * Animate element into view.
     * Fires cancelable `vi-animation-before-show` — call preventDefault() to block.
     */
    show(): Promise<void>;
    /**
     * Animate element out of view.
     * Fires cancelable `vi-animation-before-hide` — call preventDefault() to block.
     */
    hide(): Promise<void>;
    /** Toggle between show() and hide(). */
    toggle(): Promise<void>;
    /** Play the current `name` animation without changing visibility. */
    play(): Promise<void>;
    pause(): void;
    resume(): void;
    reverse(): void;
    /**
     * Cancel all running animations and fire `vi-animation-cancel`.
     */
    cancel(): void;
    /**
     * Jump all running animations to their end state and fire `vi-animation-finish`.
     */
    finish(): void;
    /**
     * Cancel all in-flight animations WITHOUT firing a public event.
     * Used for: self-interruption when a new sequence starts, and for lifecycle cleanup.
     */
    private _cancelSilently;
    /**
     * Runs a function that mutates reactive properties without triggering
     * the updated() -> show()/hide() feedback loop.
     */
    private _withUpdateGuard;
    private _getTargetElements;
    /**
     * Returns keyframes for a given animation name.
     * - Consumer keyframes are passed through as-is (Keyframe[] or PropertyIndexedKeyframes).
     * - Expand/collapse presets dynamically read scrollHeight/scrollWidth to avoid magic-number clipping.
     * - Falls back to PRESET_KEYFRAMES, then 'fade-in' if unknown.
     */
    private _getKeyframes;
    private _calculateStaggerDelay;
    private _runAnimationSequence;
    /**
     * Returns whether any reduced-motion adaptation should be applied.
     *
     * Both 'auto' and 'fade-only' gate on the OS/browser preference so that the attribute
     * does not override what the user has configured at the system level. The distinction
     * between them is captured in _runAnimationSequence:
     *   - 'auto':      shorten duration (≤100 ms) + substitute with opacity fade.
     *   - 'fade-only': substitute with opacity fade, but keep the original duration.
     *   - 'disable':   ignore OS preference entirely — always play the full animation.
     */
    private _shouldReduceMotion;
    private _dispatch;
    /**
     * Dispatch a cancelable event. Returns true if the animation should proceed
     * (i.e. preventDefault() was NOT called), false if it should be blocked.
     */
    private _dispatchCancelable;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-animation': ViAnimation;
    }
}
//# sourceMappingURL=vi-animation.d.ts.map