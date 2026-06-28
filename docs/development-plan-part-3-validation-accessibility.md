# EDC Platform Development Plan — Part 3: Validation & Accessibility

**Date:** May 31, 2026  
**Version:** 1.0  
**Status:** 📋 Planning Phase  
**Coverage:** Phase 5 → Phase 6 (Weeks 9-12)
  
**Prerequisites:** [Part 1](development-plan-part-1-foundation.md) and [Part 2](development-plan-part-2-properties-layout.md) must be complete

---

## 🎯 Part 3 Overview

This plan covers **validation UI**, **conditional visibility**, and **accessibility features**:

- ✅ **Phase 5** — Validation & Conditionals (Week 9-10)
- ✅ **Phase 6** — `<vi-drawer>` & Accessibility (Week 11-12)

**Goal:** By end of Part 3, users can:
- Add/edit/remove validation rules via UI
- Configure conditional visibility rules
- Preview forms with live validation
- Use keyboard navigation for all drag-and-drop
- Access builder via screen readers (WCAG 2.1 AA compliant)
- Open properties panel in slide-in drawer on narrow viewports

---

## 📚 Document Reference Map

| Document | Lines | Key Sections for Part 3 |
|----------|-------|------------------------|
| [form-builder-roadmap.md](form-builder-roadmap.md) | 539 | §3.5 Phase 5 (L279-L297), §3.6 Phase 6 (L298-L312) |
| [form-builder-validation.md](form-builder-validation.md) | 3,031 | §4 Built-in Validators (L200-L500), §7 Execution Engine (L900-L1200), §20 Renderer Integration (L2500-L2800) |
| [form-builder-custom-validators.md](form-builder-custom-validators.md) | 2,847 | §3 Quick Start (L80-L150), §5 Pure Function Validators (L200-L350) |
| [form-builder-schema.md](form-builder-schema.md) | 1,613 | §3.4 ValidationRule (L350-L450), §3.5 ConditionalRule (L451-L550) |

---

## Phase 5 — Validation & Conditionals (Week 9-10)

**Goal:** Validation rules configurable in properties panel; conditional visibility works in preview

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L279-L297)

**Architecture Note:** Validation uses `ValidationEngine` (Angular `@Injectable()`) with `json-logic-js` rule evaluation and `FieldStateService` Signal-based state. Custom validators registered via `provideValidation()`. See [form-builder-validation.md §20](form-builder-validation.md#L2500-L2800) for full spec.

### 📋 Task List

#### Task 5.1: Validation Rules Editor Component

**Location:** `libs/form-builder/src/lib/properties/validation-rules-editor.component.ts`

**Reference:** [form-builder-validation.md](form-builder-validation.md#L200-L500)

**Requirements:**
- Shows list of all rules attached to selected field
- Add/edit/remove rules via UI
- Each rule has: type (built-in/json-logic), parameters, custom message
- Supports 11 built-in validators + custom rules
- Live validation in preview mode

**Implementation:**

```typescript
// properties/validation-rules-editor.component.ts
import { Component, input, output, signal, computed } from '@angular/core';
import { BuilderRegistryService } from '../registry/builder-registry.service';
import { RuleRowComponent } from './rule-row.component';
import { RuleEditorModalComponent } from './rule-editor-modal.component';
import type { ComponentSchema, ValidationRule } from '../types';

@Component({
  selector: 'vi-validation-rules-editor',
  standalone: true,
  imports: [RuleRowComponent, RuleEditorModalComponent],
  template: `
    <div class="validation-rules-editor">
      <div class="editor-header">
        <h4>Validation Rules</h4>
        <button 
          class="btn-add"
          (click)="openAddRuleModal()">
          + Add Rule
        </button>
      </div>
      
      @if (rules().length === 0) {
        <div class="empty-state">
          <p>No validation rules configured</p>
          <p class="hint">Add rules to validate field input</p>
        </div>
      } @else {
        <div class="rules-list">
          @for (rule of rules(); track rule.ruleId; let i = $index) {
            <vi-rule-row 
              [rule]="rule"
              [index]="i"
              (edit)="editRule(i)"
              (delete)="deleteRule(i)"
              (moveUp)="moveRuleUp(i)"
              (moveDown)="moveRuleDown(i)" />
          }
        </div>
      }
      
      <div class="editor-footer">
        <p class="info-text">
          Rules evaluated in order. First failure shows error.
        </p>
      </div>
      
      <!-- Modal for adding/editing rules -->
      @if (showRuleModal()) {
        <vi-rule-editor-modal
          [rule]="editingRule()"
          [ruleIndex]="editingRuleIndex()"
          [fieldSchema]="schema()"
          (save)="saveRule($event)"
          (cancel)="closeRuleModal()" />
      }
    </div>
  `,
  styles: [`
    .validation-rules-editor {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--vi-border-color);
    }
    
    .rules-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--vi-text-secondary);
    }
    
    .info-text {
      font-size: 0.875rem;
      color: var(--vi-text-secondary);
      margin: 0;
    }
  `]
})
export class ValidationRulesEditorComponent {
  schema = input.required<ComponentSchema>();
  rulesChange = output<ValidationRule[]>();
  
  private readonly registry = inject(BuilderRegistryService);
  
  rules = computed(() => {
    const s = this.schema();
    return 'validationRules' in s ? (s.validationRules || []) : [];
  });
  
  showRuleModal = signal(false);
  editingRule = signal<ValidationRule | null>(null);
  editingRuleIndex = signal<number | null>(null);
  
  openAddRuleModal(): void {
    this.editingRule.set(null);
    this.editingRuleIndex.set(null);
    this.showRuleModal.set(true);
  }
  
  editRule(index: number): void {
    this.editingRule.set(this.rules()[index]);
    this.editingRuleIndex.set(index);
    this.showRuleModal.set(true);
  }
  
  deleteRule(index: number): void {
    if (!confirm('Delete this validation rule?')) return;
    
    const updated = [...this.rules()];
    updated.splice(index, 1);
    this.rulesChange.emit(updated);
  }
  
  moveRuleUp(index: number): void {
    if (index === 0) return;
    
    const updated = [...this.rules()];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    this.rulesChange.emit(updated);
  }
  
  moveRuleDown(index: number): void {
    if (index === this.rules().length - 1) return;
    
    const updated = [...this.rules()];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    this.rulesChange.emit(updated);
  }
  
  saveRule(rule: ValidationRule): void {
    const updated = [...this.rules()];
    const idx = this.editingRuleIndex();
    
    if (idx === null) {
      // Add new rule
      updated.push(rule);
    } else {
      // Update existing rule
      updated[idx] = rule;
    }
    
    this.rulesChange.emit(updated);
    this.closeRuleModal();
  }
  
  closeRuleModal(): void {
    this.showRuleModal.set(false);
    this.editingRule.set(null);
    this.editingRuleIndex.set(null);
  }
}
```

**Rule Row Component:**

```typescript
// properties/rule-row.component.ts
import { Component, input, output } from '@angular/core';
import type { ValidationRule } from '../types';

@Component({
  selector: 'vi-rule-row',
  standalone: true,
  template: `
    <div class="rule-row">
      <div class="rule-content">
        <div class="rule-header">
          <span class="rule-type-badge" [class]="rule().type">
            {{ rule().type }}
          </span>
          <span class="rule-id">{{ rule().ruleId }}</span>
        </div>
        
        @if (rule().message) {
          <div class="rule-message">
            "{{ rule().message }}"
          </div>
        }
        
        @if (hasParams()) {
          <div class="rule-params">
            {{ formatParams() }}
          </div>
        }
      </div>
      
      <div class="rule-actions">
        <button 
          class="btn-icon"
          [disabled]="index() === 0"
          (click)="moveUp.emit()"
          title="Move Up">
          ▲
        </button>
        
        <button 
          class="btn-icon"
          (click)="moveDown.emit()"
          title="Move Down">
          ▼
        </button>
        
        <button 
          class="btn-icon"
          (click)="edit.emit()"
          title="Edit">
          ✎
        </button>
        
        <button 
          class="btn-icon danger"
          (click)="delete.emit()"
          title="Delete">
          ×
        </button>
      </div>
    </div>
  `,
  styles: [`
    .rule-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      border: 1px solid var(--vi-border-color);
      border-radius: 4px;
      background: var(--vi-background-secondary);
    }
    
    .rule-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .rule-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .rule-type-badge {
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 12px;
      font-weight: 600;
    }
    
    .rule-type-badge.built-in {
      background: var(--vi-success-light);
      color: var(--vi-success-dark);
    }
    
    .rule-type-badge.json-logic {
      background: var(--vi-info-light);
      color: var(--vi-info-dark);
    }
    
    .rule-id {
      font-weight: 500;
    }
    
    .rule-message {
      font-size: 0.875rem;
      color: var(--vi-text-secondary);
      font-style: italic;
    }
    
    .rule-params {
      font-size: 0.875rem;
      color: var(--vi-text-secondary);
      font-family: 'Courier New', monospace;
    }
    
    .rule-actions {
      display: flex;
      gap: 0.25rem;
    }
    
    .btn-icon {
      padding: 0.25rem 0.5rem;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 4px;
    }
    
    .btn-icon:hover {
      background: var(--vi-hover-background);
    }
    
    .btn-icon:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    
    .btn-icon.danger:hover {
      background: var(--vi-error-light);
      color: var(--vi-error-dark);
    }
  `]
})
export class RuleRowComponent {
  rule = input.required<ValidationRule>();
  index = input.required<number>();
  
  edit = output<void>();
  delete = output<void>();
  moveUp = output<void>();
  moveDown = output<void>();
  
  hasParams = computed(() => {
    const r = this.rule();
    return r.type === 'built-in' && r.params && Object.keys(r.params).length > 0;
  });
  
  formatParams = computed(() => {
    const r = this.rule();
    if (r.type !== 'built-in' || !r.params) return '';
    
    return Object.entries(r.params)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ');
  });
}
```

**Rule Editor Modal:**

```typescript
// properties/rule-editor-modal.component.ts
import { Component, input, output, signal, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import type { ValidationRule, ComponentSchema } from '../types';

// Built-in validator catalog
const BUILT_IN_VALIDATORS = [
  { id: 'required', label: 'Required', description: 'Field must have a value' },
  { id: 'minLength', label: 'Min Length', description: 'Minimum character count', params: ['min'] },
  { id: 'maxLength', label: 'Max Length', description: 'Maximum character count', params: ['max'] },
  { id: 'pattern', label: 'Pattern (Regex)', description: 'Must match regular expression', params: ['pattern'] },
  { id: 'range', label: 'Numeric Range', description: 'Value must be between min and max', params: ['min', 'max'] },
  { id: 'dateRange', label: 'Date Range', description: 'Date must be between start and end', params: ['start', 'end'] },
  { id: 'email', label: 'Email', description: 'Must be valid email address' },
  { id: 'url', label: 'URL', description: 'Must be valid URL' },
  { id: 'precision', label: 'Decimal Precision', description: 'Maximum decimal places', params: ['maxDecimals'] },
  { id: 'allowedValues', label: 'Allowed Values', description: 'Value must be in list', params: ['values'] },
  { id: 'wordCount', label: 'Word Count', description: 'Word count limits', params: ['min', 'max'] }
] as const;

@Component({
  selector: 'vi-rule-editor-modal',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="modal-backdrop" (click)="cancel.emit()"></div>
    
    <div class="modal-dialog">
      <div class="modal-header">
        <h3>{{ isEditing() ? 'Edit' : 'Add' }} Validation Rule</h3>
        <button class="btn-close" (click)="cancel.emit()">×</button>
      </div>
      
      <div class="modal-body">
        <!-- Rule Type -->
        <div class="form-field">
          <label>Rule Type</label>
          <vi-select 
            [value]="ruleType()"
            (vi-select-change)="onRuleTypeChange($event.detail.value)">
            <option value="built-in">Built-in Validator</option>
            <option value="json-logic">JSON Logic (Advanced)</option>
          </vi-select>
        </div>
        
        <!-- Built-in Validator Selection -->
        @if (ruleType() === 'built-in') {
          <div class="form-field">
            <label>Validator</label>
            <vi-select 
              [value]="selectedValidator()"
              (vi-select-change)="onValidatorChange($event.detail.value)">
              <option value="">-- Select validator --</option>
              @for (v of builtInValidators; track v.id) {
                <option [value]="v.id">{{ v.label }}</option>
              }
            </vi-select>
            
            @if (selectedValidatorInfo()) {
              <p class="help-text">{{ selectedValidatorInfo()!.description }}</p>
            }
          </div>
          
          <!-- Dynamic Parameters -->
          @if (validatorParams().length > 0) {
            <div class="params-section">
              <h4>Parameters</h4>
              
              @for (param of validatorParams(); track param) {
                <div class="form-field">
                  <label>{{ formatParamLabel(param) }}</label>
                  <vi-input 
                    [value]="getParamValue(param)"
                    [type]="getParamInputType(param)"
                    [placeholder]="getParamPlaceholder(param)"
                    (vi-input-change)="setParamValue(param, $event.detail.value)" />
                </div>
              }
            </div>
          }
        }
        
        <!-- JSON Logic (Advanced) -->
        @if (ruleType() === 'json-logic') {
          <div class="form-field">
            <label>JSON Logic Expression</label>
            <vi-textarea 
              [value]="jsonLogicExpression()"
              [rows]="10"
              placeholder='{ "and": [{ "var": "age" }, { ">=": [{ "var": "age" }, 18] }] }'
              (vi-textarea-change)="onJsonLogicChange($event.detail.value)" />
            
            @if (jsonLogicError()) {
              <p class="error-text">{{ jsonLogicError() }}</p>
            }
            
            <p class="help-text">
              See <a href="https://jsonlogic.com/" target="_blank">jsonlogic.com</a> for syntax reference
            </p>
          </div>
        }
        
        <!-- Custom Error Message -->
        <div class="form-field">
          <label>Custom Error Message (Optional)</label>
          <vi-textarea 
            [value]="customMessage()"
            [rows]="2"
            placeholder="Enter custom error message"
            (vi-textarea-change)="onMessageChange($event.detail.value)" />
          <p class="help-text">Leave empty to use default message</p>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-secondary" (click)="cancel.emit()">Cancel</button>
        <button 
          class="btn-primary" 
          [disabled]="!canSave()"
          (click)="onSave()">
          {{ isEditing() ? 'Update' : 'Add' }} Rule
        </button>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
    }
    
    .modal-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      z-index: 1001;
      display: flex;
      flex-direction: column;
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--vi-border-color);
    }
    
    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--vi-border-color);
    }
    
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .params-section {
      padding: 1rem;
      background: var(--vi-background-secondary);
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .help-text {
      font-size: 0.875rem;
      color: var(--vi-text-secondary);
      margin: 0;
    }
    
    .error-text {
      font-size: 0.875rem;
      color: var(--vi-error-color);
      margin: 0;
    }
  `]
})
export class RuleEditorModalComponent {
  rule = input<ValidationRule | null>(null);
  ruleIndex = input<number | null>(null);
  fieldSchema = input.required<ComponentSchema>();
  
  save = output<ValidationRule>();
  cancel = output<void>();
  
  builtInValidators = BUILT_IN_VALIDATORS;
  
  isEditing = computed(() => this.rule() !== null);
  
  ruleType = signal<'built-in' | 'json-logic'>('built-in');
  selectedValidator = signal<string>('');
  params = signal<Record<string, unknown>>({});
  customMessage = signal<string>('');
  jsonLogicExpression = signal<string>('');
  jsonLogicError = signal<string | null>(null);
  
  constructor() {
    // Initialize from existing rule if editing
    const r = this.rule();
    if (r) {
      this.ruleType.set(r.type);
      
      if (r.type === 'built-in') {
        this.selectedValidator.set(r.ruleId);
        this.params.set(r.params || {});
      } else if (r.type === 'json-logic') {
        this.jsonLogicExpression.set(JSON.stringify(r.logic, null, 2));
      }
      
      this.customMessage.set(r.message || '');
    }
  }
  
  selectedValidatorInfo = computed(() => {
    const id = this.selectedValidator();
    return this.builtInValidators.find(v => v.id === id);
  });
  
  validatorParams = computed(() => {
    return this.selectedValidatorInfo()?.params || [];
  });
  
  canSave = computed(() => {
    if (this.ruleType() === 'built-in') {
      return this.selectedValidator() !== '';
    } else {
      const expr = this.jsonLogicExpression();
      return expr.trim() !== '' && !this.jsonLogicError();
    }
  });
  
  onRuleTypeChange(type: string): void {
    this.ruleType.set(type as 'built-in' | 'json-logic');
  }
  
  onValidatorChange(validatorId: string): void {
    this.selectedValidator.set(validatorId);
    this.params.set({}); // Reset params when changing validator
  }
  
  getParamValue(param: string): string {
    return String(this.params()[param] || '');
  }
  
  setParamValue(param: string, value: string): void {
    this.params.update(p => ({ ...p, [param]: value }));
  }
  
  getParamInputType(param: string): string {
    if (param === 'min' || param === 'max' || param === 'maxDecimals') {
      return 'number';
    }
    return 'text';
  }
  
  getParamPlaceholder(param: string): string {
    const placeholders: Record<string, string> = {
      min: 'Minimum value',
      max: 'Maximum value',
      pattern: '^[A-Z]{3}\\d{4}$',
      start: '2024-01-01',
      end: '2024-12-31',
      maxDecimals: '2',
      values: 'value1,value2,value3'
    };
    return placeholders[param] || '';
  }
  
  formatParamLabel(param: string): string {
    return param.charAt(0).toUpperCase() + param.slice(1).replace(/([A-Z])/g, ' $1');
  }
  
  onJsonLogicChange(value: string): void {
    this.jsonLogicExpression.set(value);
    
    // Validate JSON
    try {
      JSON.parse(value);
      this.jsonLogicError.set(null);
    } catch (err) {
      this.jsonLogicError.set((err as Error).message);
    }
  }
  
  onMessageChange(value: string): void {
    this.customMessage.set(value);
  }
  
  onSave(): void {
    let rule: ValidationRule;
    
    if (this.ruleType() === 'built-in') {
      rule = {
        ruleId: this.selectedValidator(),
        type: 'built-in',
        params: this.params(),
        message: this.customMessage() || undefined
      };
    } else {
      rule = {
        ruleId: `json_logic_${Date.now()}`,
        type: 'json-logic',
        logic: JSON.parse(this.jsonLogicExpression()),
        message: this.customMessage() || undefined
      };
    }
    
    this.save.emit(rule);
  }
}
```

**Acceptance Criteria:**
- ✅ Validation rules editor shows list of current rules
- ✅ Add button opens modal with validator selection
- ✅ Built-in validators show parameter fields dynamically
- ✅ JSON Logic mode shows textarea with validation
- ✅ Rules can be reordered (move up/down)
- ✅ Rules can be edited and deleted
- ✅ Custom error messages supported
- ✅ Changes saved to schema via properties panel

**Estimated Effort:** 4-5 days

---

#### Task 5.2: Conditional Editor Component

**Location:** `libs/form-builder/src/lib/properties/conditional-editor.component.ts`

**Reference:** [form-builder-schema.md](form-builder-schema.md#L451-L550)

**Requirements:**
- Configure when a field should be visible/hidden
- Two modes: Simple conditional (when field X = Y) and JSON Logic
- Live preview shows/hides fields based on other field values

**Implementation:**

```typescript
// properties/conditional-editor.component.ts
import { Component, input, output, signal, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormSchemaService } from '../services/form-schema.service';
import type { ComponentSchema, ConditionalRule } from '../types';

@Component({
  selector: 'vi-conditional-editor',
  standalone: true,
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="conditional-editor">
      <div class="editor-header">
        <h4>Conditional Visibility</h4>
        <vi-checkbox 
          [checked]="hasConditional()"
          (vi-checkbox-change)="toggleConditional($event.detail.checked)">
          Enable conditional visibility
        </vi-checkbox>
      </div>
      
      @if (hasConditional()) {
        <div class="conditional-content">
          <!-- Mode Selection -->
          <div class="form-field">
            <label>Condition Type</label>
            <vi-select 
              [value]="conditionalType()"
              (vi-select-change)="onTypeChange($event.detail.value)">
              <option value="simple">Simple (when field equals value)</option>
              <option value="json-logic">Advanced (JSON Logic)</option>
            </vi-select>
          </div>
          
          <!-- Simple Conditional -->
          @if (conditionalType() === 'simple') {
            <div class="simple-conditional">
              <div class="form-field">
                <label>When field</label>
                <vi-select 
                  [value]="simpleWhen()"
                  (vi-select-change)="onSimpleWhenChange($event.detail.value)">
                  <option value="">-- Select field --</option>
                  @for (field of availableFields(); track field.key) {
                    <option [value]="field.key">{{ field.label }} ({{ field.key }})</option>
                  }
                </vi-select>
              </div>
              
              <div class="form-field">
                <label>Equals</label>
                <vi-input 
                  [value]="simpleIs()"
                  placeholder="Enter value"
                  (vi-input-change)="onSimpleIsChange($event.detail.value)" />
                <p class="help-text">Field will be visible when this condition is true</p>
              </div>
            </div>
          }
          
          <!-- JSON Logic Conditional -->
          @if (conditionalType() === 'json-logic') {
            <div class="form-field">
              <label>JSON Logic Expression</label>
              <vi-textarea 
                [value]="jsonLogicExpression()"
                [rows]="8"
                placeholder='{ "==": [{ "var": "fieldKey" }, "expectedValue"] }'
                (vi-textarea-change)="onJsonLogicChange($event.detail.value)" />
              
              @if (jsonLogicError()) {
                <p class="error-text">{{ jsonLogicError() }}</p>
              }
              
              <p class="help-text">
                Field visible when expression returns true. 
                <a href="https://jsonlogic.com/" target="_blank">JSON Logic docs</a>
              </p>
            </div>
          }
          
          <!-- Preview Hint -->
          <div class="preview-hint">
            <p>💡 <strong>Tip:</strong> Toggle preview mode to test conditional visibility</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .conditional-editor {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--vi-border-color);
    }
    
    .conditional-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      background: var(--vi-background-secondary);
      border-radius: 4px;
    }
    
    .simple-conditional {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .preview-hint {
      padding: 0.75rem;
      background: var(--vi-info-light);
      border-left: 3px solid var(--vi-info-color);
      border-radius: 4px;
    }
    
    .preview-hint p {
      margin: 0;
      font-size: 0.875rem;
    }
    
    .help-text {
      font-size: 0.875rem;
      color: var(--vi-text-secondary);
      margin: 0;
    }
    
    .error-text {
      font-size: 0.875rem;
      color: var(--vi-error-color);
      margin: 0;
    }
  `]
})
export class ConditionalEditorComponent {
  schema = input.required<ComponentSchema>();
  conditionalChange = output<ConditionalRule | undefined>();
  
  private readonly schemaService = inject(FormSchemaService);
  
  conditional = computed(() => {
    const s = this.schema();
    return 'conditional' in s ? s.conditional : undefined;
  });
  
  hasConditional = computed(() => this.conditional() !== undefined);
  
  conditionalType = signal<'simple' | 'json-logic'>('simple');
  simpleWhen = signal<string>('');
  simpleIs = signal<string>('');
  jsonLogicExpression = signal<string>('');
  jsonLogicError = signal<string | null>(null);
  
  availableFields = computed(() => {
    const currentSchema = this.schemaService.schema();
    return this.getAllFields(currentSchema.components)
      .filter(f => f.key !== this.schema().key); // Exclude self
  });
  
  constructor() {
    // Initialize from existing conditional if present
    const cond = this.conditional();
    if (cond) {
      if (cond.type === 'simple') {
        this.conditionalType.set('simple');
        this.simpleWhen.set(cond.when);
        this.simpleIs.set(String(cond.is));
      } else if (cond.type === 'json-logic') {
        this.conditionalType.set('json-logic');
        this.jsonLogicExpression.set(JSON.stringify(cond.logic, null, 2));
      }
    }
  }
  
  toggleConditional(enabled: boolean): void {
    if (enabled) {
      // Create default simple conditional
      const conditional: ConditionalRule = {
        type: 'simple',
        when: '',
        is: ''
      };
      this.conditionalChange.emit(conditional);
    } else {
      this.conditionalChange.emit(undefined);
    }
  }
  
  onTypeChange(type: string): void {
    this.conditionalType.set(type as 'simple' | 'json-logic');
    
    // Emit appropriate conditional based on type
    if (type === 'simple') {
      this.conditionalChange.emit({
        type: 'simple',
        when: this.simpleWhen(),
        is: this.simpleIs()
      });
    } else {
      try {
        const logic = this.jsonLogicExpression() 
          ? JSON.parse(this.jsonLogicExpression())
          : {};
        this.conditionalChange.emit({
          type: 'json-logic',
          logic
        });
      } catch {
        // Keep existing or emit empty
      }
    }
  }
  
  onSimpleWhenChange(fieldKey: string): void {
    this.simpleWhen.set(fieldKey);
    this.emitSimpleConditional();
  }
  
  onSimpleIsChange(value: string): void {
    this.simpleIs.set(value);
    this.emitSimpleConditional();
  }
  
  onJsonLogicChange(value: string): void {
    this.jsonLogicExpression.set(value);
    
    // Validate and emit
    try {
      const logic = JSON.parse(value);
      this.jsonLogicError.set(null);
      this.conditionalChange.emit({
        type: 'json-logic',
        logic
      });
    } catch (err) {
      this.jsonLogicError.set((err as Error).message);
    }
  }
  
  private emitSimpleConditional(): void {
    this.conditionalChange.emit({
      type: 'simple',
      when: this.simpleWhen(),
      is: this.simpleIs()
    });
  }
  
  private getAllFields(components: ComponentSchema[]): ComponentSchema[] {
    const fields: ComponentSchema[] = [];
    
    for (const c of components) {
      // Add if it has a key (is a field)
      if (c.key) {
        fields.push(c);
      }
      
      // Recurse into containers
      if ('components' in c && Array.isArray((c as any).components)) {
        fields.push(...this.getAllFields((c as any).components));
      }
    }
    
    return fields;
  }
}
```

**Acceptance Criteria:**
- ✅ Conditional editor shows checkbox to enable/disable
- ✅ Simple mode: select field and enter expected value
- ✅ Advanced mode: JSON Logic textarea with validation
- ✅ Field list shows all available fields except self
- ✅ Changes saved to schema immediately
- ✅ Preview mode respects conditional visibility

**Estimated Effort:** 3 days

---

#### Task 5.3: Preview Mode with Live Validation

**Location:** Update `BuilderStateService` + create preview renderer

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L288-L294)

**Requirements:**
- Toggle preview mode in toolbar
- Preview shows actual form with web components
- Validation runs on blur/change based on `validateOn`
- Conditional visibility evaluates in real-time
- Can switch back to edit mode

**Implementation:**

```typescript
// Update BuilderStateService
export class BuilderStateService {
  // ... existing code ...
  
  /** Preview mode (vs edit mode) */
  readonly previewMode = signal(false);
  
  /** Toggle preview mode */
  togglePreview(): void {
    this.previewMode.update(preview => !preview);
    
    // Deselect when entering preview
    if (this.previewMode()) {
      this.deselectNode();
    }
  }
}
```

```typescript
// builder/form-preview.component.ts
import { Component, inject, computed } from '@angular/core';
import { FormSchemaService } from '../services/form-schema.service';
import { ValidationEngine } from '../validation/validation-engine.service';
import { ConditionalEvaluator } from '../validation/conditional-evaluator.service';
import type { FormSchema } from '../types';

@Component({
  selector: 'vi-form-preview',
  standalone: true,
  template: `
    <div class="form-preview">
      <div class="preview-header">
        <h3>{{ schema().title || 'Untitled Form' }}</h3>
        @if (schema().description) {
          <p class="form-description">{{ schema().description }}</p>
        }
      </div>
      
      <form class="preview-form" (submit)="onSubmit($event)">
        <!-- Render all components recursively -->
        @for (component of visibleComponents(); track component.id) {
          <vi-preview-field [schema]="component" />
        }
        
        <div class="form-actions">
          <button type="submit" class="btn-primary">
            {{ schema().settings.submitButton?.label || 'Submit' }}
          </button>
        </div>
      </form>
      
      <!-- Validation Summary -->
      @if (validationErrors().length > 0) {
        <div class="validation-summary">
          <h4>Validation Errors</h4>
          <ul>
            @for (error of validationErrors(); track error.fieldKey) {
              <li>{{ error.fieldLabel }}: {{ error.message }}</li>
            }
          </ul>
        </div>
      }
    </div>
  `,
  styles: [`
    .form-preview {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .preview-header {
      margin-bottom: 2rem;
    }
    
    .form-description {
      color: var(--vi-text-secondary);
    }
    
    .preview-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .form-actions {
      margin-top: 1rem;
    }
    
    .validation-summary {
      margin-top: 2rem;
      padding: 1rem;
      background: var(--vi-error-light);
      border-left: 3px solid var(--vi-error-color);
      border-radius: 4px;
    }
  `]
})
export class FormPreviewComponent {
  private readonly schemaService = inject(FormSchemaService);
  private readonly validationEngine = inject(ValidationEngine);
  private readonly conditionalEvaluator = inject(ConditionalEvaluator);
  
  schema = this.schemaService.schema;
  
  formData = signal<Record<string, unknown>>({});
  validationErrors = signal<Array<{ fieldKey: string; fieldLabel: string; message: string }>>([]);
  
  visibleComponents = computed(() => {
    return this.filterVisibleComponents(this.schema().components, this.formData());
  });
  
  onSubmit(event: Event): void {
    event.preventDefault();
    
    // Run full validation
    const errors = this.validateForm();
    this.validationErrors.set(errors);
    
    if (errors.length === 0) {
      console.log('Form submitted:', this.formData());
      alert('Form submitted successfully! (Preview mode)');
    }
  }
  
  private filterVisibleComponents(
    components: ComponentSchema[],
    data: Record<string, unknown>
  ): ComponentSchema[] {
    return components.filter(c => {
      if (!('conditional' in c) || !c.conditional) return true;
      
      return this.conditionalEvaluator.evaluate(c.conditional, data);
    });
  }
  
  private validateForm(): Array<{ fieldKey: string; fieldLabel: string; message: string }> {
    const errors: Array<{ fieldKey: string; fieldLabel: string; message: string }> = [];
    const allFields = this.getAllFields(this.schema().components);
    
    for (const field of allFields) {
      if (!('validationRules' in field) || !field.validationRules) continue;
      
      const value = this.formData()[field.key];
      const results = this.validationEngine.validate(
        field.validationRules,
        value,
        this.formData()
      );
      
      const failed = results.filter(r => !r.passed);
      if (failed.length > 0) {
        errors.push({
          fieldKey: field.key,
          fieldLabel: field.label,
          message: failed[0].message
        });
      }
    }
    
    return errors;
  }
  
  private getAllFields(components: ComponentSchema[]): ComponentSchema[] {
    const fields: ComponentSchema[] = [];
    
    for (const c of components) {
      if (c.key) fields.push(c);
      
      if ('components' in c && Array.isArray((c as any).components)) {
        fields.push(...this.getAllFields((c as any).components));
      }
    }
    
    return fields;
  }
}
```

**Conditional Evaluator Service:**

```typescript
// validation/conditional-evaluator.service.ts
import { Injectable } from '@angular/core';
import * as jsonLogic from 'json-logic-js';
import type { ConditionalRule } from '../types';

@Injectable({ providedIn: 'root' })
export class ConditionalEvaluator {
  /**
   * Evaluates a conditional rule against form data.
   * Returns true if the field should be visible.
   */
  evaluate(conditional: ConditionalRule, formData: Record<string, unknown>): boolean {
    if (conditional.type === 'simple') {
      const fieldValue = formData[conditional.when];
      return fieldValue === conditional.is;
    }
    
    if (conditional.type === 'json-logic') {
      try {
        const result = jsonLogic.apply(conditional.logic, formData);
        return Boolean(result);
      } catch (err) {
        console.error('Conditional evaluation error:', err);
        return true; // Show field on error (fail-open)
      }
    }
    
    return true;
  }
}
```

**Acceptance Criteria:**
- ✅ Preview mode toggle button in toolbar
- ✅ Preview shows actual form with web components
- ✅ Fields validate on blur/change (respects `validateOn`)
- ✅ Conditional visibility works (fields hide/show)
- ✅ Submit button triggers full form validation
- ✅ Validation errors shown in summary
- ✅ Can toggle back to edit mode

**Estimated Effort:** 4 days

---

### Phase 5 Summary

**Total Duration:** Week 9-10 (10 days)

**Deliverables:**
- ✅ Validation rules editor with add/edit/remove
- ✅ 11 built-in validators configurable
- ✅ JSON Logic advanced mode
- ✅ Rule reordering (priority)
- ✅ Conditional visibility editor (simple + JSON Logic)
- ✅ Preview mode with live validation
- ✅ Conditional evaluation in preview

**Validation:**
```bash
# Open Storybook
npx nx run form-builder:storybook

# 1. Select text input on canvas
# 2. Go to "Validation" tab in properties
# 3. Click "Add Rule" → select "Required"
# 4. Save → rule appears in list
# 5. Click "Add Rule" → select "Min Length" → set min=5
# 6. Toggle preview mode
# 7. Try to submit empty → "Required" error shows
# 8. Type "abc" → "Min length" error shows
# 9. Type "abcdef" → validation passes
# 10. Add conditional: show field when "gender" = "M"
# 11. In preview, change gender → field hides/shows
```

---

## Phase 6 — `<vi-drawer>` & Accessibility (Week 11-12)

**Goal:** Full keyboard accessibility, screen reader support, properties panel in slide-in drawer

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L298-L312)

### 📋 Task List

#### Task 6.1: `<vi-drawer>` Web Component

**Location:** `libs/web-components/src/drawer/vi-drawer.ts`

**Reference:** Based on web component patterns in `libs/web-components/`

**Requirements:**
- Lit 3.3.x web component with TC39 decorators
- Slide-in from right (default) or left
- Backdrop with click-to-close
- Header slot, content slot, footer slot
- Open/close animations with `prefers-reduced-motion` support
- Focus trap when open
- Escape key closes
- ARIA roles and labels

**Implementation:**

```typescript
// web-components/src/drawer/vi-drawer.ts
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

/**
 * A slide-in drawer panel component.
 * 
 * @slot header - Content for the drawer header
 * @slot - Default slot for drawer body content
 * @slot footer - Content for the drawer footer
 * 
 * @fires vi-drawer-open - Fired when drawer opens
 * @fires vi-drawer-close - Fired when drawer closes
 * 
 * @csspart backdrop - The backdrop overlay
 * @csspart drawer - The drawer panel
 * @csspart header - The header section
 * @csspart body - The body section
 * @csspart footer - The footer section
 */
@customElement('vi-drawer')
export class ViDrawer extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
    
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 1000;
      pointer-events: none;
    }
    
    .backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }
    
    @media (prefers-reduced-motion: reduce) {
      .backdrop {
        transition: none;
      }
    }
    
    .drawer {
      position: fixed;
      top: 0;
      bottom: 0;
      width: var(--vi-drawer-width, 400px);
      max-width: 90vw;
      background: var(--vi-background, white);
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
      transform: translateX(100%);
      transition: transform 0.3s ease;
      z-index: 1001;
      display: flex;
      flex-direction: column;
    }
    
    .drawer.position-right {
      right: 0;
    }
    
    .drawer.position-left {
      left: 0;
      transform: translateX(-100%);
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    }
    
    .drawer.open {
      transform: translateX(0);
    }
    
    @media (prefers-reduced-motion: reduce) {
      .drawer {
        transition: none;
      }
    }
    
    .header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--vi-border-color, #e0e0e0);
      flex-shrink: 0;
    }
    
    .body {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }
    
    .footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--vi-border-color, #e0e0e0);
      flex-shrink: 0;
    }
  `;
  
  @property({ type: Boolean, reflect: true })
  open = false;
  
  @property({ type: String })
  position: 'left' | 'right' = 'right';
  
  @property({ type: Boolean, attribute: 'no-backdrop' })
  noBackdrop = false;
  
  @property({ type: Boolean, attribute: 'no-close-on-backdrop' })
  noCloseOnBackdrop = false;
  
  @property({ type: Boolean, attribute: 'no-close-on-escape' })
  noCloseOnEscape = false;
  
  @state()
  private _previousFocus: HTMLElement | null = null;
  
  connectedCallback(): void {
    super.connectedCallback();
    
    if (!this.noCloseOnEscape) {
      document.addEventListener('keydown', this._handleEscape);
    }
  }
  
  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._handleEscape);
  }
  
  updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('open')) {
      if (this.open) {
        this._handleOpen();
      } else {
        this._handleClose();
      }
    }
  }
  
  private _handleOpen(): void {
    // Save currently focused element
    this._previousFocus = document.activeElement as HTMLElement;
    
    // Emit open event
    this.dispatchEvent(new CustomEvent('vi-drawer-open', {
      bubbles: true,
      composed: true
    }));
    
    // Set focus to drawer after animation
    setTimeout(() => {
      const drawer = this.shadowRoot?.querySelector('.drawer') as HTMLElement;
      drawer?.focus();
    }, 300);
  }
  
  private _handleClose(): void {
    // Restore focus
    this._previousFocus?.focus();
    this._previousFocus = null;
    
    // Emit close event
    this.dispatchEvent(new CustomEvent('vi-drawer-close', {
      bubbles: true,
      composed: true
    }));
  }
  
  private _handleEscape = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.open) {
      this.close();
    }
  };
  
  private _handleBackdropClick(): void {
    if (!this.noCloseOnBackdrop) {
      this.close();
    }
  }
  
  /**
   * Closes the drawer.
   */
  close(): void {
    this.open = false;
  }
  
  render() {
    return html`
      ${!this.noBackdrop ? html`
        <div 
          part="backdrop"
          class=${classMap({ backdrop: true, open: this.open })}
          @click=${this._handleBackdropClick}
          aria-hidden="true">
        </div>
      ` : ''}
      
      <div 
        part="drawer"
        class=${classMap({
          drawer: true,
          open: this.open,
          'position-left': this.position === 'left',
          'position-right': this.position === 'right'
        })}
        role="dialog"
        aria-modal="true"
        aria-hidden=${!this.open}
        tabindex="-1">
        
        <div part="header" class="header">
          <slot name="header"></slot>
        </div>
        
        <div part="body" class="body">
          <slot></slot>
        </div>
        
        <div part="footer" class="footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-drawer': ViDrawer;
  }
}
```

**WDIO Tests:**

```typescript
// web-components/test/vi-drawer.spec.ts
import { expect, browser } from '@wdio/globals';

describe('vi-drawer', () => {
  beforeEach(async () => {
    await browser.url('/test/drawer');
  });
  
  it('should open drawer when open attribute set', async () => {
    const drawer = await $('vi-drawer');
    const drawerPanel = await drawer.shadow$('.drawer');
    
    await drawer.setAttribute('open', '');
    await browser.pause(350); // Wait for animation
    
    expect(await drawerPanel.getAttribute('class')).toContain('open');
  });
  
  it('should close on backdrop click', async () => {
    const drawer = await $('vi-drawer');
    await drawer.setAttribute('open', '');
    await browser.pause(350);
    
    const backdrop = await drawer.shadow$('.backdrop');
    await backdrop.click();
    await browser.pause(350);
    
    expect(await drawer.getAttribute('open')).toBe(null);
  });
  
  it('should close on Escape key', async () => {
    const drawer = await $('vi-drawer');
    await drawer.setAttribute('open', '');
    await browser.pause(350);
    
    await browser.keys('Escape');
    await browser.pause(350);
    
    expect(await drawer.getAttribute('open')).toBe(null);
  });
  
  it('should not close on backdrop click when no-close-on-backdrop', async () => {
    const drawer = await $('vi-drawer');
    await drawer.setAttribute('open', '');
    await drawer.setAttribute('no-close-on-backdrop', '');
    await browser.pause(350);
    
    const backdrop = await drawer.shadow$('.backdrop');
    await backdrop.click();
    await browser.pause(100);
    
    expect(await drawer.getAttribute('open')).not.toBe(null);
  });
  
  it('should have proper ARIA attributes', async () => {
    const drawer = await $('vi-drawer');
    const drawerPanel = await drawer.shadow$('.drawer');
    
    expect(await drawerPanel.getAttribute('role')).toBe('dialog');
    expect(await drawerPanel.getAttribute('aria-modal')).toBe('true');
  });
});
```

**Acceptance Criteria:**
- ✅ Drawer slides in from right (default) or left
- ✅ Backdrop overlay with configurable opacity
- ✅ Closes on backdrop click (unless disabled)
- ✅ Closes on Escape key (unless disabled)
- ✅ Focus trapped inside drawer when open
- ✅ Previous focus restored on close
- ✅ Respects `prefers-reduced-motion`
- ✅ ARIA roles: `role="dialog"`, `aria-modal="true"`
- ✅ WDIO tests pass

**Estimated Effort:** 3 days

---

#### Task 6.2: Integrate Drawer with Properties Panel

**Location:** Update `PropertiesPanelComponent` to support drawer mode

**Requirements:**
- Detect viewport width
- Use drawer on narrow viewports (<768px)
- Use side panel on wide viewports
- Same content in both modes

**Implementation:**

```typescript
// Update properties-panel.component.ts
@Component({
  selector: 'vi-properties-panel',
  standalone: true,
  imports: [/* ... */],
  template: `
    @if (useDrawerMode()) {
      <!-- Drawer Mode -->
      <vi-drawer 
        [open]="isOpen()"
        position="right"
        (vi-drawer-close)="close()">
        
        <div slot="header">
          <h3>{{ title() }}</h3>
          <button (click)="close()">✕</button>
        </div>
        
        <vi-properties-content 
          [activeNode]="activeNode()"
          [settingsTabs]="settingsTabs()" />
      </vi-drawer>
    } @else {
      <!-- Side Panel Mode -->
      <div class="properties-panel" [class.open]="isOpen()">
        <div class="properties-header">
          <h3>{{ title() }}</h3>
          <button (click)="close()">✕</button>
        </div>
        
        <vi-properties-content 
          [activeNode]="activeNode()"
          [settingsTabs]="settingsTabs()" />
      </div>
    }
  `
})
export class PropertiesPanelComponent {
  // ... existing code ...
  
  useDrawerMode = signal(false);
  
  constructor() {
    // Detect viewport width
    this._updateDrawerMode();
    
    // Listen for resize
    fromEvent(window, 'resize')
      .pipe(debounceTime(250))
      .subscribe(() => this._updateDrawerMode());
  }
  
  private _updateDrawerMode(): void {
    this.useDrawerMode.set(window.innerWidth < 768);
  }
}
```

**Acceptance Criteria:**
- ✅ Properties panel uses drawer on narrow viewports
- ✅ Properties panel uses side column on wide viewports
- ✅ Mode switches dynamically on window resize
- ✅ Same functionality in both modes

**Estimated Effort:** 1 day

---

#### Task 6.3: Keyboard Drag-and-Drop Service

**Location:** `libs/form-builder/src/lib/services/keyboard-dnd.service.ts`

**Reference:** [form-builder-dnd.md](form-builder-dnd.md) (keyboard patterns)

**Requirements:**
- Space key activates DnD mode on focused drag handle
- Arrow keys move item up/down in list
- Space key drops item at new position
- Escape cancels DnD operation
- ARIA live announcements for screen readers

**Implementation:**

```typescript
// services/keyboard-dnd.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { FormSchemaService } from './form-schema.service';
import { HistoryService } from './history.service';
import { BuilderStateService } from './builder-state.service';

@Injectable({ providedIn: 'root' })
export class KeyboardDndService {
  private readonly schemaService = inject(FormSchemaService);
  private readonly historyService = inject(HistoryService);
  private readonly builderState = inject(BuilderStateService);
  
  // Active DnD state
  private readonly activeDragNodeId = signal<string | null>(null);
  private readonly activeDragParentId = signal<string | null>(null);
  private readonly activeDragIndex = signal<number>(0);
  private readonly targetIndex = signal<number>(0);
  
  /**
   * Registers keyboard DnD handlers on a drag handle.
   * Returns cleanup function.
   */
  registerDragHandle(
    element: HTMLElement,
    nodeId: string,
    parentId: string | null,
    index: number
  ): () => void {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Space = activate DnD mode
      if (event.key === ' ' && !this.activeDragNodeId()) {
        event.preventDefault();
        this._startDrag(nodeId, parentId, index);
        this._announce(`Dragging ${this._getNodeLabel(nodeId)}. Use arrow keys to move, Space to drop, Escape to cancel.`);
        return;
      }
      
      // Arrow keys = move in DnD mode
      if (this.activeDragNodeId() === nodeId) {
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          this._moveUp();
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          this._moveDown();
        } else if (event.key === ' ') {
          event.preventDefault();
          this._drop();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          this._cancel();
        }
      }
    };
    
    element.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }
  
  private _startDrag(nodeId: string, parentId: string | null, index: number): void {
    this.activeDragNodeId.set(nodeId);
    this.activeDragParentId.set(parentId);
    this.activeDragIndex.set(index);
    this.targetIndex.set(index);
    
    // Visual indication (add class to handle)
    document.getElementById(`drag-handle-${nodeId}`)?.classList.add('keyboard-dragging');
  }
  
  private _moveUp(): void {
    const current = this.targetIndex();
    if (current > 0) {
      this.targetIndex.set(current - 1);
      this._announce(`Moved up. Position ${current + 1} of ${this._getSiblingCount()}.`);
    } else {
      this._announce('Cannot move up. Already at top.');
    }
  }
  
  private _moveDown(): void {
    const current = this.targetIndex();
    const maxIndex = this._getSiblingCount() - 1;
    
    if (current < maxIndex) {
      this.targetIndex.set(current + 1);
      this._announce(`Moved down. Position ${current + 1} of ${this._getSiblingCount()}.`);
    } else {
      this._announce('Cannot move down. Already at bottom.');
    }
  }
  
  private _drop(): void {
    const nodeId = this.activeDragNodeId();
    const parentId = this.activeDragParentId();
    const fromIndex = this.activeDragIndex();
    const toIndex = this.targetIndex();
    
    if (!nodeId) return;
    
    // Apply move
    const updated = this.schemaService.moveComponent(nodeId, parentId, toIndex);
    this.schemaService.schema.set(updated);
    this.historyService.recordChange(updated);
    
    this._announce(`Dropped at position ${toIndex + 1}.`);
    this._cleanup();
  }
  
  private _cancel(): void {
    this._announce('Drag cancelled.');
    this._cleanup();
  }
  
  private _cleanup(): void {
    const nodeId = this.activeDragNodeId();
    if (nodeId) {
      document.getElementById(`drag-handle-${nodeId}`)?.classList.remove('keyboard-dragging');
    }
    
    this.activeDragNodeId.set(null);
    this.activeDragParentId.set(null);
    this.activeDragIndex.set(0);
    this.targetIndex.set(0);
  }
  
  private _getNodeLabel(nodeId: string): string {
    const node = this.schemaService.getNode(nodeId);
    return node?.label || node?.type || 'Component';
  }
  
  private _getSiblingCount(): number {
    const parentId = this.activeDragParentId();
    const schema = this.schemaService.schema();
    
    if (!parentId) {
      return schema.components.length;
    }
    
    const parent = this.schemaService.getNode(parentId);
    if (parent && 'components' in parent) {
      return (parent as any).components.length;
    }
    
    return 0;
  }
  
  private _announce(message: string): void {
    // Use ARIA live region
    const liveRegion = document.getElementById('builder-live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }
}
```

**ARIA Live Region:**

```typescript
// Add to FormBuilderComponent
@Component({
  selector: 'vi-form-builder',
  template: `
    <!-- Existing builder UI -->
    
    <!-- ARIA Live Region for announcements -->
    <div 
      id="builder-live-region"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only">
    </div>
  `,
  styles: [`
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
  `]
})
```

**Acceptance Criteria:**
- ✅ Space key on drag handle activates keyboard DnD
- ✅ Arrow Up/Down moves item in list
- ✅ Space key drops item at target position
- ✅ Escape cancels DnD operation
- ✅ ARIA live announcements for all actions
- ✅ Visual indication during keyboard drag
- ✅ Undo/redo works with keyboard moves

**Estimated Effort:** 3 days

---

#### Task 6.4: Accessibility Audit & Remediation

**Location:** Full builder accessibility review

**Requirements:**
- All interactive elements keyboard accessible
- Proper ARIA labels and roles
- Focus indicators visible
- Color contrast WCAG 2.1 AA compliant
- No WAVE/axe errors
- Screen reader testing (NVDA/JAWS)

**Checklist:**

```markdown
### Keyboard Navigation
- [ ] Tab order logical and complete
- [ ] All buttons/links reachable via keyboard
- [ ] Drag handles have Space key handler
- [ ] Modal dialogs trap focus
- [ ] Escape closes modals/drawer
- [ ] No keyboard traps

### ARIA
- [ ] Drag handles: `role="button"`, `aria-label="Drag to reorder"`
- [ ] Drop zones: `aria-label="Drop zone"`
- [ ] Canvas nodes: `aria-label="Component: [type]"`
- [ ] Properties panel: `aria-label="Component settings"`
- [ ] Live region for DnD announcements
- [ ] Modal dialogs: `role="dialog"`, `aria-modal="true"`
- [ ] Form fields: proper `aria-labelledby` / `aria-describedby`

### Visual
- [ ] Focus indicators visible (2px outline, 3:1 contrast)
- [ ] All text 4.5:1 contrast (WCAG AA)
- [ ] No information conveyed by color alone
- [ ] Icon buttons have text labels or `aria-label`

### Screen Reader Testing
- [ ] NVDA (Windows): Navigate full builder
- [ ] JAWS (Windows): Navigate full builder
- [ ] VoiceOver (macOS): Navigate full builder
- [ ] All actions announced correctly
- [ ] No unlabeled controls

### Tools
- [ ] WAVE extension: 0 errors
- [ ] axe DevTools: 0 violations
- [ ] Lighthouse Accessibility: 100 score
```

**Remediation Examples:**

```typescript
// Add ARIA labels to drag handles
<button 
  class="drag-handle"
  role="button"
  aria-label="Drag to reorder {{ schema().label }}"
  tabindex="0"
  (keydown)="handleDragKeyDown($event)">
  ⋮⋮
</button>

// Add ARIA to drop zones
<div 
  class="drop-zone"
  role="region"
  aria-label="Drop zone {{ index() === 0 ? 'before' : 'after' }} {{ label() }}">
</div>

// Add ARIA to modals
<div 
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description">
  <h2 id="modal-title">Edit Rule</h2>
  <p id="modal-description">Configure validation rule parameters</p>
</div>
```

**Acceptance Criteria:**
- ✅ All interactive elements keyboard accessible
- ✅ WAVE reports 0 errors
- ✅ axe DevTools reports 0 violations
- ✅ Lighthouse Accessibility score 100
- ✅ NVDA/JAWS/VoiceOver testing complete
- ✅ Focus indicators visible and compliant
- ✅ Color contrast WCAG 2.1 AA

**Estimated Effort:** 4 days

---

### Phase 6 Summary

**Total Duration:** Week 11-12 (10 days)

**Deliverables:**
- ✅ `<vi-drawer>` web component with full feature set
- ✅ Properties panel uses drawer on narrow viewports
- ✅ Keyboard drag-and-drop with Space + arrows
- ✅ ARIA live announcements for all DnD actions
- ✅ Full accessibility audit complete
- ✅ WCAG 2.1 AA compliant
- ✅ Screen reader tested (NVDA/JAWS/VoiceOver)

**Validation:**
```bash
# Keyboard Navigation Test
1. Tab through entire builder
2. Reach drag handle with Tab
3. Press Space → DnD mode activates
4. Press Arrow Down → item moves down
5. Press Space → item drops
6. Press Escape on next drag → cancels

# Screen Reader Test (NVDA)
1. Start NVDA
2. Navigate builder with arrow keys
3. Verify all components announced
4. Verify drag announcements heard
5. Verify form field labels clear

# Tool Tests
1. Install WAVE extension
2. Scan builder page → 0 errors
3. Install axe DevTools
4. Run audit → 0 violations
5. Lighthouse → Accessibility 100

# Drawer Test
1. Resize browser to 600px width
2. Click component → drawer opens from right
3. Click backdrop → drawer closes
4. Press Escape → drawer closes
```

---

## Part 3 Completion Checklist

**Phase 5:**
- [ ] Validation rules editor component
- [ ] Rule row component with actions
- [ ] Rule editor modal (built-in + JSON Logic)
- [ ] 11 built-in validators configurable
- [ ] JSON Logic mode with syntax validation
- [ ] Rule reordering (move up/down)
- [ ] Conditional editor component
- [ ] Simple conditional (when field = value)
- [ ] Advanced conditional (JSON Logic)
- [ ] Preview mode toggle
- [ ] Form preview component with validation
- [ ] Conditional evaluator service
- [ ] Live validation in preview

**Phase 6:**
- [ ] `<vi-drawer>` web component
- [ ] Drawer integration with properties panel
- [ ] Responsive mode switching (drawer vs side panel)
- [ ] Keyboard DnD service
- [ ] Space key activates DnD
- [ ] Arrow keys move items
- [ ] ARIA live region announcements
- [ ] Full accessibility audit
- [ ] WAVE 0 errors
- [ ] axe 0 violations
- [ ] Lighthouse 100 accessibility score
- [ ] Screen reader testing (NVDA/JAWS/VoiceOver)

**Integration Test (Phase 5):**
- [ ] Add required rule → preview shows error on empty submit
- [ ] Add min length rule → preview validates on blur
- [ ] Add conditional → field hides/shows based on other field
- [ ] JSON Logic conditional works
- [ ] validateOn=onBlur delays validation until blur
- [ ] validateOn=onSubmit only validates on submit

**Integration Test (Phase 6):**
- [ ] Resize to narrow viewport → drawer mode activates
- [ ] Drawer opens on component click
- [ ] Drawer closes on backdrop click
- [ ] Drawer closes on Escape
- [ ] Tab through builder reaches all controls
- [ ] Space on drag handle activates keyboard DnD
- [ ] Arrow keys move component
- [ ] Space drops component
- [ ] Screen reader announces all actions

---

## Next Steps

**Part 4: Release Preparation & Platform Phases** (Weeks 13-20+)
- Phase 7: Polish & Release (testing, Storybook, v1.0.0)
- Platform Phase 3: Compliance (audit trail, query, e-signature)
- Platform Phase 4: Persistence & Versioning (offline, draft save)

See [development-plan-part-4-release-compliance.md](development-plan-part-4-release-compliance.md) *(to be created)*

---

**END OF PART 3**
