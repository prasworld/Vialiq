import { Component, Input, ElementRef, ViewChild, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';

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

  @Input({ required: true }) node!: ComponentSchema;

  private _cleanup: (() => void) | null = null;
  isDragging = false;

  get isActive() {
    return this.state.activeNodeId() === this.node.id;
  }

  ngOnInit() {
    this._cleanup = draggable({
      element: this.el.nativeElement,
      getInitialData: () => ({
        source: 'canvas',
        nodeId: this.node.id
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
            container.innerHTML = `
              <div style="padding: 8px 12px; background: white; border: 1px solid #cbd5e1; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: sans-serif; font-size: 14px; font-weight: 500;">
                ${this.node.label}
              </div>
            `;
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
    this.state.setActiveNode(this.node.id);
  }

  duplicateNode() {
    this.schemaService.duplicateComponent(this.node.id);
  }

  deleteNode() {
    this.schemaService.removeComponent(this.node.id);
    if (this.isActive) {
      this.state.setActiveNode(null);
    }
  }
}
