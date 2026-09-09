import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';

import { BuilderStateService } from '../services/builder-state.service';
import { HistoryService } from '../services/history.service';
import { FormSchemaService } from '../services/form-schema.service';

@Component({
  selector: 'vi-builder-toolbar',
  standalone: true,
  imports: [],
  templateUrl: './builder-toolbar.component.html',
  styleUrl: './builder-toolbar.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BuilderToolbarComponent {
  state = inject(BuilderStateService);
  history = inject(HistoryService);
  schemaService = inject(FormSchemaService);
  
  viewMode = this.state.viewMode;
  canUndo = this.history.canUndo;
  canRedo = this.history.canRedo;

  setViewMode(mode: 'design' | 'json' | 'preview') {
    this.state.setViewMode(mode);
    if (mode !== 'design') {
      this.state.setActiveNode(null);
    }
  }

  save() {
    console.log('Saving Form Schema:', this.schemaService.schema());
  }
}
