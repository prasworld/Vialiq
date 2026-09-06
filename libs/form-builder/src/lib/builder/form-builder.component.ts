import { Component, OnInit, OnDestroy, inject, CUSTOM_ELEMENTS_SCHEMA, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { BUILDER_CONFIG, type BuilderConfig } from '../tokens';
import { FormSchemaService } from '../services/form-schema.service';
import { BuilderStateService } from '../services/builder-state.service';
import { HistoryService } from '../services/history.service';
import { DndService } from '../services/dnd.service';
import { BuilderRegistryService } from '../registry/builder-registry.service';
import { ExtensionRegistryService } from '../services/extension-registry.service';
import { KeyGeneratorService } from '../services/key-generator.service';
import { PaletteComponent } from '../palette/palette.component';
import { CanvasComponent } from '../canvas/canvas.component';
import { BuilderToolbarComponent } from '../toolbar/builder-toolbar.component';
import { PropertiesPanelComponent } from '../properties/properties-panel.component';
import type { FormSchema } from '../types';
import { EMPTY_FORM_SCHEMA } from '../types/schema';

// ─── Icon Registration ────────────────────────────────────────────────────────
import { registerIcons } from '@vialiq/web-components/icons/registry';
import { edit1Icon } from '@vialiq/icons/edit-1';
import { documentIcon } from '@vialiq/icons/document';
import { trashIcon } from '@vialiq/icons/trash';

registerIcons([edit1Icon, documentIcon, trashIcon]);



@Component({
  selector: 'vi-form-builder',
  standalone: true,
  imports: [CommonModule, PaletteComponent, CanvasComponent, BuilderToolbarComponent, PropertiesPanelComponent],
  providers: [
    BuilderRegistryService,
    BuilderStateService,
    ExtensionRegistryService,
    FormSchemaService,
    HistoryService,
    KeyGeneratorService,
    DndService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './form-builder.component.html',
  styleUrl: './form-builder.component.scss',})
export class FormBuilderComponent implements OnInit, OnDestroy {
  private config = inject<BuilderConfig>(BUILDER_CONFIG);

  readonly initialSchema = input<FormSchema>();
  /** Uniquely identifies this builder instance for targeted extensions */
  readonly contextId = input<string>('default-context');

  schemaService = inject(FormSchemaService);
  state = inject(BuilderStateService);
  dnd = inject(DndService);
  
  schema = this.schemaService.schema;
  viewMode = this.state.viewMode;
  activeNodeId = this.state.activeNodeId;

  /**
   * Emits the current schema (debounced 300ms) whenever it changes.
   * Use this as the primary integration point in the host application.
   * @example <vi-form-builder (schemaChange)="onSchemaChange($event)" />
   */
  readonly schemaChange = output<FormSchema>();

  private readonly _schemaChange$ = toObservable(this.schemaService.schema)
    .pipe(debounceTime(300))
    .subscribe(schema => this.schemaChange.emit(schema));

  ngOnInit() {
    this.dnd.init();
    
    // Bind contextId to state service
    this.state.setContextId(this.contextId());

    const initialSchema = this.initialSchema();
    if (initialSchema) {
      this.schemaService.load(initialSchema);
    } else {
      this.schemaService.load(EMPTY_FORM_SCHEMA());
    }
  }

  ngOnDestroy() {
    this._schemaChange$.unsubscribe();
  }
}
