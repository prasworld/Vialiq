import { LitElement } from 'lit';
type Constructor<T = object> = new (...args: any[]) => T;
export type DragContainment = 'none' | 'viewport' | 'parent';
export declare class DraggableInterface {
    draggable: boolean;
    dragContainment: DragContainment;
    protected get _dragTarget(): HTMLElement | null;
    protected get _dragHandle(): HTMLElement | null;
    protected _resetDrag(): void;
    protected _stopDrag(): void;
}
/**
 * DraggableMixin
 *
 * Provides native drag-and-drop capabilities using Pointer Events to any LitElement.
 * It applies performant `transform: translate3d(x, y, 0)` positioning to `_dragTarget`.
 *
 * Subclasses MUST implement:
 * - `_dragTarget`: The HTML element that moves (usually the outer container or dialog).
 * - `_dragHandle`: The HTML element that accepts pointer events to initiate the drag (usually a header).
 */
export declare function DraggableMixin<T extends Constructor<LitElement>>(Base: T): T & Constructor<DraggableInterface>;
export {};
//# sourceMappingURL=draggable-mixin.d.ts.map