import { Component, ElementRef, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, inject, input } from '@angular/core';

import { ComponentSchema } from '../types';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { BuilderStateService } from '../services/builder-state.service';
import { FormSchemaService } from '../services/form-schema.service';

@Component({
  selector: 'vi-canvas-node-overlay',
  standalone: true,
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './canvas-node-overlay.component.html',
  styleUrl: './canvas-node-overlay.component.scss',})
export class CanvasNodeOverlayComponent implements OnInit, OnDestroy {
  private state = inject(BuilderStateService);
  private schemaService = inject(FormSchemaService);
  private el = inject(ElementRef);

  readonly node = input.required<ComponentSchema>();

  private _cleanup: (() => void) | null = null;
  isDragging = false;

  get isActive() {
    return this.state.activeNodeId() === this.node().id;
  }

  ngOnInit() {
    this._cleanup = draggable({
      element: this.el.nativeElement,
      getInitialData: () => ({
        source: 'canvas',
        nodeId: this.node().id,
        builderId: this.state.builderId,
      }),
      onDragStart: () => {
        this.isDragging = true;
      },
      onDrop: () => {
        this.isDragging = false;
      },
      onGenerateDragPreview: ({ nativeSetDragImage }) => {
        setCustomNativeDragPreview({
          nativeSetDragImage,
          render: ({ container }) => {
            const div = document.createElement('div');
            div.setAttribute('style', 'padding: 8px 12px; background: white; border: 1px solid #cbd5e1; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: sans-serif; font-size: 14px; font-weight: 500;');
            div.textContent = this.node().label ?? '';
            container.replaceChildren(div);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    if (this._cleanup) {
      this._cleanup();
    }
  }

  selectNode(event: Event) {
    event.stopPropagation();
    this.state.setActiveNode(this.node().id);
  }

  handleKeydown(event: KeyboardEvent) {
    // Only intercept if the user is focused directly on the container, not on an inner button
    const target = event.target as HTMLElement;
    if (target.classList.contains('overlay-container')) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.selectNode(event);
      }
    }
  }

  duplicateNode() {
    this.schemaService.duplicateComponent(this.node().id);
  }

  deleteNode() {
    this.schemaService.removeComponent(this.node().id);
    if (this.isActive) {
      this.state.setActiveNode(null);
    }
  }
}
