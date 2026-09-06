import { Component, ElementRef, OnDestroy, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ComponentDescriptor } from '../types';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';

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

  isDragging = signal(false);
  private _cleanup: (() => void) | null = null;

  ngOnInit() {
    this._cleanup = draggable({
      element: this.dragHandle.nativeElement,
      getInitialData: () => ({
        source: 'palette',
        descriptorType: this.descriptor().type
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
            container.innerHTML = `
              <div style="padding: 8px 12px; background: var(--vi-layer-01); border: 1px solid var(--vi-border-03); border-radius: 6px; box-shadow: var(--vi-shadow-md); font-family: sans-serif; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 500; color: var(--vi-text-secondary);">${this.descriptor().label}</span>
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
