export type AnimationPreset = 'fade-in' | 'fade-out' | 'fade-in-up' | 'fade-in-down' | 'fade-in-left' | 'fade-in-right' | 'fade-out-up' | 'fade-out-down' | 'fade-out-left' | 'fade-out-right' | 'zoom-in' | 'zoom-out' | 'scale-up' | 'scale-down' | 'bounce-in' | 'bounce-out' | 'pop-in' | 'pop-out' | 'slide-in-top' | 'slide-in-bottom' | 'slide-in-left' | 'slide-in-right' | 'slide-out-top' | 'slide-out-bottom' | 'slide-out-left' | 'slide-out-right' | 'flip-x' | 'flip-y' | 'perspective-pop' | 'expand-vertical' | 'collapse-vertical' | 'expand-horizontal' | 'collapse-horizontal' | 'pulse' | 'bounce' | 'shake' | 'wobble' | 'heartbeat' | 'shimmer';
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
export declare const EXIT_COUNTERPART: Partial<Record<string, string>>;
/**
 * WAAPI (Web Animations API) keyframe definitions — used by this component's imperative
 * runtime path via `element.animate()`. These are the canonical source for adding or
 * changing a preset. When you add a preset here you MUST also add the matching
 * `@keyframes vi-<name>` rule in `libs/flux-ui/components/_animation.scss`, which serves
 * the parallel CSS-only consumer path (\`animation: vi-fade-in 300ms ...\`).
 * The two representations cannot share a runtime source without a build-time code-gen step.
 */
export declare const PRESET_KEYFRAMES: Record<string, Keyframe[]>;
export declare const EXPAND_COLLAPSE_PRESETS: Set<string>;
//# sourceMappingURL=animation-constants.d.ts.map