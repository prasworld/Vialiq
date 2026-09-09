import { Component, ElementRef, OnDestroy, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA, input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ComponentDescriptor } from '../types';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { BuilderStateService } from '../services/builder-state.service';
import { DndService } from '../services/dnd.service';
import { FormSchemaService } from '../services/form-schema.service';
import type { PaletteDropData } from '../services/dnd.service';

@Component({
  selector: 'vi-palette-item',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './palette-item.component.html',
  styleUrl: './palette-item.component.scss',})
export class PaletteItemComponent implements OnInit, OnDestroy {
  readonly descriptor = input.required<ComponentDescriptor>();
  @ViewChild('dragHandle', { static: true }) dragHandle!: ElementRef<HTMLElement>;

  private state = inject(BuilderStateService);
  private dndService = inject(DndService);
  private formSchemaService = inject(FormSchemaService);
  isDragging = signal(false);
  private _cleanup: (() => void) | null = null;

  ngOnInit() {
    this._cleanup = draggable({
      element: this.dragHandle.nativeElement,
      getInitialData: (): PaletteDropData => ({
        source: 'palette',
        descriptorType: this.descriptor().type,
        builderId: this.state.builderId,
      }),
      onDragStart: () => {
        this.isDragging.set(true);
      },
      onDrop: () => {
        this.isDragging.set(false);
      },
      onGenerateDragPreview: ({ nativeSetDragImage }) => {
        setCustomNativeDragPreview({
          nativeSetDragImage,
          render: ({ container }: { container: HTMLElement }) => {
            const div = document.createElement('div');
            div.setAttribute('style', 'padding: 8px 12px; background: var(--vi-layer-01); border: 1px solid var(--vi-border-03); border-radius: 6px; box-shadow: var(--vi-shadow-md); font-family: sans-serif; font-size: 14px; display: flex; align-items: center; gap: 8px;');
            const span = document.createElement('span');
            span.setAttribute('style', 'font-weight: 500; color: var(--vi-text-secondary);');
            span.textContent = this.descriptor().label;
            div.appendChild(span);
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

  handleClick() {
    this.addToCanvas();
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.addToCanvas();
    }
  }

  private addToCanvas() {
    const activeId = this.state.activeNodeId();
    let targetParentId: string | null = null;

    if (activeId) {
      const activeNode = this.formSchemaService.getNode(activeId);
      if (activeNode && 'components' in activeNode) {
        targetParentId = activeId;
      }
    }
    
    // Add to the end (index 9999 ensures it appends)
    this.dndService.addFromPalette(this.descriptor().type, targetParentId, 9999);
  }

  getIconColor(): string {
    // Basic map based on types or icons (from screenshot)
    const type = this.descriptor().type;
    const icon = this.descriptor().icon;
    
    // Grid/Layout -> Orange
    if (type.includes('column') || type === 'layout' || icon.includes('columns')) return '#f59e0b';
    
    // Basic Info -> Green
    if (['name', 'address', 'phone', 'email', 'website', 'geocomplete'].some(t => type.includes(t))) return '#10b981';
    
    // Numbers -> Purple
    if (['number', 'decimal', 'formula', 'currency'].some(t => type.includes(t))) return '#a855f7';
    
    // Textbox -> Blue
    return '#3b82f6';
  }
}
