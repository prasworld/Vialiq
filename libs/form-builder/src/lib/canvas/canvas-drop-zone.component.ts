import { Component, ElementRef, OnDestroy, OnInit, effect, inject, input, signal, viewChild } from '@angular/core';

import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { BuilderStateService } from '../services/builder-state.service';
import { FormSchemaService } from '../services/form-schema.service';
import { BuilderRegistryService } from '../registry/builder-registry.service';

@Component({
  selector: 'vi-canvas-drop-zone',
  standalone: true,
  imports: [],
  templateUrl: './canvas-drop-zone.component.html',
  styleUrl: './canvas-drop-zone.component.scss',
})
export class CanvasDropZoneComponent implements OnInit, OnDestroy {
  private readonly state = inject(BuilderStateService);
  private readonly schemaService = inject(FormSchemaService);
  private readonly registry = inject(BuilderRegistryService);
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  readonly parentId = input<string | null>(null);
  readonly index = input.required<number>();
  readonly columnIndex = input<number>();
  readonly tabId = input<string>();
  readonly viewId = input<string>();
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  readonly expandToFill = input(false);

  readonly dropZone = viewChild.required<ElementRef<HTMLElement>>('dropZone');

  isDragOver = signal(false);
  private _cleanup: (() => void) | null = null;

  constructor() {
    // Write drag state directly to the host DOM node via an effect.
    // This bypasses Angular's template rendering pipeline entirely —
    // no change detection pass is triggered on any sibling/child components.
    effect(() => {
      if (this.state.isDragging()) {
        this.hostEl.nativeElement.setAttribute('data-dragging', '');
      } else {
        this.hostEl.nativeElement.removeAttribute('data-dragging');
      }
    });
  }

  ngOnInit() {
    this._cleanup = dropTargetForElements({
      element: this.dropZone().nativeElement,
      getData: () => ({
        parentId: this.parentId(),
        index: this.index(),
        columnIndex: this.columnIndex(),
        tabId: this.tabId(),
        viewId: this.viewId(),
        builderId: this.state.builderId,
      }),
      canDrop: ({ source }) => {
        const sourceData = source.data as Record<string, unknown>;
        if (sourceData['builderId'] !== this.state.builderId) return false;

        let sourceType = sourceData['descriptorType'] as string;
        if (sourceData['source'] === 'canvas') {
          const node = this.schemaService.getNode(sourceData['nodeId'] as string);
          if (!node) return false;
          sourceType = node.type;
        }

        if (!sourceType) return false;

        const pId = this.parentId();
        if (pId) {
          const parentNode = this.schemaService.getNode(pId);
          if (parentNode) {
            const parentDescriptor = this.registry.getByType(parentNode.type);
            if (parentDescriptor?.disallowedChildren?.includes(sourceType)) return false;
            if (parentDescriptor?.allowedChildren && !parentDescriptor.allowedChildren.includes(sourceType)) return false;
          }
        }
        return true;
      },
      onDragEnter: () => {
        this.isDragOver.set(true);
      },
      onDragLeave: () => {
        this.isDragOver.set(false);
      },
      onDrop: () => {
        this.isDragOver.set(false);
      },
    });
  }

  ngOnDestroy() {
    this._cleanup?.();
  }
}
