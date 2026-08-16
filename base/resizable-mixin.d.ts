import { LitElement, TemplateResult } from 'lit';
type Constructor<T = object> = new (...args: any[]) => T;
export declare class ResizableInterface {
    resizable: boolean;
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
    protected get _resizeTarget(): HTMLElement | null;
    protected _renderResizeHandles(): TemplateResult;
    protected _resetResize(): void;
}
/**
 * ResizableMixin
 *
 * Provides native 8-direction resize capabilities using Pointer Events.
 * Applies `width` and `height` inline styles to `_resizeTarget`.
 *
 * **Important**: All private fields use the `_rsz_` prefix to prevent
 * name collisions when composed with other mixins (e.g., DraggableMixin).
 *
 * Subclasses MUST implement:
 * - `_resizeTarget`: The HTML element that resizes (usually the dialog box).
 * - Render `${this._renderResizeHandles()}` inside the component's template.
 */
export declare function ResizableMixin<T extends Constructor<LitElement>>(Base: T): T & Constructor<ResizableInterface>;
export {};
//# sourceMappingURL=resizable-mixin.d.ts.map