# EDC Platform Development Plan — Part 2: Properties Panel & Layout Components

**Date:** May 31, 2026  
**Version:** 1.0  
**Status:** 📋 Planning Phase  
**Coverage:** Phase 3 → Phase 4 (Weeks 5-8)
  
**Prerequisites:** [Part 1](development-plan-part-1-foundation.md) must be complete

---

## 🎯 Part 2 Overview

This plan covers **properties panel**, **undo/redo history**, and **layout components**:

- ✅ **Phase 3** — Properties Panel & History (Week 5-6)
- ✅ **Phase 4** — Layout Components (Week 7-8)

**Goal:** By end of Part 2, users can:
- Edit component settings in a properties panel
- Undo/redo changes with debounced history
- Nest components 3+ levels deep in panels, columns, tabs
- Duplicate and delete components
- Import/export schemas via JSON view

---

## 📚 Document Reference Map

| Document | Lines | Key Sections for Part 2 |
|----------|-------|------------------------|
| [form-builder-roadmap.md](form-builder-roadmap.md) | 539 | §3.3 Phase 3 (L122-L141), §3.4 Phase 4 (L143-L165), §3.5 Phase 5 (L167-L197) |
| [form-builder-schema.md](form-builder-schema.md) | 1,613 | §6 SettingsSchema (L700-L900), §7 Layout Containers (L901-L1200) |
| [form-builder-validation.md](form-builder-validation.md) | 3,031 | §4 Built-in Validators (L200-L500), §5 JSON Logic (L501-L800) |
| [form-builder-architecture.md](form-builder-architecture.md) | 653 | §4 Services (L200-L400) |
| [form-builder-technical-debt.md](form-builder-technical-debt.md) | 413 | TD-07 validateOn Form-Level Only (L267-L306) |

---

## Phase 3 — Properties Panel & History (Week 5-6)

**Goal:** Selecting a node opens its settings; edits update schema; undo/redo works

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L122-L141)

### 📋 Task List

#### Task 3.1: History Service (Undo/Redo)

**Location:** `libs/form-builder/src/lib/services/history.service.ts`

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L44-L48)

**Requirements:**
- Wrap `@vi/state-fp` CommandBus + EventBus
- Debounce rapid changes (500ms default)
- Max history size (100 snapshots default)
- Expose `canUndo`, `canRedo` signals
- Provide `undo()`, `redo()` methods

**Implementation:**

```typescript
// services/history.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';
import { FormSchemaService } from './form-schema.service';
import { BUILDER_CONFIG } from '../tokens';
import type { FormSchema } from '../types';

interface HistorySnapshot {
  schema: FormSchema;
  timestamp: number;
}

@Injectable()
export class HistoryService {
  private readonly schemaService = inject(FormSchemaService);
  private readonly config = inject(BUILDER_CONFIG);
  
  private readonly history = signal<HistorySnapshot[]>([]);
  private readonly currentIndex = signal(-1);
  
  private readonly changeSubject = new Subject<FormSchema>();
  
  // Public signals
  readonly canUndo = computed(() => this.currentIndex() > 0);
  readonly canRedo = computed(() => this.currentIndex() < this.history().length - 1);
  
  constructor() {
    // Debounced history capture
    this.changeSubject
      .pipe(debounceTime(this.config.historyDebounceMs ?? 500))
      .subscribe(schema => this._captureSnapshot(schema));
    
    // Initial snapshot
    this._captureSnapshot(this.schemaService.schema());
  }
  
  /**
   * Records a schema change (debounced).
   * Call this after every schema mutation.
   */
  recordChange(schema: FormSchema): void {
    this.changeSubject.next(schema);
  }
  
  /**
   * Undo to previous snapshot.
   */
  undo(): void {
    if (!this.canUndo()) return;
    
    const newIndex = this.currentIndex() - 1;
    this.currentIndex.set(newIndex);
    
    const snapshot = this.history()[newIndex];
    this.schemaService.schema.set(snapshot.schema);
  }
  
  /**
   * Redo to next snapshot.
   */
  redo(): void {
    if (!this.canRedo()) return;
    
    const newIndex = this.currentIndex() + 1;
    this.currentIndex.set(newIndex);
    
    const snapshot = this.history()[newIndex];
    this.schemaService.schema.set(snapshot.schema);
  }
  
  /**
   * Clears all history.
   */
  clear(): void {
    this.history.set([]);
    this.currentIndex.set(-1);
    this._captureSnapshot(this.schemaService.schema());
  }
  
  private _captureSnapshot(schema: FormSchema): void {
    const snapshot: HistorySnapshot = {
      schema: structuredClone(schema),  // Deep clone
      timestamp: Date.now()
    };
    
    // Truncate forward history if we're in the middle
    const truncatedHistory = this.history().slice(0, this.currentIndex() + 1);
    
    // Add new snapshot
    truncatedHistory.push(snapshot);
    
    // Enforce max size
    const maxSize = this.config.maxHistorySize ?? 100;
    if (truncatedHistory.length > maxSize) {
      truncatedHistory.shift();  // Remove oldest
    } else {
      this.currentIndex.update(i => i + 1);
    }
    
    this.history.set(truncatedHistory);
  }
}
```

**Builder Config Token:**

```typescript
// tokens/builder-config.token.ts
import { InjectionToken } from '@angular/core';

export interface BuilderConfig {
  /** Debounce duration for history snapshots (ms) */
  historyDebounceMs?: number;
  
  /** Maximum history stack size */
  maxHistorySize?: number;
  
  /** Allow custom-js validators (unsafe, disabled by default) */
  allowCustomJs?: boolean;
}

export const BUILDER_CONFIG = new InjectionToken<BuilderConfig>(
  'BUILDER_CONFIG',
  {
    providedIn: 'root',
    factory: () => ({
      historyDebounceMs: 500,
      maxHistorySize: 100,
      allowCustomJs: false
    })
  }
);
```

**Toolbar Component Integration:**

```typescript
// builder/builder-toolbar.component.ts
import { Component, inject } from '@angular/core';
import { HistoryService } from '../services/history.service';

@Component({
  selector: 'vi-builder-toolbar',
  standalone: true,
  template: `
    <div class="toolbar">
      <button 
        (click)="undo()"
        [disabled]="!canUndo()">
        Undo
      </button>
      
      <button 
        (click)="redo()"
        [disabled]="!canRedo()">
        Redo
      </button>
      
      <button (click)="showJsonView()">
        JSON
      </button>
      
      <button (click)="save()">
        Save
      </button>
    </div>
  `
})
export class BuilderToolbarComponent {
  private readonly historyService = inject(HistoryService);
  
  canUndo = this.historyService.canUndo;
  canRedo = this.historyService.canRedo;
  
  undo() {
    this.historyService.undo();
  }
  
  redo() {
    this.historyService.redo();
  }
  
  showJsonView() {
    // TODO: Open JSON view modal (Task 3.5)
  }
  
  save() {
    // Emit save event to host
  }
}
```

**Acceptance Criteria:**
- ✅ History captures snapshots after debounce (500ms)
- ✅ `canUndo`/`canRedo` signals update correctly
- ✅ Undo restores previous schema
- ✅ Redo re-applies forward change
- ✅ Max history size enforced (drops oldest)
- ✅ Toolbar undo/redo buttons functional
- ✅ Unit tests for all methods

**Estimated Effort:** 2 days

---

#### Task 3.2: Builder State Service

**Location:** `libs/form-builder/src/lib/services/builder-state.service.ts`

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L45)

**Purpose:** Tracks UI state (selected node, dragging, panels open)

**Implementation:**

```typescript
// services/builder-state.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BuilderStateService {
  /** Currently selected node ID (for properties panel) */
  readonly activeNodeId = signal<string | null>(null);
  
  /** Is a drag operation in progress? */
  readonly isDragging = signal(false);
  
  /** Is properties panel open? */
  readonly propertiesPanelOpen = signal(true);
  
  /** Preview mode (vs edit mode) */
  readonly previewMode = signal(false);
  
  /**
   * Selects a node (opens properties panel).
   */
  selectNode(nodeId: string | null): void {
    this.activeNodeId.set(nodeId);
    if (nodeId) {
      this.propertiesPanelOpen.set(true);
    }
  }
  
  /**
   * Deselects current node (closes properties panel or shows form settings).
   */
  deselectNode(): void {
    this.activeNodeId.set(null);
  }
  
  /**
   * Toggles properties panel visibility.
   */
  togglePropertiesPanel(): void {
    this.propertiesPanelOpen.update(open => !open);
  }
  
  /**
   * Toggles preview mode.
   */
  togglePreview(): void {
    this.previewMode.update(preview => !preview);
  }
}
```

**Acceptance Criteria:**
- ✅ `activeNodeId` tracks selected node
- ✅ Clicking canvas node selects it
- ✅ Clicking empty canvas area deselects
- ✅ Properties panel opens/closes based on state

**Estimated Effort:** 0.5 days

---

#### Task 3.3: Properties Panel Components

**Location:** `libs/form-builder/src/lib/properties/`

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L122-L141)

**File Structure:**
```
properties/
├── properties-panel.component.ts          # Main panel shell
├── form-settings-panel.component.ts       # Form-level settings (when no node selected)
├── settings-tab.component.ts              # Renders one SettingsTab
├── settings-field.component.ts            # Switches on field.type
├── settings-host.component.ts             # Lazy-loads custom settingsComponent
├── validation-rules-editor.component.ts   # Add/edit/remove rules (Phase 5)
├── conditional-editor.component.ts        # Conditional visibility builder (Phase 5)
└── rule-row.component.ts                  # Single rule display
```

**Properties Panel Shell:**

```typescript
// properties/properties-panel.component.ts
import { Component, inject, computed } from '@angular/core';
import { BuilderStateService } from '../services/builder-state.service';
import { FormSchemaService } from '../services/form-schema.service';
import { BuilderRegistryService } from '../registry/builder-registry.service';
import { FormSettingsPanelComponent } from './form-settings-panel.component';
import { SettingsTabComponent } from './settings-tab.component';
import type { ComponentSchema } from '../types';

@Component({
  selector: 'vi-properties-panel',
  standalone: true,
  imports: [FormSettingsPanelComponent, SettingsTabComponent],
  template: `
    <div class="properties-panel">
      <div class="properties-header">
        <h3>{{ title() }}</h3>
        <button (click)="close()">✕</button>
      </div>
      
      <div class="properties-body">
        @if (!activeNode()) {
          <!-- No node selected: show form settings -->
          <vi-form-settings-panel />
        } @else {
          <!-- Node selected: show component settings -->
          <div class="settings-tabs">
            @for (tab of settingsTabs(); track tab.id) {
              <button 
                class="tab"
                [class.active]="activeTab() === tab.id"
                (click)="selectTab(tab.id)">
                {{ tab.label }}
              </button>
            }
          </div>
          
          <div class="settings-content">
            @if (activeTabData()) {
              <vi-settings-tab [tab]="activeTabData()!" [schema]="activeNode()!" />
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .properties-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    
    .properties-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid var(--vi-border-color);
    }
    
    .properties-body {
      flex: 1;
      overflow-y: auto;
    }
    
    .settings-tabs {
      display: flex;
      border-bottom: 1px solid var(--vi-border-color);
    }
    
    .tab {
      flex: 1;
      padding: 0.75rem;
      border: none;
      background: transparent;
      cursor: pointer;
    }
    
    .tab.active {
      border-bottom: 2px solid var(--vi-primary-color);
      font-weight: 600;
    }
    
    .settings-content {
      padding: 1rem;
    }
  `]
})
export class PropertiesPanelComponent {
  private readonly builderState = inject(BuilderStateService);
  private readonly schemaService = inject(FormSchemaService);
  private readonly registry = inject(BuilderRegistryService);
  
  activeNodeId = this.builderState.activeNodeId;
  
  activeNode = computed(() => {
    const id = this.activeNodeId();
    return id ? this.schemaService.getNode(id) : null;
  });
  
  title = computed(() => {
    const node = this.activeNode();
    return node ? node.label || node.type : 'Form Settings';
  });
  
  settingsTabs = computed(() => {
    const node = this.activeNode();
    if (!node) return [];
    
    const descriptor = this.registry.getByType(node.type);
    return descriptor?.settingsSchema?.tabs ?? [];
  });
  
  activeTab = signal<string>('general');
  
  activeTabData = computed(() => {
    return this.settingsTabs().find(t => t.id === this.activeTab());
  });
  
  selectTab(tabId: string): void {
    this.activeTab.set(tabId);
  }
  
  close(): void {
    this.builderState.deselectNode();
  }
}
```

**Settings Tab Component:**

```typescript
// properties/settings-tab.component.ts
import { Component, input } from '@angular/core';
import { SettingsFieldComponent } from './settings-field.component';
import type { SettingsTab, ComponentSchema } from '../types';

@Component({
  selector: 'vi-settings-tab',
  standalone: true,
  imports: [SettingsFieldComponent],
  template: `
    <div class="settings-tab">
      @for (field of tab().fields; track field.key) {
        <vi-settings-field 
          [field]="field" 
          [schema]="schema()"
          (valueChange)="onFieldChange(field.key, $event)" />
      }
    </div>
  `
})
export class SettingsTabComponent {
  tab = input.required<SettingsTab>();
  schema = input.required<ComponentSchema>();
  
  onFieldChange(key: string, value: unknown): void {
    // Patch schema via FormSchemaService
    // TODO: implement in Task 3.4
  }
}
```

**Settings Field Component:**

```typescript
// properties/settings-field.component.ts
import { Component, input, output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import type { SettingsField, ComponentSchema } from '../types';

@Component({
  selector: 'vi-settings-field',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="settings-field">
      <label>{{ field().label }}</label>
      
      @if (field().description) {
        <p class="help-text">{{ field().description }}</p>
      }
      
      <ng-container [ngSwitch]="field().type">
        <!-- Text input -->
        <vi-input
          *ngSwitchCase="'text'"
          [value]="currentValue()"
          [placeholder]="field().placeholder"
          [required]="field().required"
          (vi-input-change)="onChange($event.detail.value)" />
        
        <!-- Textarea -->
        <vi-textarea
          *ngSwitchCase="'textarea'"
          [value]="currentValue()"
          [rows]="field().rows || 3"
          (vi-textarea-change)="onChange($event.detail.value)" />
        
        <!-- Select -->
        <vi-select
          *ngSwitchCase="'select'"
          [value]="currentValue()"
          (vi-select-change)="onChange($event.detail.value)">
          @for (option of field().options; track option.value) {
            <option [value]="option.value">{{ option.label }}</option>
          }
        </vi-select>
        
        <!-- Checkbox -->
        <vi-checkbox
          *ngSwitchCase="'checkbox'"
          [checked]="currentValue()"
          (vi-checkbox-change)="onChange($event.detail.checked)">
          {{ field().label }}
        </vi-checkbox>
        
        <!-- Number -->
        <vi-input
          *ngSwitchCase="'number'"
          type="number"
          [value]="currentValue()"
          [min]="field().min"
          [max]="field().max"
          (vi-input-change)="onChange(Number($event.detail.value))" />
        
        <!-- Custom: validation-rules -->
        <vi-validation-rules-editor
          *ngSwitchCase="'validation-rules'"
          [rules]="currentValue()"
          (rulesChange)="onChange($event)" />
        
        <!-- Custom: conditional -->
        <vi-conditional-editor
          *ngSwitchCase="'conditional'"
          [conditional]="currentValue()"
          (conditionalChange)="onChange($event)" />
      </ng-container>
      
      @if (field().validationError) {
        <p class="error">{{ field().validationError }}</p>
      }
    </div>
  `
})
export class SettingsFieldComponent {
  field = input.required<SettingsField>();
  schema = input.required<ComponentSchema>();
  
  valueChange = output<unknown>();
  
  currentValue = computed(() => {
    const key = this.field().key;
    return (this.schema() as any)[key] ?? this.field().defaultValue;
  });
  
  onChange(value: unknown): void {
    this.valueChange.emit(value);
  }
}
```

**Form Settings Panel:**

```typescript
// properties/form-settings-panel.component.ts
import { Component, inject, computed } from '@angular/core';
import { FormSchemaService } from '../services/form-schema.service';
import { HistoryService } from '../services/history.service';
import { SettingsFieldComponent } from './settings-field.component';
import type { FormSchema, FormSettings } from '../types';

@Component({
  selector: 'vi-form-settings-panel',
  standalone: true,
  imports: [SettingsFieldComponent],
  template: `
    <div class="form-settings">
      <h4>Form Settings</h4>
      
      <!-- Title -->
      <div class="field">
        <label>Form Title</label>
        <vi-input 
          [value]="schema().title"
          (vi-input-change)="updateTitle($event.detail.value)" />
      </div>
      
      <!-- Description -->
      <div class="field">
        <label>Description</label>
        <vi-textarea 
          [value]="schema().description"
          (vi-textarea-change)="updateDescription($event.detail.value)" />
      </div>
      
      <!-- validateOn (form-level only, per TD-07) -->
      <div class="field">
        <label>Validate On</label>
        <vi-select 
          [value]="settings().validateOn"
          (vi-select-change)="updateValidateOn($event.detail.value)">
          <option value="onChange">On Change</option>
          <option value="onBlur">On Blur</option>
          <option value="onSubmit">On Submit</option>
        </vi-select>
        <p class="help-text">
          When to run validation (applies to all fields).
          <a href="#">TD-07: Form-level only</a>
        </p>
      </div>
      
      <!-- Max Width -->
      <div class="field">
        <label>Max Width</label>
        <vi-input 
          [value]="settings().maxWidth"
          placeholder="800px, 100%"
          (vi-input-change)="updateMaxWidth($event.detail.value)" />
      </div>
      
      <!-- Submit Button Label -->
      <div class="field">
        <label>Submit Button Label</label>
        <vi-input 
          [value]="settings().submitButton?.label"
          (vi-input-change)="updateSubmitButtonLabel($event.detail.value)" />
      </div>
    </div>
  `
})
export class FormSettingsPanelComponent {
  private readonly schemaService = inject(FormSchemaService);
  private readonly historyService = inject(HistoryService);
  
  schema = this.schemaService.schema;
  settings = computed(() => this.schema().settings);
  
  updateTitle(title: string): void {
    const updated = { ...this.schema(), title };
    this.schemaService.schema.set(updated);
    this.historyService.recordChange(updated);
  }
  
  updateDescription(description: string): void {
    const updated = { ...this.schema(), description };
    this.schemaService.schema.set(updated);
    this.historyService.recordChange(updated);
  }
  
  updateValidateOn(validateOn: 'onChange' | 'onBlur' | 'onSubmit'): void {
    const updated = {
      ...this.schema(),
      settings: {
        ...this.settings(),
        validateOn
      }
    };
    this.schemaService.schema.set(updated);
    this.historyService.recordChange(updated);
  }
  
  updateMaxWidth(maxWidth: string): void {
    const updated = {
      ...this.schema(),
      settings: {
        ...this.settings(),
        maxWidth
      }
    };
    this.schemaService.schema.set(updated);
    this.historyService.recordChange(updated);
  }
  
  updateSubmitButtonLabel(label: string): void {
    const updated = {
      ...this.schema(),
      settings: {
        ...this.settings(),
        submitButton: {
          ...this.settings().submitButton,
          label
        }
      }
    };
    this.schemaService.schema.set(updated);
    this.historyService.recordChange(updated);
  }
}
```

**Acceptance Criteria:**
- ✅ Properties panel opens when node selected
- ✅ Shows form settings when no node selected
- ✅ Renders tabs from descriptor's `settingsSchema`
- ✅ `SettingsFieldComponent` switches on field type
- ✅ Edits trigger schema updates
- ✅ Changes debounced and recorded in history
- ✅ Undo/redo restores edited values

**Estimated Effort:** 4-5 days

---

#### Task 3.4: Schema Mutation Integration

**Location:** Update `FormSchemaService` + wire to properties panel

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L133-L138)

**Implementation:**

```typescript
// Wire properties panel to schema mutations
// In SettingsTabComponent:

onFieldChange(key: string, value: unknown): void {
  const schemaService = inject(FormSchemaService);
  const historyService = inject(HistoryService);
  
  const nodeId = this.schema().id;
  const patch = { [key]: value };
  
  // Special handling for 'key' field: validate uniqueness
  if (key === 'key') {
    const isUnique = schemaService.isKeyUnique(value as string, nodeId);
    if (!isUnique) {
      // Show error
      alert('Key must be unique');
      return;
    }
  }
  
  // Apply patch
  const updated = schemaService.patchComponent(nodeId, patch);
  schemaService.schema.set(updated);
  
  // Record in history (debounced)
  historyService.recordChange(updated);
}
```

**Key Field Validation:**

```typescript
// In SettingsFieldComponent for 'key' field:
<vi-input
  [value]="currentValue()"
  [pattern]="'^[a-z][a-zA-Z0-9]*$'"
  [required]="true"
  (vi-input-blur)="validateKey($event.detail.value)"
  (vi-input-change)="onChange($event.detail.value)" />

validateKey(key: string): void {
  const schemaService = inject(FormSchemaService);
  const nodeId = this.schema().id;
  
  // Check uniqueness
  const isUnique = schemaService.isKeyUnique(key, nodeId);
  
  // Check format (camelCase)
  const isValid = /^[a-z][a-zA-Z0-9]*$/.test(key);
  
  if (!isUnique) {
    // Show error
    this.field().validationError = 'Key must be unique';
  } else if (!isValid) {
    this.field().validationError = 'Key must be camelCase';
  } else {
    this.field().validationError = undefined;
  }
}
```

**Acceptance Criteria:**
- ✅ Typing in label field updates schema immediately
- ✅ Key field validates uniqueness inline
- ✅ Key field shows error if not camelCase
- ✅ Changes debounced (500ms) before history snapshot
- ✅ Undo restores previous label value

**Estimated Effort:** 1 day

---

#### Task 3.5: JSON View Modal

**Location:** `libs/form-builder/src/lib/json-view/schema-json-view.component.ts`

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L139-L141)

**Purpose:** View/edit raw schema JSON; import existing schemas

**Implementation:**

```typescript
// json-view/schema-json-view.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormSchemaService } from '../services/form-schema.service';
import { HistoryService } from '../services/history.service';
import type { FormSchema } from '../types';

@Component({
  selector: 'vi-schema-json-view',
  standalone: true,
  template: `
    <div class="json-view-modal" *ngIf="isOpen()">
      <div class="modal-backdrop" (click)="close()"></div>
      
      <div class="modal-content">
        <div class="modal-header">
          <h3>Schema JSON</h3>
          <button (click)="close()">✕</button>
        </div>
        
        <div class="modal-body">
          <textarea 
            class="json-editor"
            [(ngModel)]="jsonText"
            [class.error]="parseError()"></textarea>
          
          @if (parseError()) {
            <p class="error-message">{{ parseError() }}</p>
          }
        </div>
        
        <div class="modal-footer">
          <button (click)="close()">Cancel</button>
          <button 
            (click)="copyToClipboard()"
            class="secondary">
            Copy
          </button>
          <button 
            (click)="importJson()"
            [disabled]="!!parseError()"
            class="primary">
            Import
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .json-view-modal {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
    }
    
    .modal-content {
      position: relative;
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      background: white;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
    }
    
    .json-editor {
      width: 100%;
      height: 500px;
      font-family: 'Courier New', monospace;
      padding: 1rem;
      border: 1px solid var(--vi-border-color);
      resize: vertical;
    }
    
    .json-editor.error {
      border-color: var(--vi-error-color);
    }
  `]
})
export class SchemaJsonViewComponent {
  private readonly schemaService = inject(FormSchemaService);
  private readonly historyService = inject(HistoryService);
  
  isOpen = signal(false);
  jsonText = signal('');
  parseError = signal<string | null>(null);
  
  open(): void {
    const schema = this.schemaService.schema();
    this.jsonText.set(JSON.stringify(schema, null, 2));
    this.parseError.set(null);
    this.isOpen.set(true);
  }
  
  close(): void {
    this.isOpen.set(false);
  }
  
  importJson(): void {
    try {
      const schema = JSON.parse(this.jsonText()) as FormSchema;
      
      // Basic validation
      if (!schema.schemaVersion || !schema.id || !Array.isArray(schema.components)) {
        throw new Error('Invalid schema structure');
      }
      
      // Apply imported schema
      this.schemaService.schema.set(schema);
      this.historyService.clear();  // Clear history after import
      this.close();
    } catch (err) {
      this.parseError.set((err as Error).message);
    }
  }
  
  copyToClipboard(): void {
    navigator.clipboard.writeText(this.jsonText());
  }
}
```

**Acceptance Criteria:**
- ✅ Modal opens with formatted JSON
- ✅ JSON is editable
- ✅ Parse errors shown inline
- ✅ Import button applies new schema
- ✅ Copy button copies to clipboard
- ✅ History cleared after import

**Estimated Effort:** 1 day

---

#### Task 3.6: Duplicate Component Action

**Location:** Update `CanvasNodeOverlayComponent`

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L137-L138)

**Implementation:**

```typescript
// canvas/canvas-node-overlay.component.ts
import { Component, input, inject } from '@angular/core';
import { FormSchemaService } from '../services/form-schema.service';
import { KeyGeneratorService } from '../services/key-generator.service';
import { HistoryService } from '../services/history.service';
import { BuilderStateService } from '../services/builder-state.service';

@Component({
  selector: 'vi-canvas-node-overlay',
  standalone: true,
  template: `
    <div class="node-overlay" [class.selected]="isSelected()">
      <!-- Drag handle -->
      <button class="drag-handle" #dragHandle>⋮⋮</button>
      
      <!-- Actions -->
      <div class="node-actions">
        <button 
          class="action-btn"
          (click)="selectNode()"
          title="Edit Settings">
          ⚙️
        </button>
        
        <button 
          class="action-btn"
          (click)="duplicate()"
          title="Duplicate">
          📋
        </button>
        
        <button 
          class="action-btn delete"
          (click)="delete()"
          title="Delete">
          🗑️
        </button>
      </div>
    </div>
  `
})
export class CanvasNodeOverlayComponent {
  nodeId = input.required<string>();
  
  private readonly schemaService = inject(FormSchemaService);
  private readonly keyGenerator = inject(KeyGeneratorService);
  private readonly historyService = inject(HistoryService);
  private readonly builderState = inject(BuilderStateService);
  
  isSelected = computed(() => this.builderState.activeNodeId() === this.nodeId());
  
  selectNode(): void {
    this.builderState.selectNode(this.nodeId());
  }
  
  duplicate(): void {
    const updated = this.schemaService.duplicateComponent(
      this.nodeId(),
      (label, keys) => this.keyGenerator.generateUniqueKey(label, keys)
    );
    
    this.schemaService.schema.set(updated);
    this.historyService.recordChange(updated);
  }
  
  delete(): void {
    if (!confirm('Delete this component?')) return;
    
    const updated = this.schemaService.removeComponent(this.nodeId());
    this.schemaService.schema.set(updated);
    this.historyService.recordChange(updated);
    
    // Deselect if this was the selected node
    if (this.isSelected()) {
      this.builderState.deselectNode();
    }
  }
}
```

**Acceptance Criteria:**
- ✅ Duplicate button creates clone with suffixed key
- ✅ Clone appears immediately after original
- ✅ Delete button removes component
- ✅ Confirm dialog before delete
- ✅ Actions recorded in history

**Estimated Effort:** 0.5 days

---

### Phase 3 Summary

**Total Duration:** Week 5-6 (10 days)

**Deliverables:**
- ✅ History service with undo/redo (debounced)
- ✅ Properties panel with tabbed settings
- ✅ Form settings panel (when no node selected)
- ✅ Settings fields render based on descriptor schema
- ✅ Key field validates uniqueness inline
- ✅ JSON view modal for import/export
- ✅ Duplicate component action
- ✅ Delete component action

**Validation:**
```bash
# Open Storybook
npx nx run form-builder:storybook

# 1. Drag "Text Input" to canvas
# 2. Click to select → properties panel opens
# 3. Edit label → canvas updates live
# 4. Click undo → label reverts
# 5. Click redo → label re-applies
# 6. Click "Duplicate" → clone appears with key "textInput1"
# 7. Click empty canvas → form settings panel shows
# 8. Edit "validateOn" → schema updates
# 9. Click "JSON" → modal shows schema JSON
# 10. Edit JSON, click Import → schema updates
```

---

## Phase 4 — Layout Components (Week 7-8)

**Goal:** Full recursive nesting — panels, columns, tabs, fieldset, repeater

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L143-L165)

### 📋 Task List

#### Task 4.1: Layout Component Schemas

**Location:** Update `libs/form-builder/src/lib/types/layout-component-schema.ts`

**Reference:** [form-builder-schema.md](form-builder-schema.md#L901-L1200)

**Implementation:**

```typescript
// types/layout-component-schema.ts

export type LayoutComponentSchema =
  | PanelComponentSchema
  | ColumnsComponentSchema
  | TabsComponentSchema
  | FieldsetComponentSchema
  | RepeaterComponentSchema;

/**
 * Panel: Simple container with optional collapse.
 */
export interface PanelComponentSchema extends BaseComponentSchema {
  readonly type: 'panel';
  readonly components: ComponentSchema[];
  readonly collapsible?: boolean;
  readonly collapsed?: boolean;
  readonly title?: string;
}

/**
 * Columns: N-column grid layout.
 */
export interface ColumnsComponentSchema extends BaseComponentSchema {
  readonly type: 'columns';
  readonly columns: number;  // 2, 3, 4
  readonly columnAssignments: Record<string, number>;  // { nodeId: columnIndex }
  readonly components: ComponentSchema[];
}

/**
 * Tabs: Tabbed container.
 */
export interface TabsComponentSchema extends BaseComponentSchema {
  readonly type: 'tabs';
  readonly tabs: TabDefinition[];
  readonly tabAssignments: Record<string, string>;  // { nodeId: tabId }
  readonly components: ComponentSchema[];
}

export interface TabDefinition {
  readonly id: string;
  readonly label: string;
}

/**
 * Fieldset: Semantic grouping with legend.
 */
export interface FieldsetComponentSchema extends BaseComponentSchema {
  readonly type: 'fieldset';
  readonly legend: string;
  readonly components: ComponentSchema[];
}

/**
 * Repeater: Dynamic array of field groups.
 */
export interface RepeaterComponentSchema extends BaseComponentSchema {
  readonly type: 'repeater';
  readonly components: ComponentSchema[];
  readonly minInstances?: number;
  readonly maxInstances?: number;
  readonly addButtonLabel?: string;
  readonly removeButtonLabel?: string;
}
```

**Acceptance Criteria:**
- ✅ All layout schemas extend `BaseComponentSchema`
- ✅ Each has `components: ComponentSchema[]` for nesting
- ✅ Columns has `columnAssignments` map
- ✅ Tabs has `tabAssignments` map
- ✅ TypeScript discriminated union narrows correctly

**Estimated Effort:** 1 day

---

#### Task 4.2: Layout Descriptors

**Location:** `libs/form-builder/src/lib/built-in-components/`

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L143-L147)

**Panel Descriptor:**

```typescript
// built-in-components/panel.descriptor.ts
import type { ComponentDescriptor, PanelComponentSchema } from '../types';

export const PANEL_DESCRIPTOR: ComponentDescriptor = {
  type: 'panel',
  label: 'Panel',
  icon: 'panel',
  category: 'layout',
  order: 1,
  
  createDefaultSchema: (id: string): PanelComponentSchema => ({
    id,
    type: 'panel',
    key: '',
    label: 'Panel',
    components: [],
    collapsible: false,
    collapsed: false
  }),
  
  settingsSchema: {
    tabs: [
      {
        id: 'general',
        label: 'General',
        fields: [
          {
            key: 'label',
            label: 'Title',
            type: 'text',
            required: true
          },
          {
            key: 'key',
            label: 'Key',
            type: 'text',
            required: true,
            pattern: '^[a-z][a-zA-Z0-9]*$'
          },
          {
            key: 'collapsible',
            label: 'Collapsible',
            type: 'checkbox',
            defaultValue: false
          },
          {
            key: 'collapsed',
            label: 'Initially Collapsed',
            type: 'checkbox',
            defaultValue: false,
            // Only show if collapsible=true
            conditional: {
              type: 'simple',
              when: 'collapsible',
              is: true
            }
          }
        ]
      }
    ]
  },
  
  canvasElement: 'div'  // No vi-panel web component; use plain div
};
```

**Columns Descriptor:**

```typescript
// built-in-components/columns.descriptor.ts
export const COLUMNS_DESCRIPTOR: ComponentDescriptor = {
  type: 'columns',
  label: 'Columns',
  icon: 'columns',
  category: 'layout',
  order: 2,
  
  createDefaultSchema: (id: string): ColumnsComponentSchema => ({
    id,
    type: 'columns',
    key: '',
    label: 'Columns',
    columns: 2,
    columnAssignments: {},
    components: []
  }),
  
  settingsSchema: {
    tabs: [
      {
        id: 'general',
        label: 'General',
        fields: [
          {
            key: 'label',
            label: 'Label',
            type: 'text'
          },
          {
            key: 'key',
            label: 'Key',
            type: 'text',
            required: true
          },
          {
            key: 'columns',
            label: 'Number of Columns',
            type: 'select',
            options: [
              { label: '2 Columns', value: 2 },
              { label: '3 Columns', value: 3 },
              { label: '4 Columns', value: 4 }
            ],
            defaultValue: 2
          }
        ]
      }
    ]
  },
  
  canvasElement: 'div'
};
```

**Tabs Descriptor:**

```typescript
// built-in-components/tabs.descriptor.ts
export const TABS_DESCRIPTOR: ComponentDescriptor = {
  type: 'tabs',
  label: 'Tabs',
  icon: 'tabs',
  category: 'layout',
  order: 3,
  
  createDefaultSchema: (id: string): TabsComponentSchema => ({
    id,
    type: 'tabs',
    key: '',
    label: 'Tabs',
    tabs: [
      { id: 'tab1', label: 'Tab 1' },
      { id: 'tab2', label: 'Tab 2' }
    ],
    tabAssignments: {},
    components: []
  }),
  
  settingsSchema: {
    tabs: [
      {
        id: 'general',
        label: 'General',
        fields: [
          {
            key: 'key',
            label: 'Key',
            type: 'text',
            required: true
          },
          {
            key: 'tabs',
            label: 'Tab Definitions',
            type: 'tab-editor',  // Custom component
            required: true
          }
        ]
      }
    ]
  },
  
  canvasElement: 'div'
};
```

**Fieldset Descriptor:**

```typescript
// built-in-components/fieldset.descriptor.ts
export const FIELDSET_DESCRIPTOR: ComponentDescriptor = {
  type: 'fieldset',
  label: 'Fieldset',
  icon: 'fieldset',
  category: 'layout',
  order: 4,
  
  createDefaultSchema: (id: string): FieldsetComponentSchema => ({
    id,
    type: 'fieldset',
    key: '',
    legend: 'Fieldset',
    components: []
  }),
  
  settingsSchema: {
    tabs: [
      {
        id: 'general',
        label: 'General',
        fields: [
          {
            key: 'legend',
            label: 'Legend',
            type: 'text',
            required: true
          },
          {
            key: 'key',
            label: 'Key',
            type: 'text',
            required: true
          }
        ]
      }
    ]
  },
  
  canvasElement: 'fieldset'
};
```

**Repeater Descriptor:**

```typescript
// built-in-components/repeater.descriptor.ts
export const REPEATER_DESCRIPTOR: ComponentDescriptor = {
  type: 'repeater',
  label: 'Repeater',
  icon: 'repeat',
  category: 'layout',
  order: 5,
  
  createDefaultSchema: (id: string): RepeaterComponentSchema => ({
    id,
    type: 'repeater',
    key: '',
    label: 'Repeater',
    components: [],
    minInstances: 0,
    maxInstances: 10,
    addButtonLabel: 'Add',
    removeButtonLabel: 'Remove'
  }),
  
  settingsSchema: {
    tabs: [
      {
        id: 'general',
        label: 'General',
        fields: [
          {
            key: 'label',
            label: 'Label',
            type: 'text',
            required: true
          },
          {
            key: 'key',
            label: 'Key',
            type: 'text',
            required: true
          },
          {
            key: 'minInstances',
            label: 'Minimum Instances',
            type: 'number',
            min: 0,
            defaultValue: 0
          },
          {
            key: 'maxInstances',
            label: 'Maximum Instances',
            type: 'number',
            min: 1,
            defaultValue: 10
          },
          {
            key: 'addButtonLabel',
            label: 'Add Button Label',
            type: 'text',
            defaultValue: 'Add'
          },
          {
            key: 'removeButtonLabel',
            label: 'Remove Button Label',
            type: 'text',
            defaultValue: 'Remove'
          }
        ]
      }
    ]
  },
  
  canvasElement: 'div'
};
```

**Acceptance Criteria:**
- ✅ All 5 layout descriptors created
- ✅ Each has `createDefaultSchema()` factory
- ✅ Each has `settingsSchema` for properties panel
- ✅ Columns and Tabs have assignment maps
- ✅ Exported from `built-in-components/index.ts`

**Estimated Effort:** 2 days

---

#### Task 4.3: Canvas Container Component

**Location:** `libs/form-builder/src/lib/canvas/canvas-container.component.ts`

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L143-L147)

**Purpose:** Renders layout containers with per-column/tab drop zones

**Implementation:**

```typescript
// canvas/canvas-container.component.ts
import { Component, input, computed } from '@angular/core';
import { CanvasNodeComponent } from './canvas-node.component';
import { CanvasDropZoneComponent } from './canvas-drop-zone.component';
import type { LayoutComponentSchema, ComponentSchema } from '../types';

@Component({
  selector: 'vi-canvas-container',
  standalone: true,
  imports: [CanvasNodeComponent, CanvasDropZoneComponent],
  template: `
    <div class="canvas-container" [ngSwitch]="schema().type">
      <!-- Panel -->
      <div *ngSwitchCase="'panel'" class="container-panel">
        <div class="panel-header">
          {{ schema().label }}
          @if (schema().collapsible) {
            <button class="collapse-btn">▼</button>
          }
        </div>
        
        <div class="panel-body">
          <vi-canvas-drop-zone [parentId]="schema().id" [index]="0" />
          
          @for (child of children(); track child.id; let i = $index) {
            <vi-canvas-node [schema]="child" [parentId]="schema().id" [index]="i" />
            <vi-canvas-drop-zone [parentId]="schema().id" [index]="i + 1" />
          }
        </div>
      </div>
      
      <!-- Columns -->
      <div *ngSwitchCase="'columns'" class="container-columns">
        <div class="columns-grid" [style.grid-template-columns]="gridTemplateColumns()">
          @for (col of columnIndices(); track col) {
            <div class="column">
              <vi-canvas-drop-zone [parentId]="schema().id" [index]="0" [column]="col" />
              
              @for (child of getChildrenInColumn(col); track child.id; let i = $index) {
                <vi-canvas-node [schema]="child" [parentId]="schema().id" [index]="i" />
                <vi-canvas-drop-zone [parentId]="schema().id" [index]="i + 1" [column]="col" />
              }
            </div>
          }
        </div>
      </div>
      
      <!-- Tabs -->
      <div *ngSwitchCase="'tabs'" class="container-tabs">
        <div class="tabs-header">
          @for (tab of schema().tabs; track tab.id) {
            <button 
              class="tab"
              [class.active]="activeTab() === tab.id"
              (click)="selectTab(tab.id)">
              {{ tab.label }}
            </button>
          }
        </div>
        
        <div class="tab-content">
          @if (activeTab()) {
            <vi-canvas-drop-zone [parentId]="schema().id" [index]="0" [tab]="activeTab()" />
            
            @for (child of getChildrenInTab(activeTab()); track child.id; let i = $index) {
              <vi-canvas-node [schema]="child" [parentId]="schema().id" [index]="i" />
              <vi-canvas-drop-zone [parentId]="schema().id" [index]="i + 1" [tab]="activeTab()" />
            }
          }
        </div>
      </div>
      
      <!-- Fieldset -->
      <fieldset *ngSwitchCase="'fieldset'" class="container-fieldset">
        <legend>{{ schema().legend }}</legend>
        
        <vi-canvas-drop-zone [parentId]="schema().id" [index]="0" />
        
        @for (child of children(); track child.id; let i = $index) {
          <vi-canvas-node [schema]="child" [parentId]="schema().id" [index]="i" />
          <vi-canvas-drop-zone [parentId]="schema().id" [index]="i + 1" />
        }
      </fieldset>
      
      <!-- Repeater -->
      <div *ngSwitchCase="'repeater'" class="container-repeater">
        <div class="repeater-header">
          {{ schema().label }}
        </div>
        
        <div class="repeater-body">
          <vi-canvas-drop-zone [parentId]="schema().id" [index]="0" />
          
          @for (child of children(); track child.id; let i = $index) {
            <vi-canvas-node [schema]="child" [parentId]="schema().id" [index]="i" />
            <vi-canvas-drop-zone [parentId]="schema().id" [index]="i + 1" />
          }
        </div>
        
        <div class="repeater-footer">
          <span class="repeater-hint">
            This will repeat {{ minInstances() }}–{{ maxInstances() }} times at runtime
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .columns-grid {
      display: grid;
      gap: 1rem;
    }
    
    .column {
      min-height: 100px;
      border: 1px dashed var(--vi-border-color);
      padding: 0.5rem;
    }
    
    .tabs-header {
      display: flex;
      border-bottom: 1px solid var(--vi-border-color);
    }
    
    .tab {
      padding: 0.75rem 1rem;
      border: none;
      background: transparent;
      cursor: pointer;
    }
    
    .tab.active {
      border-bottom: 2px solid var(--vi-primary-color);
      font-weight: 600;
    }
  `]
})
export class CanvasContainerComponent {
  schema = input.required<LayoutComponentSchema>();
  
  children = computed(() => this.schema().components);
  
  // Columns
  columnIndices = computed(() => {
    const s = this.schema();
    if (s.type === 'columns') {
      return Array.from({ length: s.columns }, (_, i) => i);
    }
    return [];
  });
  
  gridTemplateColumns = computed(() => {
    const s = this.schema();
    if (s.type === 'columns') {
      return `repeat(${s.columns}, 1fr)`;
    }
    return '';
  });
  
  getChildrenInColumn(colIndex: number): ComponentSchema[] {
    const s = this.schema();
    if (s.type !== 'columns') return [];
    
    return s.components.filter(c => {
      const assignment = s.columnAssignments[c.id];
      return assignment === colIndex;
    });
  }
  
  // Tabs
  activeTab = signal<string>(this.schema().tabs?.[0]?.id);
  
  selectTab(tabId: string): void {
    this.activeTab.set(tabId);
  }
  
  getChildrenInTab(tabId: string): ComponentSchema[] {
    const s = this.schema();
    if (s.type !== 'tabs') return [];
    
    return s.components.filter(c => {
      const assignment = s.tabAssignments[c.id];
      return assignment === tabId;
    });
  }
  
  // Repeater
  minInstances = computed(() => {
    const s = this.schema();
    return s.type === 'repeater' ? s.minInstances : 0;
  });
  
  maxInstances = computed(() => {
    const s = this.schema();
    return s.type === 'repeater' ? s.maxInstances : 0;
  });
}
```

**Acceptance Criteria:**
- ✅ Panel renders with collapsible header
- ✅ Columns renders N-column grid
- ✅ Tabs renders tab header + tab content
- ✅ Fieldset renders with legend
- ✅ Repeater shows hint text
- ✅ Drop zones appear inside each container
- ✅ Drop zones in columns are column-specific
- ✅ Drop zones in tabs are tab-specific

**Estimated Effort:** 3-4 days

---

#### Task 4.4: Breadcrumb Navigation

**Location:** `libs/form-builder/src/lib/canvas/canvas-breadcrumb.component.ts`

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L155-L156)

**Purpose:** Shows nesting path for deeply nested nodes

**Implementation:**

```typescript
// canvas/canvas-breadcrumb.component.ts
import { Component, inject, computed } from '@angular/core';
import { BuilderStateService } from '../services/builder-state.service';
import { FormSchemaService } from '../services/form-schema.service';

@Component({
  selector: 'vi-canvas-breadcrumb',
  standalone: true,
  template: `
    <nav class="breadcrumb" *ngIf="path().length > 0">
      <button 
        class="breadcrumb-item"
        (click)="selectNode(null)">
        Form
      </button>
      
      @for (node of path(); track node.id; let last = $last) {
        <span class="separator">›</span>
        <button 
          class="breadcrumb-item"
          [class.active]="last"
          (click)="selectNode(node.id)">
          {{ node.label || node.type }}
        </button>
      }
    </nav>
  `
})
export class CanvasBreadcrumbComponent {
  private readonly builderState = inject(BuilderStateService);
  private readonly schemaService = inject(FormSchemaService);
  
  activeNodeId = this.builderState.activeNodeId;
  
  path = computed(() => {
    const id = this.activeNodeId();
    if (!id) return [];
    
    return this._buildPath(id);
  });
  
  selectNode(nodeId: string | null): void {
    this.builderState.selectNode(nodeId);
  }
  
  private _buildPath(nodeId: string): ComponentSchema[] {
    const path: ComponentSchema[] = [];
    let currentId: string | null = nodeId;
    
    while (currentId) {
      const node = this.schemaService.getNode(currentId);
      if (!node) break;
      
      path.unshift(node);
      currentId = this._findParentId(this.schemaService.schema().components, currentId);
    }
    
    return path;
  }
  
  private _findParentId(components: ComponentSchema[], nodeId: string): string | null {
    for (const c of components) {
      if ('components' in c) {
        const children = c.components as ComponentSchema[];
        if (children.some(child => child.id === nodeId)) {
          return c.id;
        }
        
        const found = this._findParentId(children, nodeId);
        if (found) return found;
      }
    }
    return null;
  }
}
```

**Acceptance Criteria:**
- ✅ Breadcrumb shows path from Form → Panel → Field
- ✅ Clicking breadcrumb item selects that node
- ✅ Active item highlighted
- ✅ Works with 3+ levels of nesting

**Estimated Effort:** 1 day

---

### Phase 4 Summary

**Total Duration:** Week 7-8 (10 days)

**Deliverables:**
- ✅ Layout schema types (Panel, Columns, Tabs, Fieldset, Repeater)
- ✅ 5 layout descriptors
- ✅ Canvas container component with per-column/tab drop zones
- ✅ Breadcrumb navigation for nested components
- ✅ Recursive nesting works 3+ levels deep
- ✅ Column assignments tracked correctly
- ✅ Tab assignments tracked correctly

**Validation:**
```bash
# Open Storybook
npx nx run form-builder:storybook

# 1. Drag "Panel" to canvas
# 2. Drag "Text Input" into panel → nests correctly
# 3. Drag "Columns" into panel
# 4. Drag "Text Input" into left column → assignment updated
# 5. Drag "Text Input" into right column → assignment updated
# 6. Drag "Tabs" to canvas
# 7. Switch tabs, drag fields into each tab
# 8. Select nested field → breadcrumb shows Form › Panel › Columns › Text Input
# 9. Click Panel in breadcrumb → selects panel
# 10. Inspect schema:
console.log(formBuilder.schemaService.schema());
// {
//   components: [
//     {
//       type: 'panel',
//       components: [
//         {
//           type: 'columns',
//           columns: 2,
//           columnAssignments: { 'node1': 0, 'node2': 1 },
//           components: [...]
//         }
//       ]
//     }
//   ]
// }
```

---

## Part 2 Completion Checklist

**Phase 3:**
- [ ] History service with undo/redo
- [ ] Debounced history snapshots (500ms)
- [ ] Toolbar undo/redo buttons
- [ ] Properties panel shell
- [ ] Form settings panel
- [ ] Settings tabs renderer
- [ ] Settings fields (text, textarea, select, checkbox, number)
- [ ] Key field uniqueness validation
- [ ] JSON view modal
- [ ] Duplicate component action
- [ ] Delete component action

**Phase 4:**
- [ ] Layout schema types (Panel, Columns, Tabs, Fieldset, Repeater)
- [ ] 5 layout descriptors
- [ ] Canvas container component
- [ ] Drop zones per column (Columns layout)
- [ ] Drop zones per tab (Tabs layout)
- [ ] Column assignments tracked
- [ ] Tab assignments tracked
- [ ] Breadcrumb navigation
- [ ] Recursive nesting 3+ levels

**Integration Test (Phase 3):**
- [ ] Edit label → canvas updates → undo restores → redo re-applies
- [ ] Duplicate → clone with suffixed key
- [ ] Delete → schema updates, history recorded
- [ ] Click empty canvas → form settings panel
- [ ] Edit validateOn → applies to all fields (TD-07)
- [ ] JSON view → export → import → schema restored

**Integration Test (Phase 4):**
- [ ] Drag Panel to canvas
- [ ] Drag Text Input into Panel (1 level nesting)
- [ ] Drag Columns into Panel (2 levels nesting)
- [ ] Drag Text Input into column (3 levels nesting)
- [ ] Column assignments correct in schema
- [ ] Drag Tabs, switch tabs, drag fields into each
- [ ] Tab assignments correct in schema
- [ ] Breadcrumb shows correct path
- [ ] Cannot drop Panel into itself (cycle prevention)

---

## Next Steps

**Part 3: Validation & Accessibility** (Weeks 9-12)
- Phase 5: Validation & Conditionals (rule editor, JSON Logic, preview)
- Phase 6: `<vi-drawer>` & Accessibility (keyboard DnD, ARIA, WCAG 2.1 AA)

See [development-plan-part-3-validation-accessibility.md](development-plan-part-3-validation-accessibility.md) ✅

**Part 4: Release Preparation & Platform Phases** (Weeks 13-20+)
- Phase 7: Polish & Release (tests, Storybook, v1.0.0)
- Platform Phase 3: Compliance (audit trail, query management, e-signature)
- Platform Phase 4: Persistence & Versioning (offline mode, draft save, schema migration)

See [development-plan-part-4-release-compliance.md](development-plan-part-4-release-compliance.md) *(to be created)*

---

**END OF PART 2**
