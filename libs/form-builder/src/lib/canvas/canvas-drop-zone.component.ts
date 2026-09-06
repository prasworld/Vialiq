import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, input } from '@angular/core';

import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { BuilderStateService } from '../services/builder-state.service';

@Component({
  selector: 'vi-canvas-drop-zone',
  standalone: true,
  imports: [],
  templateUrl: './canvas-drop-zone.component.html',
  styleUrl: './canvas-drop-zone.component.scss',})
export class CanvasDropZoneComponent implements OnInit, OnDestroy {
  state = inject(BuilderStateService);
  isDragging = this.state.isDragging;

  readonly parentId = input<string | null>(null);
  readonly index = input.required<number>();
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  readonly expandToFill = input(false);
  
  @ViewChild('dropZone', { static: true }) dropZone!: ElementRef<HTMLElement>;

  isDragOver = false;
  private _cleanup: (() => void) | null = null;

  ngOnInit() {
    this._cleanup = dropTargetForElements({
      element: this.dropZone.nativeElement,
      getData: () => ({
        parentId: this.parentId(),
        index: this.index()
      }),
      onDragEnter: () => this.isDragOver = true,
      onDragLeave: () => this.isDragOver = false,
      onDrop: () => this.isDragOver = false
    });
  }

  ngOnDestroy() {
    if (this._cleanup) {
      this._cleanup();
    }
  }
}
