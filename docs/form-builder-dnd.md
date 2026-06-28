# Form Builder — Drag & Drop Architecture

> **Status:** Brainstorm / Planning  
> **Date:** 2026-05-21  
> Related docs: [overview](./form-builder-overview.md) · [architecture](./form-builder-architecture.md)

---

## 1. Library Decision: `@atlaskit/pragmatic-drag-and-drop`

### 1.1 Requirements Matrix

| Requirement | Detail |
|---|---|
| Palette → Canvas cross-container drop (copy) | Dragging from left panel, item stays in palette |
| Canvas → Canvas same-container reorder | Flat and nested |
| Recursive nested container drop | Panels inside panels, components inside columns, etc. |
| Drop indicators (line between items) | Visual "where will it land" cue |
| Between-node drop zones | Precise targeting: before, after, or inside a container |
| Framework agnostic | Builder is Angular but core DnD engine should not require Angular |
| Bundle size | Minimal extra weight |
| Active maintenance | Reliability for a long-lived product |
| Accessibility (keyboard DnD) | Required for WCAG compliance |

### 1.2 Comparison Table

| | **Angular CDK DragDrop** | **@atlaskit/pragmatic-drag-and-drop** | **SortableJS** | **@dnd-kit/core** |
|---|---|---|---|---|
| Bundle size | ~0 (CDK already needed) | ~4.7 KB core + tree packages | ~30 KB | ~10 KB core |
| Framework | Angular-only | Framework agnostic ✅ | Framework agnostic | React-first |
| Nested containers | `cdkDropListGroup` — partial, known bugs with deep nesting | First-class ✅ (built for Jira's board) | `Sortable.group` — good | Good |
| Drop indicators | Manual | `@atlaskit/pragmatic-drag-and-drop-hitbox` ✅ | Manual | `@dnd-kit/sortable` provides |
| Keyboard DnD | Via CDK a11y | `@atlaskit/pragmatic-drag-and-drop-react-accessibility` (headless, adaptable) | Limited | Good |
| Copy semantics (palette) | Workaround needed | Native `copy` mode ✅ | Via `clone` | Via `DragOverlay` |
| Community | Angular team | Atlassian (powers Jira/Confluence/Trello) ✅ | Very large (150k ★) | Large (React ecosystem) |
| Zero-dep runtime | Yes | Yes (browser native DnD events) ✅ | Yes | Yes |
| Tree-shakeable | Partial | Fully modular ✅ | No | Yes |
| Pointer Events API | No | Yes — fast, no synthetic events ✅ | Partial | Partial |
| Virtualization support | No | Yes ✅ | No | Partial |

### 1.3 Decision: `@atlaskit/pragmatic-drag-and-drop`

**Chosen.** Rationale:

1. **Recursive nesting is a day-1 requirement.** CDK DragDrop has a well-documented limitation with `cdkDropListGroup` in deeply nested trees — workarounds are fragile. pragmatic-drag-and-drop was designed from the ground up for exactly this (it powers Jira's complex board with nested subtasks).
2. **Framework-agnostic core.** The DnD logic does not import Angular, which keeps the door open for the future `@vi/form-builder-core` extraction.
3. **Smallest effective footprint** for its capability tier: ~4.7 KB core + ~2 KB tree hitbox + ~1 KB sort order = ~8 KB total, all tree-shakeable.
4. **Angular CDK is still used** for Overlay, Portal, and FocusTrap — just not for DnD itself.
5. **Active Atlassian backing** means the library will be maintained; it powers Jira (>10M users).

### 1.4 Packages Needed

```bash
npm install @atlaskit/pragmatic-drag-and-drop
npm install @atlaskit/pragmatic-drag-and-drop-hitbox
# For sorted list reordering algorithm:
npm install @atlaskit/pragmatic-drag-and-drop-live-region
# For keyboard-accessible DnD (WCAG 2.5.3):
npm install @atlaskit/pragmatic-drag-and-drop-react-accessibility  # NOT used — we write our own Angular adapter
```

---

## 2. DnD Mental Model

The builder has **two distinct drag scenarios** with different semantics:

```
SCENARIO A: Palette → Canvas (COPY)
─────────────────────────────────────
Draggable: PaletteItemComponent
Data payload: { source: 'palette', descriptorType: 'text-input' }
Drop target: CanvasDropZoneComponent
Effect: addComponent(descriptor, parentId, index)
Palette item: STAYS in palette (copy, not move)

SCENARIO B: Canvas ↔ Canvas (MOVE)
─────────────────────────────────────
Draggable: CanvasNodeComponent (via drag handle)
Data payload: { source: 'canvas', nodeId: 'uuid', parentId: 'uuid | null', index: number }
Drop target: CanvasDropZoneComponent (between nodes or inside containers)
Effect: moveComponent(nodeId, targetParentId, targetIndex)
Node: REMOVED from original position, INSERTED at target
```

---

## 3. Drop Zone Model

Every position where a component can land is represented by a `CanvasDropZoneComponent`. They are:

### 3.1 Between-Node Drop Zones

```
┌──────────────────┐
│ CanvasDropZone   │  ← top of canvas (index 0)
├──────────────────┤
│ CanvasNode       │  vi-input
├──────────────────┤
│ CanvasDropZone   │  ← between node 0 and node 1 (index 1)
├──────────────────┤
│ CanvasNode       │  vi-button
├──────────────────┤
│ CanvasDropZone   │  ← end of canvas (index 2)
└──────────────────┘
```

Each `CanvasDropZone` knows its:
- `parentId: string | null` — which container it lives in (null = root)
- `index: number` — what insert position it represents

### 3.2 Container Drop Zones (Layout Nodes)

A `CanvasContainerComponent` (panel, columns, tabs) renders its own set of drop zones inside:

```
┌─────────────────────────────────────────┐
│ PanelCanvasNode                          │
│   ┌────────────────────────────────┐    │
│   │ CanvasDropZone (inside panel)  │    │
│   │ CanvasNode (child 1)           │    │
│   │ CanvasDropZone (inside panel)  │    │
│   │ CanvasNode (child 2)           │    │
│   │ CanvasDropZone (inside panel)  │    │
│   └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### 3.3 Columns Layout Drop Zones

Each column in a `ColumnsLayoutComponent` is its own independent drop zone list:

```
┌──────────────────┬──────────────────┐
│ Column 0         │ Column 1         │
│                  │                  │
│ CanvasDropZone   │ CanvasDropZone   │
│ CanvasNode       │ CanvasNode       │
│ CanvasDropZone   │ CanvasDropZone   │
└──────────────────┴──────────────────┘
```

### 3.4 Tabs Layout Drop Zones

Only the **active tab's** drop zone list is visible at any time. Switching tabs changes which drop zone list is active.

---

## 4. `DndService` — The Coordinator

```typescript
// libs/form-builder/src/lib/services/dnd.service.ts

import { draggable, dropTargetForElements, monitorForElements }
  from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge, extractClosestEdge }
  from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

@Injectable({ providedIn: 'root' })
export class DndService {
  private readonly _schemaService = inject(FormSchemaService);
  private readonly _stateService  = inject(BuilderStateService);

  /**
   * Register a palette item element as draggable.
   * Called from PaletteItemComponent.ngAfterViewInit().
   */
  registerPaletteItem(
    el: HTMLElement,
    descriptorType: string
  ): () => void { // returns cleanup fn
    return draggable({
      element: el,
      getInitialData: () => ({
        source: 'palette' as const,
        descriptorType,
      }),
      onDragStart: () => this._stateService.setDragging(true),
      onDrop: () => this._stateService.setDragging(false),
    });
  }

  /**
   * Register a canvas node element as draggable (via its drag handle).
   * Called from CanvasNodeOverlayComponent.
   */
  registerCanvasNode(
    dragHandle: HTMLElement,
    element: HTMLElement,
    nodeId: string,
    parentId: string | null,
    index: number
  ): () => void {
    return draggable({
      element,
      dragHandle,
      getInitialData: () => ({
        source: 'canvas' as const,
        nodeId,
        parentId,
        index,
      }),
      onDragStart: () => {
        this._stateService.setDragging(true);
        this._stateService.setDraggingNodeId(nodeId);
      },
      onDrop: () => {
        this._stateService.setDragging(false);
        this._stateService.setDraggingNodeId(null);
      },
    });
  }

  /**
   * Register a drop zone element.
   * Called from CanvasDropZoneComponent.ngAfterViewInit().
   */
  registerDropZone(
    el: HTMLElement,
    parentId: string | null,
    index: number
  ): () => void {
    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => {
        const data = source.data as DragData;
        // Prevent dropping a container into itself or its own descendants
        if (data.source === 'canvas') {
          return !this._isDescendant(data.nodeId, parentId);
        }
        return true;
      },
      onDrop: ({ source }) => {
        const data = source.data as DragData;
        if (data.source === 'palette') {
          this._schemaService.addComponent(parentId, index, data.descriptorType);
        } else if (data.source === 'canvas') {
          this._schemaService.moveComponent(data.nodeId, parentId, index);
        }
      },
      getData: ({ input, element }) =>
        attachClosestEdge({ parentId, index }, { input, element, allowedEdges: ['top', 'bottom'] }),
    });
  }

  private _isDescendant(nodeId: string, targetParentId: string | null): boolean {
    if (!targetParentId) return false;
    // Walk schema tree to check if targetParentId is inside nodeId's subtree
    return this._schemaService.isDescendant(nodeId, targetParentId);
  }
}

type DragData =
  | { source: 'palette'; descriptorType: string }
  | { source: 'canvas'; nodeId: string; parentId: string | null; index: number };
```

---

## 5. Component Integration Patterns

### 5.1 `PaletteItemComponent`

```typescript
@Component({
  selector: 'vi-palette-item',
  standalone: true,
  template: `
    <div #itemEl class="palette-item" [class.is-dragging]="isDragging()">
      <vi-icon [name]="descriptor.icon" />
      <span>{{ descriptor.label }}</span>
    </div>
  `
})
export class PaletteItemComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) descriptor!: ComponentDescriptor;
  @ViewChild('itemEl') itemEl!: ElementRef<HTMLElement>;

  protected isDragging = signal(false);
  private _cleanup?: () => void;
  private readonly _dnd = inject(DndService);

  ngAfterViewInit() {
    this._cleanup = this._dnd.registerPaletteItem(
      this.itemEl.nativeElement,
      this.descriptor.type
    );
  }

  ngOnDestroy() { this._cleanup?.(); }
}
```

### 5.2 `CanvasDropZoneComponent`

```typescript
@Component({
  selector: 'vi-canvas-drop-zone',
  standalone: true,
  template: `<div #zoneEl class="drop-zone" [class.is-active]="isActive()"></div>`
})
export class CanvasDropZoneComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) parentId!: string | null;
  @Input({ required: true }) index!: number;
  @ViewChild('zoneEl') zoneEl!: ElementRef<HTMLElement>;

  protected isActive = signal(false);
  private _cleanup?: () => void;
  private readonly _dnd = inject(DndService);
  private readonly _state = inject(BuilderStateService);

  // Only show drop zones while dragging
  protected isDragging = this._state.isDragging;

  ngAfterViewInit() {
    this._cleanup = this._dnd.registerDropZone(
      this.zoneEl.nativeElement,
      this.parentId,
      this.index
    );
  }

  ngOnDestroy() { this._cleanup?.(); }
}
```

### 5.3 `CanvasNodeComponent` (Recursive)

```typescript
@Component({
  selector: 'vi-canvas-node',
  standalone: true,
  imports: [
    CanvasDropZoneComponent,
    CanvasNodeOverlayComponent,
    CanvasContainerComponent,
    NgComponentOutlet,
  ],
  template: `
    <div
      #nodeEl
      class="canvas-node"
      [class.is-selected]="isSelected()"
      [class.is-dragging-over]="isDraggingOver()"
      (click)="onSelect()"
    >
      <!-- Actual vi-* web component rendered here -->
      <div class="canvas-node__content" [innerHTML]="renderedElement()"></div>

      <!-- OR using Angular CDK portal / direct DOM insertion for the web component -->

      <!-- Overlay: drag handle, delete, edit buttons -->
      <vi-canvas-node-overlay
        [nodeId]="node.id"
        [parentId]="parentId"
        [index]="index"
      />

      <!-- Recursive: if this is a layout node, render children -->
      @if (isLayoutNode()) {
        <vi-canvas-container [node]="layoutNode()" />
      }
    </div>

    <!-- Drop zone AFTER this node -->
    <vi-canvas-drop-zone [parentId]="parentId" [index]="index + 1" />
  `
})
export class CanvasNodeComponent {
  @Input({ required: true }) node!: ComponentSchema;
  @Input({ required: true }) parentId!: string | null;
  @Input({ required: true }) index!: number;

  private readonly _state = inject(BuilderStateService);
  private readonly _registry = inject(BuilderRegistryService);

  protected isSelected = computed(() => this._state.activeNodeId() === this.node.id);
  protected isLayoutNode = computed(() =>
    (this.node as LayoutComponentSchema).components !== undefined
  );
  protected layoutNode = computed(() => this.node as LayoutComponentSchema);

  protected onSelect() {
    this._state.setActiveNode(this.node.id);
  }
}
```

---

## 6. Drag Lifecycle

```
User mousedown on PaletteItem or CanvasNode drag handle
         │
         ▼
pragmatic-drag-and-drop fires dragStart
         │
         ├─ DndService.onDragStart() → BuilderStateService.setDragging(true)
         │
         ├─ All CanvasDropZone elements become visible (CSS: opacity 1)
         │
         ├─ Dragged canvas node gets class .is-being-dragged
         │   (pointer-events: none on its children so drop zones get events)
         │
         ▼
User moves over CanvasDropZone
         │
         ▼
pragmatic-drag-and-drop fires dragEnter on drop target
         │
         ├─ CanvasDropZone.isActive = true → shows highlighted drop indicator line
         │
         ├─ Other drop zones: isActive = false
         │
         ▼
User releases (drop)
         │
         ▼
pragmatic-drag-and-drop fires drop on active target
         │
         ├─ DndService.onDrop() fires:
         │   ├─ if source === 'palette': FormSchemaService.addComponent(...)
         │   └─ if source === 'canvas':  FormSchemaService.moveComponent(...)
         │
         ├─ FormSchemaService mutation → HistoryService records snapshot
         │
         ├─ schema Signal updates → Angular re-renders CanvasComponent
         │
         ├─ BuilderStateService.setActiveNode(newNodeId) → selects new node
         │
         └─ BuilderStateService.setDragging(false) → drop zones hide
```

---

## 7. Nested Container Drop — Special Cases

### 7.1 Prevent Dropping a Container Into Itself

When a user starts dragging a layout node (e.g. a Panel), all drop zones **inside that panel's subtree** must be disabled. `DndService.canDrop()` calls `FormSchemaService.isDescendant(nodeId, targetParentId)` to enforce this.

### 7.2 Columns: Per-Column Drop Zones

Each column in a Columns layout registers its own independent set of drop zones. The `columnIndex` property on each drop zone is used when calling `addComponent`/`moveComponent` — the schema stores `properties.columnIndex` on each child to remember which column it belongs to.

### 7.3 Tabs: Tab-Switching During Drag

When dragging over a tab label (not a drop zone), a 500ms hover timer fires `setActiveTab(tabId)` to switch to that tab, revealing its drop zones. This is the standard "drop over tab to switch" UX pattern.

---

## 8. Accessibility (Keyboard DnD)

Pragmatic-drag-and-drop's pointer events API does not inherently support keyboard DnD. We implement a separate keyboard navigation mode following the [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/):

### 8.1 Canvas Node Keyboard Controls

When a canvas node's drag handle is focused:
- `Space` / `Enter` → **pick up** the node (enter keyboard DnD mode)
- `↑` / `↓` → move node up/down within its container
- `→` — when adjacent to a container: **move into** the container
- `←` — move out of the current container to the parent level
- `Space` / `Enter` → **drop** at current position
- `Escape` → **cancel** (schema is not mutated)

This is implemented as a separate `KeyboardDndService` that calls the same `FormSchemaService.moveComponent()` API as the mouse DnD. No pragmatic-drag-and-drop is involved here — it's pure Angular keyboard event handling.

### 8.2 ARIA Live Region

A visually hidden `aria-live="assertive"` region announces state changes:
- "Picked up Text Field. Current position: 2 of 5."
- "Moved Text Field to position 1 of 5."
- "Dropped Text Field at position 1."
- "Cancelled. Text Field returned to position 2."

---

## 9. Ghost / Drag Preview

During a palette drag, a custom drag preview (ghost) is shown:
- Shows the component's icon and label
- Styled with a shadow and slight rotation for tactile feedback
- Uses pragmatic-drag-and-drop's `setCustomNativeDragPreview` with a portal-mounted Angular component

During a canvas node drag:
- The original node becomes translucent (opacity 0.4)
- A ghost is shown at the cursor position
- Drop zones highlight as the ghost moves near them

---

## 10. CSS Architecture for DnD States

All DnD state is controlled via host CSS classes on the `FormBuilderComponent`. Angular CDK is used for nothing here — just class bindings:

```scss
// Global drag state (set on <vi-form-builder> host)
:host(.is-dragging) {
  // Show all drop zones
  vi-canvas-drop-zone { opacity: 1; pointer-events: all; }

  // Disable interaction on all canvas nodes
  vi-canvas-node .canvas-node__content { pointer-events: none; }
}

// Per-drop-zone active state
.drop-zone.is-active {
  // Animated drop indicator line
  &::after {
    content: '';
    display: block;
    height: 2px;
    background: var(--color-primary);
    border-radius: 1px;
    animation: drop-pulse 0.6s ease infinite;
  }
}

// Node being dragged
.canvas-node.is-being-dragged {
  opacity: 0.4;
  outline: 2px dashed var(--color-primary);
}

// Node selected
.canvas-node.is-selected {
  outline: 2px solid var(--color-primary);
}
```
