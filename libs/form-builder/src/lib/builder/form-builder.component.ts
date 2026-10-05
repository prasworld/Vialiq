import { Component, OnInit, OnDestroy, inject, CUSTOM_ELEMENTS_SCHEMA, input, output, effect } from '@angular/core';
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
import { plusIcon } from '@vialiq/icons/plus';
import { pencilIcon } from '@vialiq/icons/pencil';
import { userIcon } from '@vialiq/icons/user';
import { calculatorSimpleIcon } from '@vialiq/icons/calculator-simple';
import { calendarIcon } from '@vialiq/icons/calendar';
import { clockIcon } from '@vialiq/icons/clock';
import { checkCircleIcon } from '@vialiq/icons/check-circle';
import { taskChecklistIcon } from '@vialiq/icons/task-checklist';
import { chevronDownIcon } from '@vialiq/icons/chevron-down';
import { searchIcon } from '@vialiq/icons/search';
import { alarmClockIcon } from '@vialiq/icons/alarm-clock';
import { xIcon } from '@vialiq/icons/x';
import { minusIcon } from '@vialiq/icons/minus';
import { uploadIcon } from '@vialiq/icons/upload';
import { buildingIcon } from '@vialiq/icons/building';
import { folderDownloadIcon } from '@vialiq/icons/folder-download';
import { saveIcon } from '@vialiq/icons/save';
import { lockIcon } from '@vialiq/icons/lock';
import { hospitalIcon } from '@vialiq/icons/hospital';

// Mapped Original Intentions
import { textCursorIcon } from '@vialiq/icons/text-cursor';
import { atSignIcon } from '@vialiq/icons/at-sign';
import { phoneIcon } from '@vialiq/icons/phone';
import { hashIcon } from '@vialiq/icons/hash';
import { alignLeftIcon } from '@vialiq/icons/align-left';
import { chevronsUpDownIcon } from '@vialiq/icons/chevrons-up-down';
import { listFilterIcon } from '@vialiq/icons/list-filter';
import { squareCheckIcon } from '@vialiq/icons/square-check';
import { circleDotIcon } from '@vialiq/icons/circle-dot';
import { listChecksIcon } from '@vialiq/icons/list-checks';
import { calendarClockIcon } from '@vialiq/icons/calendar-clock';
import { eyeOffIcon } from '@vialiq/icons/eye-off';
import { fileTextIcon } from '@vialiq/icons/file-text';
import { squareIcon } from '@vialiq/icons/square';
import { sendIcon } from '@vialiq/icons/send';
import { layoutPanelTopIcon } from '@vialiq/icons/layout-panel-top';
import { columnsIcon } from '@vialiq/icons/columns';
import { folderOpenIcon } from '@vialiq/icons/folder-open';
import { boxIcon } from '@vialiq/icons/box';
import { copyIcon } from '@vialiq/icons/copy';

import { browserIcon } from '@vialiq/icons/browser';
import { switchHorizontalIcon } from '@vialiq/icons/switch-horizontal';
import { sectionIcon } from '@vialiq/icons/section';
import { repeatIcon } from '@vialiq/icons/repeat';
import { separatorIcon } from '@vialiq/icons/separator';

registerIcons([
  edit1Icon, documentIcon, trashIcon, plusIcon, pencilIcon, userIcon, 
  calculatorSimpleIcon, calendarIcon, clockIcon, checkCircleIcon, 
  taskChecklistIcon, chevronDownIcon, searchIcon, alarmClockIcon, xIcon, 
  minusIcon, uploadIcon, buildingIcon, folderDownloadIcon, saveIcon, 
  lockIcon, hospitalIcon,
  
  // New icons
  textCursorIcon, atSignIcon, phoneIcon, hashIcon, alignLeftIcon,
  chevronsUpDownIcon, listFilterIcon, squareCheckIcon, circleDotIcon,
  listChecksIcon, calendarClockIcon, eyeOffIcon, fileTextIcon,
  squareIcon, sendIcon, layoutPanelTopIcon, columnsIcon,
  folderOpenIcon, boxIcon, copyIcon,
  browserIcon, switchHorizontalIcon, sectionIcon, repeatIcon, separatorIcon
]);



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

  constructor() {
    effect(() => {
      // Keep state in sync if contextId input changes (e.g. host component re-uses builder)
      this.state.setContextId(this.contextId());
    });
  }

  ngOnInit() {
    this.dnd.init();

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
