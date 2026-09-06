import { Component, computed, inject } from '@angular/core';

import { FormSchemaService } from '../services/form-schema.service';
import { BuilderStateService } from '../services/builder-state.service';
import { CanvasFormTitleComponent } from './canvas-form-title.component';
import { CanvasEmptyStateComponent } from './canvas-empty-state.component';
import { CanvasDropZoneComponent } from './canvas-drop-zone.component';
import { CanvasNodeComponent } from './canvas-node.component';
import type { ComponentSchema } from '../types';

@Component({
  selector: 'vi-canvas',
  standalone: true,
  imports: [
    CanvasFormTitleComponent,
    CanvasEmptyStateComponent,
    CanvasDropZoneComponent,
    CanvasNodeComponent
  ],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.scss',
})
export class CanvasComponent {
  schemaService = inject(FormSchemaService);
  state = inject(BuilderStateService);

  schema = this.schemaService.schema;
  isEmpty = computed(() => this.schema().components.length === 0);

  onTitleChange(title: string): void {
    this.schemaService.patchFormSchema({ title });
  }

  clearSelection(): void {
    this.state.setActiveNode(null);
  }
}
