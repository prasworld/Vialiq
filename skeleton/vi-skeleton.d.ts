import { TemplateResult } from 'lit';
import { ViElement } from '../base/vi-element.js';
export type ViSkeletonVariant = 'text' | 'circle' | 'rect';
export type ViSkeletonAnimation = 'shimmer' | 'pulse' | 'none';
/**
 * vi-skeleton
 * An atomic placeholder component used before content is loaded.
 *
 * @element vi-skeleton
 * @attr variant - The shape of the skeleton ('text' | 'circle' | 'rect')
 * @attr animation - The animation style ('shimmer' | 'pulse' | 'none')
 *
 * @csspart skeleton - The main skeleton block
 *
 * @cssprop --vi-skeleton-width - Width of the skeleton
 * @cssprop --vi-skeleton-height - Height of the skeleton
 * @cssprop --vi-skeleton-radius - Border radius of the skeleton
 */
export declare class ViSkeleton extends ViElement {
    static styles: import('lit').CSSResult;
    /** The shape of the skeleton */
    accessor variant: ViSkeletonVariant;
    /** The animation style */
    accessor animation: ViSkeletonAnimation;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vi-skeleton': ViSkeleton;
    }
}
//# sourceMappingURL=vi-skeleton.d.ts.map